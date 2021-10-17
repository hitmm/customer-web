<template>
  <div
    v-infinite-scroll="onLoadMore"
    class="demo-infinite-container"
    :infinite-scroll-disabled="busy"
    :infinite-scroll-distance="10">
    <a-list
      :data-source="headerData"
      :split="false">
      <div
        v-if="loadMore"
        slot="loadMore"
        :style="{ textAlign: 'center', marginTop: '12px', height: '32px', lineHeight: '32px' }">
        <a-spin v-if="loadingMore"/>
        <a-button v-else @click="onLoadMore">
          加载更多
        </a-button>
      </div>
      <a-list-item
        slot="renderItem"
        slot-scope="item, index"
        :split="false"
        style="padding: 0;margin: 0;align-items: flex-start;">
        <div v-model="item" v-for="(col,i) in item" style="align-items: flex-start;">
          <a-table
            :columns="columns"
            :data-source="bodyData[index][i]"
            style="width:300px;height: 100%"
            :scroll="{x : 200,y: 200}"
            bordered
            size="small"
            :rowKey='record=>record.id'
            :pagination="false">
            <a-popover slot="name" slot-scope="item" :title="col.name" trigger="hover">
              <span style="font-family: Arial,serif;height: fit-content">{{ col.name }}</span>
              <template slot="content">
                <a style="font-family: Arial,serif;height: fit-content">保底价：￥{{ col.baseMoney }}</a><br/>
                <a style="font-family: Arial,serif;height: fit-content">点数：{{ col.profitPoint }}</a><br/>
                <a style="font-family: Arial,serif;height: fit-content">未满百：￥{{ col.overflowMoney }}</a><br/>
                <a style="font-family: Arial,serif;height: fit-content">总支付：￥{{ col.realMoney }}</a>
              </template>
            </a-popover>
            <a-tooltip slot="baseMoney" slot-scope="item" title="表头为保底价，列数据为未满百补贴数据" trigger="hover">
              <span style="font-family: Arial,serif;height: fit-content">保底价:￥{{ col.baseMoney }}</span>
            </a-tooltip>
            <a-tooltip slot="money" slot-scope="item" title="表头为总数，列数据为实际金额" trigger="hover">
            <span style="font-family: Arial,serif">
              <a-row>
                <a-col :span="22">
                  总数:￥{{ col.totalAmount }}
                </a-col>
                <a-col :span="2">
                  <a-button
                    shape="circle"
                    icon="plus"
                    size="small"
                    @click="addChildRow(item,index,i)"
                  />
                </a-col>
              </a-row>
            </span>
            </a-tooltip>
            <template slot="carryAmountCell" slot-scope="text, record, colIndex">
              <editable-cell :text="text" @change="onCellChange(record, index,i,colIndex, $event,'carryAmount')"/>
            </template>
            <template slot="accidentMoneyCell" slot-scope="text, record, colIndex">
              <editable-cell :text="text" @change="onCellChange(record, index,i,colIndex, $event,'accidentMoney')"/>
            </template>
            <span  slot="realMoneyCell" slot-scope="text, record, colIndex">{{ text }}</span>
          </a-table>
        </div>
        <a-table
          :columns="actionColumns"
          size="small"
          style="width: 100%;height: 50%"
          :pagination="false">
          <span slot="action" slot-scope="text, record">
              <a>Invite 一 {{ record.$index }}</a>
          </span>
        </a-table>
      </a-list-item>
    </a-list>
  </div>
  <!--  </div>-->
</template>
<script>
import {createId,createDetailId,doDelete,upsertCarryDetail,upsert, fetchDetailList} from "@/api/driver";

const EditableCell = {
  template: `
    <div style="width: 100%;height: 100%">
    <div class="editable-cell" @mouseleave="check">
    <div v-if="editable" class="editable-cell-input-wrapper" @blur="check">
      <a-input :value="value" @change="handleChange" @pressEnter="check" @blur="check"/>
    </div>
    <div v-else class="editable-cell-text-wrapper" @dblclick="edit">
      {{ value || ' ' }}
    </div>
    </div>
    </div>
  `,
  props: {
    text: [String, Number],
  },
  data() {
    return {
      value: this.text,
      editable: false,
      changed: false,
    };
  },
  methods: {
    handleChange(e) {
      this.value = e.target.value.toString();
      this.changed = true;
    },
    check() {
      if(this.editable){
        this.editable = false;
        console.log(this.value)
        if(this.changed){
          this.$emit('change', this.value);
        }
      }
    },
    edit() {
      this.editable = true;
      this.changed = false;
    },
  },
};

