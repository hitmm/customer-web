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
        <el-table ref="companyTable"
                  :data="companyList"
                  style="width: 100%"
                  :row-style="{height: '0'}"
                  :cell-style="{padding: '0'}"
                  @expand-change="expandChange"
                  v-el-table-infinite-scroll="companyLoad"
                  :infinite-scroll-disabled="comBusy"
                  v-loading="comListLoading"
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
                          v-el-table-infinite-scroll="customerLoad(scope.row)"
                          :infinite-scroll-disabled="scope.row.cstBusy"
                          v-loading="scope.row.cstListLoading"
                          :row-class-name="cstRowClassName"
                          border>
                  <el-table-column label="详情-客户名称" style="width: 50%" align="center">
                    <editable-cell slot-scope="{row}"
                                   :can-edit="true"
                                   v-on:blur="handleCstInputChange(scope.$index,scope.row,row)"
                                   v-model="row.name">
                      <span slot="content">{{ row.name }}</span>
                    </editable-cell>
                  </el-table-column>
                  <el-table-column label="详情-收入(人民币)" style="width: 30%" align="center">
                    <editable-cell slot-scope="{row}"
                                   :can-edit="true"
                                   v-on:change="handleCstInputChange(scope.$index,scope.row,row)"
                                   v-model="row.money">
                      <span slot="content">{{ row.money }}</span>
                    </editable-cell>
                  </el-table-column>
                  <el-table-column label="详情-操作" style="width: 20%" align="center" v-if="canEditIncome()" key='1'>
                    <template slot-scope="itemScope">
                      <p>
                        <el-button
                          size="mini"
                          type="primary"
                          v-if="showCstAdd(scope,itemScope)"
                          @click="handleAddCstIncome(scope.row)">新增
                        </el-button>
                        <el-button
                          size="mini"
                          type="danger"
                          @click="handleIncomeDelete(scope,itemScope.row)">删除
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
          <el-table-column label="公司名称" width="120" align="center">
            <editable-cell slot-scope="scope"
                           :can-edit="true"
                           v-on:blur="handleInputChange(scope.$index,scope.row)"
                           v-model="scope.row.name">
              <span slot="content">{{ scope.row.name }}</span>
            </editable-cell>
          </el-table-column>
          <el-table-column label="点数" align="center">
            <editable-cell slot-scope="scope"
                           :can-edit="true"
                           v-on:blur="handleInputChange(scope.$index,scope.row)"
                           v-model="scope.row.profitPoint">
              <span slot="content">{{ scope.row.profitPoint }}</span>
            </editable-cell>
          </el-table-column>
          <el-table-column label="今日总数" align="center">
            <template slot-scope="scope">
              <p>{{ scope.row.totalAmount }}</p>
            </template>
          </el-table-column>
          <el-table-column label="今日毛利" align="center">
            <template slot-scope="scope">
              <p>{{ scope.row.profit }}</p>
            </template>
          </el-table-column>
          <el-table-column label="赔付" align="center">
            <editable-cell slot-scope="scope"
                           :can-edit="true"
                           v-on:blur="handleInputChange(scope.$index,scope.row)"
                           v-model="scope.row.lossPay">
              <span slot="content">{{ scope.row.lossPay }}</span>
            </editable-cell>
          </el-table-column>
          <el-table-column label="没人领" align="center">
            <editable-cell slot-scope="scope"
                           :can-edit="true"
                           v-on:blur="handleInputChange(scope.$index,scope.row)"
                           v-model="scope.row.unclaimed">
              <span slot="content">{{ scope.row.unclaimed }}</span>
            </editable-cell>
          </el-table-column>
          <el-table-column label="踩" align="center">
            <editable-cell slot-scope="scope"
                           :can-edit="true"
                           v-on:blur="handleInputChange(scope.$index,scope.row)"
                           v-model="scope.row.stamp">
              <span slot="content">{{ scope.row.stamp }}</span>
            </editable-cell>
          </el-table-column>
          <el-table-column label="总利润" align="center">
            <template slot-scope="scope">
              <p>{{ scope.row.grossProfit }}</p>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="300" align="center">
            <template slot-scope="scope">
              <p>
                <el-button
                  size="mini"
                  type="primary"
                  v-if="showComAdd(scope)"
                  @click="handleAddCom">添加
                </el-button>
                <el-button
                  size="mini"
                  type="primary"
                  @click="handleAddCstIncome(scope.row)">新增客户
                </el-button>
                <el-button
                  size="mini"
                  type="danger"
                  @click="handleDeleteCom(scope.row)">删除
                </el-button>
              </p>
            </template>
          </el-table-column>
        </el-table>
    </div>
  </div>
