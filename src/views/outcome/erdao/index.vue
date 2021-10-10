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
        <el-form :inline="true" :model="topListQuery" size="small" label-width="140px">
          <el-form-item label="司机名称：">
            <el-input style="width: 203px" v-model="topListQuery.name" placeholder="司机名称"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>二道支出列表(货币以<a style="color: red">人民币</a>为单位)</span>
      <el-button
        style="float: right;margin-right: 15px"
        @click="handleAddDriver()"
        type="primary"
        size="small">
        添加
      </el-button>
    </el-card>
    <div class="table-container">
        <el-table ref="companyTable"
                  :data="driverList"
                  style="width: 100%"
                  :row-style="{height: '0'}"
                  :cell-style="{padding: '0'}"
                  @expand-change="expandChange"
                  v-el-table-infinite-scroll="driverLoad"
                  :infinite-scroll-disabled="driverBusy"
                  v-loading="driverListLoading"
                  border>

          <el-table-column type="expand">
            <template slot-scope="scope">
              <el-container>
                <el-table ref="cstTable"
                          :key="timerstamp"
                          :data="scope.row.child"
                          :row-style="{height: '0'}"
                          :cell-style="{padding: '0'}"
                          style="width: 100%;padding: 0;margin: 0"
                          v-el-table-infinite-scroll="carryDetailLoad(scope.row)"
                          :infinite-scroll-disabled="scope.row.itemBusy"
                          v-loading="scope.row.itemListLoading"
                          :row-class-name="cstRowClassName"
                          border>
                  <el-table-column label="总数" align="center">
                    <editable-cell slot-scope="{row}"
                                   :can-edit="true"
                                   v-on:blur="handleItemInputChange(scope.row,row)"
                                   v-model="row.carryAmount">
                      <span slot="content">{{ row.carryAmount }}</span>
                    </editable-cell>
                  </el-table-column>
                  <el-table-column label="事故补贴" align="center">
                    <editable-cell slot-scope="{row}"
                                   :can-edit="true"
                                   v-on:blur="handleItemInputChange(scope.row,row)"
                                   v-model="row.accidentMoney">
                      <span slot="content">{{ row.accidentMoney }}</span>
                    </editable-cell>
                  </el-table-column>
                  <el-table-column label="应付款" align="center">
                    <template slot-scope="{row}">{{ row.payableMoney }}</template>
                  </el-table-column>
                  <el-table-column label="保底价" align="center">
                    <template slot-scope="{row}">{{ row.baseMoney }}</template>
                  </el-table-column>
                  <el-table-column label="未满百补贴" align="center">
                    <template slot-scope="{row}">{{ row.overMoney }}</template>
                  </el-table-column>
                  <el-table-column label="实际付款" align="center">
                    <template slot-scope="{row}">{{ row.realMoney }}</template>
                  </el-table-column>
                  <el-table-column label="详情-操作" style="width: 20%" align="center" v-if="canEditIncome()" key='1'>
                    <template slot-scope="itemScope">
                      <p>
                        <el-button
                          size="mini"
                          type="primary"
                          v-if="showItemAdd(scope,itemScope)"
                          @click="handleAddItemIncome(scope.row)">新增
                        </el-button>
                        <el-button
                          size="mini"
                          type="danger"
                          @click="handleDeleteItem(scope, itemScope.row)">删除
                        </el-button>
                      </p>
                    </template>
                  </el-table-column>
                </el-table>
              </el-container>
            </template>
          </el-table-column>

          <el-table-column
            type="index"
            label="序号"
            width="50">
          </el-table-column>

<!--          <el-table-column label="编号" width="100" align="center">-->
<!--            <template slot-scope="scope">{{ scope.row.id }}</template>-->
<!--          </el-table-column>-->
          <el-table-column label="司机姓名" width="120" align="center">
            <editable-cell slot-scope="{row}"
                           :can-edit="true"
                           v-on:blur="handleInputChange(row)"
                           v-model="row.name">
              <span slot="content">{{ row.name }}</span>
            </editable-cell>
          </el-table-column>
          <el-table-column label="总数" align="center">
            <template slot-scope="{row}">{{ row.totalAmount }}</template>
          </el-table-column>
          <el-table-column label="手续费点数" align="center">
            <editable-cell slot-scope="{row}"
                           :can-edit="true"
                           v-on:blur="handleInputChange(row)"
                           v-model="row.profitPoint">
              <span slot="content">{{ row.profitPoint }}</span>
            </editable-cell>
          </el-table-column>
          <el-table-column label="保底价" align="center">
            <editable-cell slot-scope="{row}"
                           :can-edit="true"
                           v-on:blur="handleInputChange(row)"
                           v-model="row.baseMoney">
              <span slot="content">{{ row.baseMoney }}</span>
            </editable-cell>
          </el-table-column>
          <el-table-column label="应付款" align="center">
            <template slot-scope="{row}">{{ row.payableMoney }}</template>
          </el-table-column>
          <el-table-column label="未满百补贴" align="center">
            <template slot-scope="{row}">{{ row.overflowMoney }}</template>
          </el-table-column>
          <el-table-column label="事故赔付" align="center">
            <template slot-scope="{row}">{{ row.accidentMoney }}</template>
          </el-table-column>
          <el-table-column label="实际付款" align="center">
            <template slot-scope="{row}">{{ row.realMoney }}</template>
          </el-table-column>
          <el-table-column label="操作" width="300" align="center">
            <template slot-scope="scope">
              <p>
                <el-button
                  size="mini"
                  type="primary"
                  v-if="showComAdd(scope)"
                  @click="handleAddDriver">添加
                </el-button>
                <el-button
                  size="mini"
                  type="primary"
                  @click="handleAddItemIncome(scope.row)">新增子项
                </el-button>
                <el-button
                  size="mini"
                  type="danger"
                  @click="handleDeleteManage(scope.row)">删除
                </el-button>
              </p>
            </template>
          </el-table-column>
        </el-table>
    </div>
  </div>