const columns = [
  {
    dataIndex: 'carryAmount',
    key: 'carryAmount',
    slots: {title: 'customCarryAmount'},
    scopedSlots: {title: 'name', customRender: 'carryAmountCell'},
    ellipsis: true,
  },
  {
    dataIndex: 'accidentMoney',
    key: 'accidentMoney',
    slots: {title: 'accidentMoney'},
    scopedSlots: {title: 'baseMoney', customRender: 'accidentMoneyCell'},
  },
  {
    dataIndex: 'realMoney',
    key: 'realMoney',
    slots: {title: 'realMoney'},
    scopedSlots: {title: 'money', customRender: 'realMoneyCell'},
  }
];

const actionColumns = [
  {
    dataIndex: 'action',
    key: 'action',
    scopedSlots: {customRender: 'action'},
  }
];

const defaultHeaderData = [];
const defaultBodyData = [];

const defaultComListQuery = {
  name: null,
  cstName: null,
  pageNum: 1,
  pageSize: 10,
};

export default {
  components: {
    EditableCell,
  },
  data() {
    return {
      totalCount: 0,
      columns,
      //是否在加载中
      loadingMore: false,
      //是否有数据可以加载
      loadMore: true,
      actionColumns,
      headerData: [],
      bodyData: [],
      listQuery: Object.assign({}, defaultComListQuery),
      busy: false
    };
  },
  created() {
    // this.onLoadMore()
  },
  methods: {
    onLoadMore() {
      this.busy = true;
      fetchDetailList(this.listQuery).then(response => {
        this.busy = false;
        console.log(response)
        let headers = response.data.headers;
        let bodies = response.data.bodies;
        console.log(headers)
        console.log(bodies)
        this.totalCount = response.data.total;
        if (headers == null || headers.length <= 0) {
          this.$message.success('您要的太多，而我已经没有了');
        } else {
          this.$set(this.headerData,this.listQuery.pageNum-1,headers)
          this.$set(this.bodyData,this.listQuery.pageNum-1,bodies)
          this.listQuery.pageNum = this.listQuery.pageNum + 1;
        }
      });
    },
    onCellChange(record, listRowIndex,tableIndex,colIndex,text,dataIndex) {
      console.log(record, listRowIndex,tableIndex,colIndex,text,dataIndex)
      let header = this.headerData[listRowIndex][tableIndex];
      let body = Object.assign({},record);
      body.driverId = header.id;
      if(dataIndex === 'carryAmount'){
        body.carryAmount = text;
      }else if(dataIndex === 'accidentMoney'){
        body.accidentMoney = text;
      }
      console.log(header)
      console.log(body)
      upsertCarryDetail(body).then(response=>{
        if (response.data > 0) {
          this.querySingleByComId(header.id,listRowIndex,tableIndex);
          this.$message.success('更新成功');
        }
      })
    },
    querySingleByComId(comId, listRowIndex,tableIndex){
      let query = {
        pageNum: 1,
        pageSize: 10,
      };
      query.id = comId;
      fetchDetailList(query).then(response => {
        console.log(response)
        let headers = response.data.headers;
        let bodies = response.data.bodies;
        this.totalCount = response.data.total;
        if (headers == null || headers.length <= 0) {
          this.$set(this.headerData[listRowIndex],tableIndex,{})
          this.$set(this.bodyData[listRowIndex],tableIndex,[])
        } else {
          this.$set(this.headerData[listRowIndex],tableIndex,headers[0])
          this.$set(this.bodyData[listRowIndex],tableIndex,bodies[0])
          console.log(JSON.stringify(this.headerData))
          this.listQuery.pageNum = this.listQuery.pageNum + 1;
        }
      });
    },
    addChildRow(item, listRowIndex,tableIndex) {
      console.log(item,listRowIndex,tableIndex)
      if (this.bodyData[listRowIndex][tableIndex] == null) {
        this.bodyData[listRowIndex][tableIndex] = []
      }
      createDetailId().then(response=>{
        let id = response.data
        console.log(id)
        let newRow = {
          id: 0,
          name: "",
          money: 0
        };
        newRow.id = id;
        this.bodyData[listRowIndex][tableIndex].push(newRow);
      })
    }
  }
};
</script>
<style>
.editable-cell {
  position: relative;
  width: 100%;
  border: 1px dashed #409eff;
}

.editable-cell-input-wrapper,
.editable-cell-text-wrapper {
  width: 100%;
  height: 20%;
}

.editable-cell-text-wrapper {
  width: 100%;
  height: 20px;
  line-height: 18px;
}

.editable-cell-icon,
.editable-cell-icon-check {
  position: absolute;
  right: 0;
  width: 20px;
  cursor: pointer;
}

.editable-cell-icon {
  line-height: 18px;
  display: none;
}

.editable-cell-icon-check {
  line-height: 28px;
}

.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}

.editable-cell-icon:hover,
.editable-cell-icon-check:hover {
  color: #108ee9;
}

.editable-add-btn {
  margin-bottom: 8px;
}
</style>
