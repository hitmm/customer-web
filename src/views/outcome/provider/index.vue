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
          <el-form-item label="供应商名称：">
            <el-input style="width: 203px" v-model="topListQuery.name" placeholder="供应商名称"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>供应商收支列表(货币以<a style="color: red">人民币</a>为单位)</span>
      <el-button
        style="float: right;margin-right: 15px"
        @click="handleAddProvider()"
        type="primary"
        size="small">
        添加
      </el-button>
    </el-card>
    <div class="table-container">
      <div style="margin: 15px">
        <el-tag type="success">
          供应商筛选时间范围:
        </el-tag>
        <el-date-picker
          v-model="prdDate"
          style="margin-right: 15px"
          type="daterange"
          @change="changePrdDate"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="timestamp"
          :picker-options="pickerOptions">
        </el-date-picker>
        <el-tag type="success" style="margin-left: 100px">
          收支筛选时间范围:
        </el-tag>
        <el-date-picker
          v-model="incomeDate"
          style="margin-right: 15px"
          type="daterange"
          @change="changeCarryDate"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="timestamp"
          :picker-options="pickerOptions">
        </el-date-picker>
      </div>
        <el-table ref="companyTable"
                  :data="driverList"
                  style="width: 100%"
                  :row-style="{height: '0'}"
                  :cell-style="{padding: '0'}"
                  @expand-change="expandChange"
                  v-el-table-infinite-scroll="prdLoad"
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
                          v-el-table-infinite-scroll="incomeLoad(scope.row)"
                          :infinite-scroll-disabled="scope.row.itemBusy"
                          v-loading="scope.row.itemListLoading"
                          :row-class-name="cstRowClassName"
                          border>
                  <el-table-column label="总入" align="center">
                    <editable-cell slot-scope="{row}"
                                   :can-edit="true"
                                   v-on:blur="handleItemInputChange('in',scope.row,row)"
                                   v-model="row.incomeMoney">
                      <span slot="content">{{ row.incomeMoney }}</span>
                    </editable-cell>
                  </el-table-column>
                  <el-table-column label="已回款" align="center">
                    <editable-cell slot-scope="{row}"
                                   :can-edit="true"
                                   v-on:blur="handleItemInputChange('out',scope.row,row)"
                                   v-model="row.outcomeMoney">
                      <span slot="content">{{ row.outcomeMoney }}</span>
                    </editable-cell>
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
                          @click="handleDelete(scope.$index, scope.row)">删除
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
<!--          -->
<!--          <el-table-column label="编号" width="100" align="center">-->
<!--            <template slot-scope="scope">{{ scope.row.id }}</template>-->
<!--          </el-table-column>-->
          <el-table-column label="供应商姓名" width="120" align="center">
            <editable-cell slot-scope="{row}"
                           :can-edit="true"
                           v-on:blur="handleInputChange(row)"
                           v-model="row.name">
              <span slot="content">{{ row.name }}</span>
            </editable-cell>
          </el-table-column>
          <el-table-column label="总入" align="center">
            <template slot-scope="{row}">{{ row.totalIncome }}</template>
          </el-table-column>
          <el-table-column label="总回款" align="center">
            <template slot-scope="{row}">{{ row.totalOutcome }}</template>
          </el-table-column>
          <el-table-column label="操作" width="300" align="center">
            <template slot-scope="scope">
              <p>
                <el-button
                  size="mini"
                  type="primary"
                  v-if="showComAdd(scope)"
                  @click="handleAddProvider">添加
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
import {createPrdId,createPayId,fetchList,fetchItemList, doDeleteProvider, doDeleteItem,upsertIncome,upsertOutcome,upsert} from "@/api/provider";
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