</template>
<script>
import {createComId,createCustomerIncomeId,doDelete,doDeleteCstIncome, fetchCstList, fetchList,upsert, upsertCstIncome} from "@/api/company";
import EditableCell from "@/components/Table/EditableCell.vue";
import elTableInfiniteScroll from 'el-table-infinite-scroll';
import img_home_today_amount from '@/assets/images/home_today_amount.png';

const defaultComListQuery = {
  name: null,
  cstName: null,
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
  comId: null,
  name: "",
  money: 0
}

const defaultCustomerListQuery = {
  companyId: null,
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
  name: "companyList",
  data() {
    return {
      tableHeight: "100px",
      comBusy: false,
      cstBusy: false,
      operateType: null,
      comListQuery: Object.assign({}, defaultComListQuery),
      newComRow: Object.assign({}, defaultComRow),
      newIncomeRow: Object.assign({}, defaultIncomeRow),
      companyList: [],
      cstList: [],
      comTotal: null,
      currComRow: null,
      drawerFirstLoad: true,
      paramsMap: new Map(),
      comCount: null,
      cstTotal: null,
      cstCount: null,
      todayMoney: null,
      date: null,
      flag: false,
      timerstamp1: 0,
      timerstamp: 0,
      showDrawerClose: false,
      drawerTitle: "默认",
      comListLoading: true,
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
      row.listQuery = Object.assign({}, defaultCustomerListQuery)
      console.log(row.listQuery)
      row.cstFinished = false;
      row.cstBusy = false;
      row.cstCount = 0;
      row.child = [];
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
      this.customerLoad();
    },
    customerReset() {
      this.cstList = [];
      this.cstTotal = null;
      this.drawerFirstLoad = true;
      this.currComRow = null;
      this.cstListQuery = Object.assign({}, defaultCustomerListQuery);
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
    handleIncomeDelete(pscope,row){
      let id = row.id;
      this.$confirm('是否要进行删除操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log("删除")
        doDeleteCstIncome(id).then(response => {
          if (response != null && response.data) {
            this.$message.success("删除成功");
            pscope.row.child.splice(
              pscope.row.child.find(order => {
                let f = order.id === id;
                if(f){
                  this.reQueryByComId(pscope.$index,order.comId)
                }
                return f;
              }), 1);
          }
        })
      });
    },
    showCstAdd(scope,itemScope) {
      if (this.date != null) {
        let time = new Date().getTime();
        let str = this.dateFormat(time);
        if (!str.startsWith(this.date)) {
          return false;
        }
      }
      if (scope.row.cstCount == null) {
        scope.row.cstCount = scope.row.cstTotal;
        return true;
      }
      return itemScope.$index >= scope.row.cstCount - 1;
    },
    showComAdd(scope) {
      if (this.comCount == null) {
        this.comCount = this.comTotal;
        return true;
      }
      return scope.$index >= this.comCount - 1;
    },
    handleInputChange(index,row) {
      let com = Object.assign({}, this.newComRow);
      com.id = row.id
      com.name = row.name
      com.profitPoint = row.profitPoint
      upsert(row).then(response => {
        if (response.data > 0) {
          this.reQueryByComId(index,com.id)
          this.$message.success('更新成功');
        }
      })
    },
    handleCstInputChange(index,prow,row) {
      row.comId = prow.id;
      upsertCstIncome(row).then(response => {
        if (response.data > 0) {
          this.reQueryByComId(index,row.comId);
          this.$message.success('更新成功');
        }
      })
    },
    cstRowClassName({row, rowIndex}) {
      if (rowIndex % 2 === 1) {
        return 'warning-row';
      } else if (rowIndex % 2 === 0) {
        return 'success-row';
      }
      return '';
    },
    companyLoad() {
      this.comListLoading = true;
      this.comBusy = true;
      fetchList(this.comListQuery).then(response => {
        this.comListLoading = false;
        let list1 = response.data.data;
        this.comTotal = response.data.total;
        if (list1 == null || list1.length <= 0) {
          this.$message.success('您要的太多，而我已经没有了');
        } else if(list1.length > 0){
          if (this.comListQuery.pageNum === 1) {
            this.companyList = list1;
          } else {
            this.companyList = this.companyList.concat(list1);
          }
          this.comListQuery.pageNum = this.comListQuery.pageNum + 1;
        }
      });
      this.comBusy = false;
    },
    reQueryByComId(index,comId) {
      let comIdQuery = Object.assign({},defaultComListQuery);
      comIdQuery.id = comId;
      fetchList(comIdQuery).then(response => {
        let list1 = response.data.data;
        this.comTotal = response.data.total;
        if (list1 == null || list1.length <= 0) {
          this.$message.success('您要的太多，而我已经没有了');
        } else if(list1.length > 0){
          this.companyList[index].profit = list1[0].profit;
          this.companyList[index].staffNum = list1[0].staffNum;
          this.companyList[index].totalAmount = list1[0].totalAmount;
          this.companyList[index].grossProfit = list1[0].grossProfit;
        }
      });
    },
    customerLoad(row) {
      console.log(row.listQuery)
      if (row.cstFinished) {
        row.cstListLoading = false;
        return;
      }
      row.cstListLoading = true;
      row.listQuery.companyId = row.id;
      row.listQuery.date = this.date;
      row.cstBusy = true;
      fetchCstList(row.listQuery).then(response => {
        row.cstListLoading = false;
        let list1 = response.data.data;
        row.cstTotal = response.data.total;
        if (list1 == null || list1.length <= 0) {
          this.$message.success('您要的太多，而我已经没有了');
          row.cstFinished = true;
        } else {
          if (row.listQuery.pageNum === 1) {
            row.child = list1;
          } else if(list1.length > 0){
            row.child = row.child.concat(list1);
          }
          row.listQuery.pageNum = row.listQuery.pageNum + 1;
        }
        row.cstBusy = false;
        row.cstListLoading = false;
        this.timerstamp = new Date().valueOf();
        row.cstCount = row.cstTotal;
        console.log(row.listQuery)
      });
    },
    handleSearchList() {
      this.comListQuery.pageNum = 1;
      this.companyLoad();
    },
    handleAddCom() {
      //新增一条表记录，获取一个id
      createComId().then(response => {
        let id = response.data
        let newRow = {};
        Object.assign(newRow, this.newComRow);
        newRow.id = id;
        this.companyList.push(newRow);
        this.comCount++;
      })
      // this.$router.push({path: '/pms/addProduct'});
    },
    handleAddCstIncome(row) {
      //新增一条表记录，获取一个id
      createCustomerIncomeId().then(response => {
        let id = response.data
        let newRow = {};
        Object.assign(newRow, this.newIncomeRow);
        newRow.id = id;
        newRow.comId = row.id;
        row.child.push(newRow);
        row.cstCount++;
      })
      // this.$router.push({path: '/pms/addProduct'});
    },
    handleResetSearch() {
      this.selectProductCateValue = [];
      this.comListQuery = Object.assign({}, defaultComListQuery);
      this.handleSearchList();
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


