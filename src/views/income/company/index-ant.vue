<template> 
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button
          style="float: right"
          @click="handleSearchList()"
          type="primary"
          size="small">
          查询结果
        </el-button>
        <el-button
          style="float: right;margin-right: 15px"
          @click="handleResetSearch()"
          size="small">
          重置
        </el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="comListQuery" size="small" label-width="140px">
          <el-form-item label="公司名称：">
            <el-input style="width: 203px" v-model="comListQuery.name" placeholder="客户公司名称"></el-input>
          </el-form-item>
          <el-form-item label="客户名称：">
            <el-input style="width: 203px" v-model="comListQuery.cstName" placeholder="客户名称"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>客户公司列表</span>
      <el-button
        style="float: right;margin-right: 15px"
        @click="handleAddCom()"
        type="primary"
        size="small">
        添加
      </el-button>
    </el-card>
    <div class="table-container">
      <a-table
        rowKey="id"
        :columns="columns"
        :data-source="companyList"
        :pagination="false"
        class="components-table-demo-nested">
        <a slot="operation" slot-scope="text,record,index">
          <a-button type="primary" v-if="showComAdd(text,record,index)">
            添加
          </a-button>
        </a>
        <template slot="name" slot-scope="text, record">
          <editable-cell :text="text" @change="onCellChange(record.key, 'name', $event)"/>
        </template>
        <a-table
          rowKey="id"
          slot="expandedRowRender"
          slot-scope="text,record,index"
          immediate-check="false"
          v-infinite-scroll="customerLoad(text,record,index)"
          :infinite-scroll-disabled="cstBusy"
          :columns="innerColumns"
          :data-source="cstList"
          :pagination="false"
        >
            <span slot="operation" slot-scope="text" class="table-operation">

            </span>
        </a-table>
      </a-table>
      <div
        v-if="showLoadingMore"
        slot="loadMore"
        :style="{ textAlign: 'center', marginTop: '12px', height: '32px', lineHeight: '32px' }"
      >
        <a-spin v-if="loadingMore"/>
        <a-button v-else @click="onLoadMore">
          loading more
        </a-button>
      </div>
    </div>
  </div>
</template>
<script>
import {doDelete, fetchCstList, fetchList, getTodayMoney, upsertCstIncome} from "@/api/company";
import {createId} from "@/api/primaryutils";
// import EditableCell from "@/components/Table/EditableCell.vue";
import elTableInfiniteScroll from 'el-table-infinite-scroll';
import img_home_today_amount from '@/assets/images/home_today_amount.png';
import {upsert} from "../../../api/company";

const columns = [
  {title: '序号', dataIndex: 'id', key: 'id'},
  {title: '公司名称', dataIndex: 'name', key: 'name', scopedSlots: {customRender: 'name'}},
  {title: '点数', dataIndex: 'backPoint', key: 'backPoint'},
  {title: '客户数量', dataIndex: 'staffNum', key: 'staffNum'},
  {title: '赔付', dataIndex: 'pay', key: 'pay'},
  {title: '没人领', dataIndex: 'unclaimed', key: 'unclaimed'},
  {title: '踩', dataIndex: 'stamp', key: 'stamp'},
  {title: '操作', key: 'operation', scopedSlots: {customRender: 'operation'}},
];

const innerColumns = [
  {title: '客户名称', dataIndex: 'cstName', key: 'cstName'},
  {title: '金额', dataIndex: 'money', key: 'money'},
  {
    title: '操作',
    key: 'operation',
    scopedSlots: {customRender: 'operation'},
  },
];

const defaultComListQuery = {
  name: null,
  cstName: null,
  pageNum: 1,
  pageSize: 5,
};

const defaultComRow = {
  id: null,
  name: "",
  backPoint: 0,
  yesterdayMoney: 0,
  monthMoney: 0
}


const defaultIncomeRow = {
  id: null,
  name: "",
  money: 0
}

const defaultInComeListQuery = {
  companyId: null,
  date: null,
  pageNum: 1,
  pageSize: 5,
};

const EditableCell = {
  template: `
    <div class="editable-cell">
    <div v-if="editable" class="editable-cell-input-wrapper">
      <a-input :value="value" @blur="blur" @change="handleChange" @pressEnter="check"/>
      <a-icon
        type="check"
        class="editable-cell-icon-check"
        @click="check"
      />
    </div>
    <div v-else class="editable-cell-text-wrapper" @click="edit">
      {{ value || ' ' }}
      <a-tooltip slot="suffix" title="点击可编辑">
        <a-icon type="info-circle" style="color: rgba(0,0,0,.45)"/>
      </a-tooltip>
    </div>
    </div>
  `,
  props: {
    text: String,
  },
  data() {
    return {
      value: this.text,
      editable: false,
    };
  },
  methods: {
    handleChange(e) {
      this.value = e.target.value;
    },
    blur() {
      this.editable = false;
      this.$emit('blur', this.value);
    },
    check() {
      this.editable = false;
      this.$emit('change', this.value);
    },
    edit() {
      this.editable = true;
    },
  },
};

