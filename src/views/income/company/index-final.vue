<template>
  <div>
    <a-row justify="end" style="margin: 10px">
      <a-tag>行展示数量：</a-tag>
      <a-select default-value="10" style="width: 120px" @change="handlePageSizeChange">
        <a-select-option value="1">
          1
        </a-select-option>
        <a-select-option value="5">
          5
        </a-select-option>
        <a-select-option value="10">
          10
        </a-select-option>
        <a-select-option value="15">
          15
        </a-select-option>
        <a-select-option value="20">
          20
        </a-select-option>
      </a-select>
    </a-row>
    <a-row>
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
                  style="height: 100%"
                  :scroll="{x : 200,y: 200}"
                  bordered
                  size="small"
                  :rowKey='record=>record.id'
                  :pagination="false">
                  <a-tooltip slot="name" slot-scope="item" :title="col.name" trigger="hover">
                    <span style="font-family: Arial,serif;height: fit-content">{{ col.name }}</span>
                  </a-tooltip>
                  <span slot="money" slot-scope="item" style="font-family: Arial,serif">
              <a-row>
                <a-col :span="22">
                  {{ col.totalAmount }}
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
                  <template slot="nameCell" slot-scope="text, record, colIndex" style="background-color: #8492a6">
                    <editable-cell :text="text" @change="onCellChange(record, index,i,colIndex, $event,'name')"/>
                  </template>
                  <template slot="moneyCell" slot-scope="text, record,colIndex" style="background-color: #8492a6">
                    <editable-cell :text="text" @change="onCellChange(record, index,i,colIndex, $event,'money')"/>
                  </template>
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
          <div v-if="loading && !busy" class="demo-loading-container">
            <a-spin />
          </div>
        </a-list>
      </div>
    </a-row>
  </div>
  <!--  </div>-->
</template>
<script>
import {createCustomerIncomeId, fetchDetailList, upsertCstIncome} from "@/api/company";

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
      if (this.editable) {
        this.editable = false;
        console.log(this.value)
        if (this.changed) {
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
    dataIndex: 'name',
    key: 'name',
    slots: {title: 'customTitle'},
    scopedSlots: {title: 'name', customRender: 'nameCell'},
    ellipsis: true,
  },
  {
    dataIndex: 'money',
    key: 'money',
    slots: {title: 'customMoney'},
    scopedSlots: {title: 'money', customRender: 'moneyCell'},
  }
];

const actionColumns = [
  {
    dataIndex: 'action',
    key: 'action',
    scopedSlots: {customRender: 'action'},
  }
];

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
      busy: false,
      loading: false
    };
  },
  created() {
    // this.onLoadMore()
  },
  methods: {
    handlePageSizeChange(value) {
      this.listQuery.pageSize = value;
      this.listQuery.pageNum = 1;
      this.headerData = []
      this.bodyData = []
      this.busy = false;
      this.onLoadMore();
    },
    onLoadMore() {
      console.log("加载")
      this.loading = true;
      fetchDetailList(this.listQuery).then(response => {
        this.loading = false;
        console.log(response)
        let headers = response.data.headers;
        let bodies = response.data.bodies;
        console.log(headers)
        console.log(bodies)
        this.totalCount = response.data.total;
        if (headers == null || headers.length <= 0) {
          this.$message.success('您要的太多，而我已经没有了');
          this.busy = true;
        } else {
          this.$set(this.headerData, this.listQuery.pageNum - 1, headers)
          this.$set(this.bodyData, this.listQuery.pageNum - 1, bodies)
          this.listQuery.pageNum = this.listQuery.pageNum + 1;
        }
      });
    },
    onCellChange(record, listRowIndex, tableIndex, colIndex, text, dataIndex) {
      console.log(record, listRowIndex, tableIndex, colIndex, text, dataIndex)
      let header = this.headerData[listRowIndex][tableIndex];
      let body = Object.assign({}, record);
      body.comId = header.id;
      if (dataIndex === 'name') {
        body.name = text;
      } else if (dataIndex === 'money') {
        body.money = text;
      }
      console.log(header)
      console.log(body)
      upsertCstIncome(body).then(response => {
        if (response.data > 0) {
          this.querySingleByComId(header.id, listRowIndex, tableIndex);
          this.$message.success('更新成功');
        }
      })
    },
    querySingleByComId(comId, listRowIndex, tableIndex) {
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
          this.$set(this.headerData[listRowIndex], tableIndex, {})
          this.$set(this.bodyData[listRowIndex], tableIndex, [])
        } else {
          this.$set(this.headerData[listRowIndex], tableIndex, headers[0])
          this.$set(this.bodyData[listRowIndex], tableIndex, bodies[0])
          console.log(JSON.stringify(this.headerData))
          this.listQuery.pageNum = this.listQuery.pageNum + 1;
        }
      });
    },
    addChildRow(item, listRowIndex, tableIndex) {
      console.log(item, listRowIndex, tableIndex)
      if (this.bodyData[listRowIndex][tableIndex] == null) {
        this.bodyData[listRowIndex][tableIndex] = []
      }
      createCustomerIncomeId().then(response => {
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

.demo-infinite-container {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: auto;
  padding: 8px 24px;
  height: 100%;
}
.demo-loading-container {
  position: absolute;
  bottom: 40px;
  width: 100%;
  text-align: center;
}
</style>