const defaultItemRow = {
  prdId: null,
  incomeId: null,
  outcomeId: null,
  incomeMoney: 0,
  outcomeMoney: 0
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
  name: "companyList",
  data() {
    return {
      pickerOptions: {
        shortcuts: [{
          text: '昨天',
          onClick(picker) {
            let zero = new Date(new Date(new Date().getTime()).setHours(0,0,0,0)) - 3600 * 1000 * 24;
            const end = new Date();
            const start = new Date();
            start.setTime(zero);
            end.setTime(zero + 3600 * 1000 * 24 - 1)
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      tableHeight: "100px",
      driverBusy: false,
      itemBusy: false,
      operateType: null,
      topListQuery: Object.assign({}, defaultComListQuery),
      newComRow: Object.assign({}, defaultComRow),
      driverList: null,
      cstList: null,
      manageTotal: null,
      currComRow: null,
      drawerFirstLoad: true,
      paramsMap: new Map(),
      comCount: null,
      cstTotal: null,
      cstCount: null,
      todayMoney: null,
      prdDate: null,
      incomeDate: null,
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
    changeCarryDate() {
      this.incomeLoad();
    },
    changePrdDate() {
      console.log(this.prdDate);
      this.prdLoad();
    },
    customerReset() {
      this.cstList = [];
      this.cstTotal = null;
      this.drawerFirstLoad = true;
      this.currComRow = null;
      this.cstListQuery = Object.assign({}, defaultErdaoItemListQuery);
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
    handleItemInputChange(type,prow, row) {
      let body = {};
      body.prdId = prow.id;
      if(type === 'in'){
        body.money = row.incomeMoney;
        body.id = row.incomeId;
        if(body.id === null){
          createPayId(1).then(response => {
            body.id = response.data[0];
            upsertIncome(body).then(response => {
              if (response.data > 0) {
                this.$message.success('更新成功');
                this.cal(prow)
              }
            })
          })
        }else {
          upsertIncome(body).then(response => {
            if (response.data > 0) {
              this.$message.success('更新成功');
              this.cal(prow)
            }
          })
        }
      }

      if(type === 'out'){
        body.money = row.outcomeMoney;
        body.id = row.outcomeId;

        if(body.id === null){
          createPayId(1).then(response => {
            body.id = response.data[0];
            upsertOutcome(body).then(response => {
              if (response.data > 0) {
                this.$message.success('更新成功');
                this.cal(prow,row)
              }
            })
          })
        }else {
          upsertOutcome(body).then(response => {
            if (response.data > 0) {
              this.$message.success('更新成功');
              this.cal(prow,row)
            }
          })
        }
      }
    },
    cal(prow,row) {
      let comIdQuery = Object.assign({},defaultComListQuery);
      comIdQuery.prdId = prow.id;
      fetchList(comIdQuery).then(response => {
        let list1 = response.data.data;
        this.manageTotal = response.data.total;
        if (list1 == null || list1.length <= 0) {
          this.$message.success('您要的太多，而我已经没有了');
        }else {
          prow.totalIncome = list1[0].totalIncome;
          prow.totalOutcome = list1[0].totalOutcome;
        }
      });
    },
    cstRowClassName({row, rowIndex}) {
      if (rowIndex % 2 === 1) {
        return 'warning-row';
      } else if (rowIndex % 2 === 0) {
        return 'success-row';
      }
      return '';
    },
    prdLoad() {
      this.driverListLoading = true;
      this.driverBusy = true;
      fetchList(this.topListQuery).then(response => {
        this.driverListLoading = false;
        let list1 = response.data.data;
        this.manageTotal = response.data.total;
        if (list1 == null || list1.length <= 0) {
          this.$message.success('您要的太多，而我已经没有了');
        }
        if (this.topListQuery.pageNum === 1) {
          this.driverList = list1;
        } else {
          this.driverList = this.driverList.concat(list1);
        }
        this.topListQuery.pageNum = this.topListQuery.pageNum + 1;
      });
      this.driverBusy = false;
    },
    incomeLoad(row) {
      console.log(row.listQuery)
      if (row.cstFinished) {
        row.itemListLoading = false;
        return;
      }
      row.itemListLoading = true;
      row.listQuery.prdId = row.id;
      row.listQuery.date = this.date;
      row.itemBusy = true;
      fetchItemList(row.listQuery).then(response => {
        row.itemListLoading = false;
        let list1 = response.data.data;
        row.cstTotal = response.data.total;
        if (list1 == null || list1.length <= 0) {
          this.$message.success('您要的太多，而我已经没有了');
          row.cstFinished = true;
        } else {
          row.listQuery.pageNum = row.listQuery.pageNum + 1;
        }
        if (row.listQuery.pageNum === 1) {
          row.child = list1;
        } else {
          row.child = row.child.concat(list1);
        }
        row.itemBusy = false;
        row.itemListLoading = false;
        this.timerstamp = new Date().valueOf();
        row.cstCount = row.cstTotal;
        console.log(row.listQuery)
      });
    },
    handleSearchList() {
      this.topListQuery.pageNum = 1;
      this.prdLoad();
    },
    handleAddProvider() {
      //新增一条表记录，获取一个id
      createPrdId().then(response => {
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
      createPayId(2).then(response => {
        let ids = response.data
        let newRow = {};
        Object.assign(newRow, defaultItemRow);
        newRow.incomeId = ids[0];
        newRow.outcomeId = ids[1];
        newRow.incomeMoney = 0;
        newRow.outcomeMoney = 0;
        newRow.prdId = row.id;
        row.child.push(newRow);
        row.cstCount++;
      })
      // this.$router.push({path: '/pms/addProduct'});
    },
    handleResetSearch() {
      this.selectProductCateValue = [];
      this.topListQuery = Object.assign({}, defaultComListQuery);
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