export default {
  components: {
    EditableCell
  },
  directives: {
    'el-table-infinite-scroll': elTableInfiniteScroll,
    // 注册一个局部的自定义指令 v-focus
    focus: {
      // 指令的定义
      inserted: function (el) {
        // 聚焦元素
        el.querySelector('input').focus()
      }
    }
  },
  name: "companyList",
  data() {
    return {
      tableHeight: "100px",
      comBusy: false,
      cstBusy: false,
      showLoadingMore: true,
      loadingMore: false,
      operateType: null,
      comListQuery: Object.assign({}, defaultComListQuery),
      cstListQuery: Object.assign({}, defaultInComeListQuery),
      newComRow: Object.assign({}, defaultComRow),
      newIncomeRow: Object.assign({}, defaultIncomeRow),
      companyList: null,
      cstList: null,
      comTotal: null,
      currComRow: null,
      drawerFirstLoad: true,
      comCount: null,
      cstTotal: null,
      cstCount: null,
      todayMoney: null,
      date: null,
      flag: false,
      showDrawerClose: false,
      drawerTitle: "默认",
      comListLoading: true,
      cstListLoading: true,
      selectProductCateValue: null,
      multipleSelection: [],
      productCateOptions: [],
      brandOptions: [],
      drawer: false,
      moneyTimer: null,
      img_home_today_amount,
      direction: 'ltr',
      columns,
      innerColumns,
    }
  },
  mounted() {
    this.companyLoad();
  },
  created() {
  },
  methods: {
    onLoadMore() {
      this.loadingMore = true;
      this.companyLoad();
    },
    onCellChange(key, dataIndex, value) {
      console.log(key)
      const dataSource = [...this.dataSource];
      const target = dataSource.find(item => item.key === key);
      if (target) {
        target[dataIndex] = value;
        this.dataSource = dataSource;
      }
    },
    timerLoading() {
      if (this.currComRow == null) {
        return;
      }
      let comId = this.currComRow.id;
      let params = {"id": comId, "pageNum": 1, "pageSize": 1}
      getTodayMoney(params).then(response => {
        let data = response.data.data;
        if (data.length > 0) {
          this.todayMoney = data[0].todayMoney;
        } else {
          this.todayMoney = null;
        }
      });
    },
    changeDate() {
      this.drawerFirstLoad = true;
      console.log("日期改变")
      this.customerLoad();
    },
    showDrawer(row) {
      this.drawer = true;
      this.customerReset()
      console.log(this.currComRow)
      this.currComRow = row;
      this.cstTotal = row.cstCount;
      this.cstCount = row.cstCount;
      this.todayMoney = row.todayMoney;
      this.drawerTitle = row.name + "公司详细客户信息";

      this.moneyTimer = setInterval(() => {
        console.log(1)
        this.timerLoading()
      }, 5000)
    },
    customerReset() {
      this.cstList = [];
      this.cstTotal = null;
      this.drawerFirstLoad = true;
      this.currComRow = null;
      this.cstListQuery = Object.assign({}, defaultInComeListQuery);
    },
    dateFormat(time) {
      let date = new Date(time);
      let year = date.getFullYear();
      /* 在日期格式中，月份是从0开始的，因此要加0
       * 使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
       * */
      var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
      var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
      var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
      var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
      var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
      // 拼接
      return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    },
    canEditIncome() {
      if (this.date != null) {
        let time = new Date().getTime();
        let str = this.dateFormat(time);
        if (!str.startsWith(this.date)) {
          return false;
        }
      }
      return true;
    },
    showCstAdd(scope) {
      if (this.date != null) {
        let time = new Date().getTime();
        let str = this.dateFormat(time);
        if (!str.startsWith(this.date)) {
          return false;
        }
      }
      if (this.cstCount == null) {
        this.cstCount = this.cstTotal;
        return true;
      }
      return scope.$index >= this.cstCount - 1;
    },
    showComAdd(text, record, index) {
      if (this.comCount == null) {
        this.comCount = this.companyList.length;
        return true;
      }
      console.log(text.id + "-" + index + "-" + this.comCount);
      return index >= this.comCount - 1;
    },
    handleClose(done) {
      this.customerReset();
      clearInterval(this.moneyTimer);
      console.log("已关闭")
      done();
    },
    handleInputChange(row) {
      console.log(row)
      let com = Object.assign({}, this.newComRow);
      com.id = row.id
      com.name = row.name
      com.backPoint = row.backPoint
      upsert(com).then(response => {
        if (response.data > 0) {
          this.$message.success('更新成功');
        }
      })
    },
    handleCstInputChange(row) {
      let com = Object.assign({}, this.newIncomeRow);
      com.id = row.id
      com.cstName = row.cstName
      com.money = row.money
      com.comId = this.currComRow.id;
      console.log(com)
      upsertCstIncome(com).then(response => {
        if (response.data > 0) {
          this.$message.success('更新成功');
        }
      })
    },
    tableRowClassName({row, rowIndex}) {
      if (rowIndex === 1) {
        return 'warning-row';
      } else if (rowIndex === 3) {
        return 'success-row';
      }
      return '';
    },
    companyLoad() {
      this.comListLoading = true;
      this.comBusy = true;
      console.log(this.comListQuery)
      fetchList(this.comListQuery).then(response => {
        this.comListLoading = false;
        let list1 = response.data.data;
        this.comTotal = response.data.total;
        console.log(list1)
        if (list1 == null || list1.length <= 0) {
          this.$message.success('您要的太多，而我已经没有了');
          this.showLoadingMore = false;
        }
        console.log(this.companyList)
        if (this.comListQuery.pageNum === 1) {
          this.companyList = list1;
        } else {
          this.companyList = this.companyList.concat(list1);
        }
        this.comListQuery.pageNum = this.comListQuery.pageNum + 1;
      });
      this.comBusy = false;
    },
    customerLoad(text, record, index) {
      this.cstListLoading = true;
      this.cstBusy = true;
      this.cstListQuery.companyId = text.id;
      this.cstListQuery.date = this.date;
      console.log(this.cstListQuery)
      fetchCstList(this.cstListQuery).then(response => {
        this.cstListLoading = false;
        this.drawerFirstLoad = false;
        let list1 = response.data;
        if (list1 == null || list1.length <= 0) {
          this.$message.success('您要的太多，而我已经没有了');
        }
        if (this.cstListQuery.pageNum === 1) {
          this.cstList = list1;
        } else {
          this.cstList = this.cstList.concat(list1);
        }
        this.cstListQuery.pageNum = this.cstListQuery.pageNum + 1;
        this.cstTotal = this.currComRow.staffNum;
        console.log(this.cstList)
      });
      this.cstBusy = false;
    },
    handleSearchList() {
      this.comListQuery.pageNum = 1;
      this.comListLoading = true;
      fetchList(this.comListQuery).then(response => {
        this.comListLoading = false;
        console.log(this.companyList)
        let list1 = response.data.data;
        this.comTotal = response.data.total;
        this.comCount = this.comTotal
        console.log(list1)
        if (list1 == null || list1.length <= 0) {
          this.$message.success('您要的太多，而我已经没有了');
        }
        console.log(this.companyList)
        if (this.comListQuery.pageNum === 1) {
          this.companyList = list1;
          console.log(this.companyList)
        } else {
          this.companyList = this.companyList.concat(list1);
          console.log(this.companyList)
        }
        this.comListQuery.pageNum = this.comListQuery.pageNum + 1;
      });
    },
    handleAddCom() {
      //新增一条表记录，获取一个id
      createId().then(response => {
        console.log(response)
        let id = response.data
        let newRow = {};
        Object.assign(newRow, this.newComRow);
        newRow.id = id;
        this.companyList.push(newRow);
        this.comCount++;
      })
      // this.$router.push({path: '/pms/addProduct'});
    },
    handleAddCstIncome() {
      //新增一条表记录，获取一个id
      createId().then(response => {
        console.log(response)
        let id = response.data
        let newRow = {};
        Object.assign(newRow, this.newIncomeRow);
        newRow.id = id;
        this.cstList.push(newRow);
        this.cstCount++;
      })
      // this.$router.push({path: '/pms/addProduct'});
    },
    handleResetSearch() {
      this.selectProductCateValue = [];
      this.comListQuery = Object.assign({}, defaultComListQuery);
    },
    handleDeleteCom(row) {
      this.$confirm('是否要进行删除操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        doDelete(row.id).then(response => {
          if (response != null && response.data) {
            this.$message.success("删除成功");
            this.companyList.splice(
              this.companyList.find(order => {
                return order.id === id;
              }), 1);
          }
        })
        this.comCount--;
      });
    }
  }
}
</script>
<style>
.header {
  width: 100%;
  height: 70px;
  background-color: #B3C0D1;
}

.picker-time {
  height: 70px;
  padding-top: 20px;
  text-align: center;
  vertical-align: auto;
}

.total-frame {
  border: 1px solid #DCDFE6;
  padding: 15px;
  height: 70px;
}

.total-icon {
  color: #409EFF;
  width: 40px;
  height: 40px;
}

.total-title {
  position: relative;
  font-size: 16px;
  color: #909399;
  left: 70px;
  top: -50px;
}

.total-value {
  position: relative;
  font-size: 18px;
  color: #606266;
  left: 70px;
  top: -40px;
}

.customer-size {
  padding: 10px;
  margin: 5px;
  width: 100%;
  height: 50px;
  font-size: 24px;
}

.editable-cell {
  position: relative;
}

.editable-cell-input-wrapper,
.editable-cell-text-wrapper {
  padding-right: 24px;
}

.editable-cell-text-wrapper {
  padding: 5px 24px 5px 5px;
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