</template>
<script>
import {createId,createDetailId,doDelete,doDeleteDetail,upsert, fetchDetailList, fetchList, upsertCarryDetail} from "@/api/driver";
import EditableCell from "@/components/Table/EditableCell.vue";
import elTableInfiniteScroll from 'el-table-infinite-scroll';
import img_home_today_amount from '@/assets/images/home_today_amount.png';

const defaulDriverListQuery = {
  name: null,
  id: null,
  pageNum: 1,
  pageSize: 5,
};

const defaultComRow = {
  id: null,
  name: "",
  profitPoint: 0,
  yesterdayMoney: 0,
  monthMoney: 0
}


const defaultIncomeRow = {
  id: null,
  driverId: null,
  name: "",
  money: 0
}

const defaultErdaoItemListQuery = {
  driverId: null,
  date: null,
  pageNum: 1,
  pageSize: 5,
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
  name: "erdaoOutcome",
  data() {
    return {
      tableHeight: "100px",
      driverBusy: false,
      itemBusy: false,
      operateType: null,
      topListQuery: Object.assign({}, defaulDriverListQuery),
      newComRow: Object.assign({}, defaultComRow),
      newIncomeRow: Object.assign({}, defaultIncomeRow),
      driverList: [],
      detailList: [],
      manageTotal: null,
      currComRow: null,
      drawerFirstLoad: true,
      paramsMap: new Map(),
      comCount: null,
      cstTotal: null,
      cstCount: null,
      todayMoney: null,
      date: null,
      flag: false,
      timerstamp: 0,
      showDrawerClose: false,
      drawerTitle: "默认",
      driverListLoading: true,
      selectProductCateValue: null,
      moneyTimer: null,
      img_home_today_amount,
      direction: 'ltr',
    }
  },
  mounted() {
  },
  created() {
  },
  methods: {
    expandChange(row) {
      row.listQuery = Object.assign({}, defaultErdaoItemListQuery)
      console.log(row.listQuery)
      row.cstFinished = false;
      row.itemBusy = false;
      row.cstCount = 0;
      row.child = [];
    },
    changeDate() {
      this.carryDetailLoad();
    },
    customerReset() {
      this.detailList = [];
      this.cstTotal = null;
      this.drawerFirstLoad = true;
      this.currComRow = null;
      this.detailListQuery = Object.assign({}, defaultErdaoItemListQuery);
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
    showItemAdd(scope, itemScope) {
      if (this.date != null) {
        let time = new Date().getTime();
        let str = this.dateFormat(time);
        if (!str.startsWith(this.date)) {
          return false;
        }
      }
      console.log(scope.row.cstCount,itemScope.$index)
      if (scope.row.cstCount == null) {
        scope.row.cstCount = scope.row.cstTotal;
        return true;
      }
      return itemScope.$index >= scope.row.cstCount - 1;
    },
    showComAdd(scope) {
      if (this.comCount == null) {
        this.comCount = this.manageTotal;
        return true;
      }
      return scope.$index >= this.comCount - 1;
    },
    handleInputChange(row) {
      upsert(row).then(response => {
        if (response.data > 0) {
          this.$message.success('更新成功');
        }
      })
    },
    handleItemInputChange(prow, row) {
      row.driverId = prow.id;
      upsertCarryDetail(row).then(response => {
        if (response.data > 0) {
          this.$message.success('更新成功');
          this.calItem(row)
          this.calDriver(prow)
        }
      })
    },
    calDriver(prow) {
      let driverQuery = Object.assign({},defaulDriverListQuery);
      driverQuery.id = prow.id;
      fetchList(driverQuery).then(response => {
        let list1 = response.data.data;
        this.comTotal = response.data.total;
        if (list1 == null || list1.length <= 0) {
          this.$message.success('您要的太多，而我已经没有了');
        } else if(list1.length > 0){
          prow.accidentMoney = list1[0].accidentMoney;
          prow.baseMoney = list1[0].baseMoney;
          prow.overflowMoney = list1[0].overflowMoney;
          prow.payableMoney = list1[0].payableMoney;
          prow.profitPoint = list1[0].profitPoint;
          prow.realMoney = list1[0].realMoney;
          prow.totalAmount = list1[0].totalAmount;
        }
      });
    },
    calItem(row) {
      if(row.carryAmount != null && row.profitPoint != null){
        row.payableMoney = row.carryAmount * row.profitPoint;
      }
      if(row.payableMoney != null && row.baseMoney != null){
        row.overMoney = row.baseMoney - row.payableMoney;
        if(row.overMoney < 0){
          row.overMoney = 0;
        }
      }
      if(row.baseMoney != null && row.payableMoney != null){
        row.realMoney = row.payableMoney < row.baseMoney ? row.baseMoney : row.payableMoney;
        if(row.accidentMoney != null){
          row.realMoney =  row.realMoney -  row.accidentMoney;
        }
      }
      this.timerstamp = new Date().valueOf();
      console.log(row)
    },
    cstRowClassName({row, rowIndex}) {
      if (rowIndex % 2 === 1) {
        return 'warning-row';
      } else if (rowIndex % 2 === 0) {
        return 'success-row';
      }
      return '';
    },
    driverLoad() {
      this.driverListLoading = true;
      this.driverBusy = true;
      fetchList(this.topListQuery).then(response => {
        this.driverListLoading = false;
        let list1 = response.data.data;
        this.manageTotal = response.data.total;
        console.log(list1)
        if (list1 == null || list1.length <= 0) {
          this.$message.success('您要的太多，而我已经没有了');
        }
        console.log(this.driverList)
        if (this.topListQuery.pageNum === 1) {
          this.driverList = list1;
          console.log(this.driverList)
        } else {
          this.driverList = this.driverList.concat(list1);
          console.log(this.driverList)
        }
        this.topListQuery.pageNum = this.topListQuery.pageNum + 1;
      });
      this.driverBusy = false;
    },
    carryDetailLoad(row) {
      console.log(row.listQuery)
      if (row.cstFinished) {
        row.itemListLoading = false;
        return;
      }
      row.itemListLoading = true;
      row.listQuery.driverId = row.id;
      row.listQuery.date = this.date;
      row.itemBusy = true;
      fetchDetailList(row.listQuery).then(response => {
        row.itemListLoading = false;
        let list1 = response.data.data;
        row.cstTotal = response.data.total;
        if (list1 == null || list1.length <= 0) {
          this.$message.success('您要的太多，而我已经没有了');
          row.cstFinished = true;
        }
        if (row.listQuery.pageNum === 1) {
          row.child = list1;
        } else {
          row.child = row.child.concat(list1);
        }
        row.listQuery.pageNum = row.listQuery.pageNum + 1;
        row.itemBusy = false;
        row.itemListLoading = false;
        this.timerstamp = new Date().valueOf();
        row.cstCount = row.cstTotal;
        console.log(row.listQuery)
      });
    },
    handleSearchList() {
      this.topListQuery.pageNum = 1;
      this.driverLoad();
    },
    handleAddDriver() {
      //新增一条表记录，获取一个id
      createId().then(response => {
        let id = response.data
        let newRow = {};
        Object.assign(newRow, this.newComRow);
        newRow.id = id;
        this.driverList.push(newRow);
        this.comCount++;
      })
      // this.$router.push({path: '/pms/addProduct'});
    },
    handleAddItemIncome(row) {
      //新增一条表记录，获取一个id
      createDetailId().then(response => {
        let id = response.data
        let newRow = {};
        Object.assign(newRow, defaultIncomeRow);
        newRow.id = id;
        newRow.driverId = row.id;
        newRow.profitPoint = row.profitPoint;
        newRow.baseMoney = row.baseMoney;
        row.child.push(newRow);
        row.cstCount++;
      })
      // this.$router.push({path: '/pms/addProduct'});
    },
    handleResetSearch() {
      this.selectProductCateValue = [];
      this.topListQuery = Object.assign({}, defaulDriverListQuery);
      this.handleSearchList();
    },
    handleDeleteManage(row) {
      this.$confirm('是否要进行删除操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        doDelete(row.id).then(response => {
          if (response != null && response.data) {
            this.$message.success("删除成功");
            this.driverList.splice(
              this.driverList.find(order => {
                return order.id === id;
              }), 1);
          }
        })
        this.comCount--;
      });
    },
    handleDeleteItem(pscope,row) {
      let id = row.id;
      this.$confirm('是否要进行删除操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log("删除")
        doDeleteDetail(id).then(response => {
          if (response != null && response.data) {
            this.$message.success("删除成功");
            pscope.row.child.splice(
              pscope.row.child.find(order => {
                let f = order.id === id;
                if(f){
                  this.calDriver(pscope.row)
                }
                return f;
              }), 1);
          }
        })
      });
    }
  }
}
</script>
<style>
.el-table .warning-row {
  background: oldlace;
}

.el-table .success-row {
  background: #f0f9eb;
}

.el-table .item-warning-row {
  background: grey;
}

.el-table .item-success-row {
  background: #d6e9c6;
}

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

.el-table .el-table__expanded-cell{
  padding: 5px;
  margin: 5px;
}

.customer-size {
  padding: 10px;
  margin: 5px;
  width: 100%;
  height: 50px;
  font-size: 24px;
}
</style>


