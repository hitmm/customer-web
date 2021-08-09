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
      <el-main>
        <el-table ref="companyTable"
                  :data="companyList"
                  style="width: 100%"
                  height="tableHeight"
                  :infinite-scroll-disabled="comBusy"
                  :row-class-name="tableRowClassName"
                  v-el-table-infinite-scroll="companyLoad"
                  v-loading="comListLoading"
                  border>
          <el-table-column label="编号" width="100" align="center">
            <template slot-scope="scope">{{ scope.row.id }}</template>
          </el-table-column>
          <el-table-column label="公司名称" width="120" align="center">
            <editable-cell slot-scope="{row}"
                           :can-edit="true"
                           v-on:blur="handleInputChange(row)"
                           v-model="row.name">
              <span slot="content">{{ row.name }}</span>
            </editable-cell>
          </el-table-column>
          <el-table-column label="点数" align="center">
            <editable-cell slot-scope="{row}"
                           :can-edit="true"
                           v-on:blur="handleInputChange(row)"
                           v-model="row.backPoint">
              <span slot="content">{{ row.backPoint }}</span>
            </editable-cell>
          </el-table-column>
          <el-table-column label="客户数量" align="center">
            <template slot-scope="scope">
              <p>{{ scope.row.staffNum }}</p>
            </template>
          </el-table-column>
          <el-table-column label="昨日收入总和" align="center">
            <template slot-scope="scope">
              <p>{{ scope.row.yesterdayMoney }}</p>
            </template>
          </el-table-column>
          <el-table-column label="近一个月收入总和" align="center">
            <template slot-scope="scope">
              <p>{{ scope.row.monthMoney }}</p>
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
                  type="danger"
                  @click="handleDeleteCom(scope.row)">删除
                </el-button>
                <el-button
                  size="mini"
                  type="success"
                  @click="showDrawer(scope.row)">详情
                </el-button>
              </p>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </div>
    <el-drawer
      title="title"
      size="40%"
      :show-close="showDrawerClose"
      :visible.sync="drawer"
      :direction="direction"
      :destroy-on-close="true"
      :before-close="handleClose">
      <el-container>
        <el-main>
          <el-table ref="cstTable"
                    :data="cstList"
                    style="width: 100%;height: 100%"
                    height="tableHeight"
                    :row-class-name="tableRowClassName"
                    v-el-table-infinite-scroll="customerLoad"
                    v-loading="cstListLoading"
                    border>
            <el-table-column label="客户名称" width="120" align="center">
              <editable-cell slot-scope="{row}"
                             :can-edit="true"
                             v-on:blur="handleCstInputChange(row)"
                             v-model="row.cstName">
                <span slot="content">{{ row.cstName }}</span>
              </editable-cell>
            </el-table-column>
            <el-table-column label="收入(人民币)" align="center">
              <editable-cell slot-scope="{row}"
                             :can-edit="true"
                             v-on:change="handleCstInputChange(row)"
                             v-model="row.money">
                <span slot="content">{{ row.money }}</span>
              </editable-cell>
            </el-table-column>
            <el-table-column label="操作" width="160" align="center">
              <template slot-scope="scope">
                <p>
                  <el-button
                    size="mini"
                    type="primary"
                    v-if="showCstAdd(scope)"
                    @click="handleAddCstIncome()">新增
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
        </el-main>
      </el-container>
      <div slot="title">
        {{ drawerTitle }}
        <el-row style="align-items:flex-end;">
          <el-col :span="10" class="picker-time">
            <el-date-picker
              v-model="date"
              v-on:change="changeDate"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="选择日期">
            </el-date-picker>
<!--            <el-tag class="customer-size">客户总数：{{ cstTotal }}</el-tag>-->
          </el-col>
          <el-col :span="10">
            <div class="total-frame">
              <img :src="img_home_today_amount" class="total-icon">
              <div class="total-title">今天总收入</div>
              <div class="total-value">￥{{ todayMoney }}</div>
            </div>
          </el-col>
          <el-col :span="4" style="margin-top: 30px">
            <el-button
              style="float: right;margin-right: 15px"
              type="primary"
              @click="handleAddCstIncome()"
              size="small">
              添加
            </el-button>
          </el-col>
        </el-row>
        <slot name="header"></slot>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import {doDelete, fetchCstList, fetchList,doDeleteCstIncome,upsertCstIncome} from "@/api/company";
import {createId} from "@/api/primaryutils";
import EditableCell from "@/components/Table/EditableCell.vue";
import elTableInfiniteScroll from 'el-table-infinite-scroll';
import img_home_today_amount from '@/assets/images/home_today_amount.png';
import {upsert} from "@/api/company";

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
      img_home_today_amount,
      direction: 'ltr',
    }
  },
  mounted(){
    this.$nextTick(() =>{
      // 根据浏览器高度设置初始高度
      this.tableHeight = window.innerHeight - this.$refs.companyTable.$el.offsetTop - 70
      // 监听浏览器高度变化，改变表格高度
      window.onresize = () =>{
        this.tableHeight = window.innerHeight - this.$refs.companyTable.$el.offsetTop - 70
      }
    })
  },
  created() {
  },
  methods: {
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
    },
    customerReset() {
      this.cstList = [];
      this.cstTotal = null;
      this.drawerFirstLoad = true;
      this.currComRow = null;
      this.cstListQuery = Object.assign({}, defaultInComeListQuery);
    },
    showCstAdd(scope) {
      if (this.cstCount == null) {
        this.cstCount = this.cstTotal;
        return true;
      }
      return scope.$index >= this.cstCount - 1;
    },
    showComAdd(scope) {
      console.log("show:"+this.comCount+"-"+scope.$index)
      if (this.comCount == null) {
        this.comCount = this.comTotal;
        return true;
      }
      return scope.$index >= this.comCount - 1;
    },
    handleClose(done) {
      this.customerReset();
      done();
    },
    handleInputChange(row) {
      console.log(row)
      let com = Object.assign({},this.newComRow);
      com.id = row.id
      com.name = row.name
      com.backPoint = row.backPoint
      upsert(com).then(response => {
        if(response.data > 0){
          this.$message.success('更新成功');
        }
      })
    },
    handleCstInputChange(row) {
      let com = Object.assign({},this.newIncomeRow);
      com.id = row.id
      com.cstName = row.cstName
      com.money = row.money
      com.comId = this.currComRow.id;
      console.log(com)
      upsertCstIncome(com).then(response => {
        if(response.data > 0){
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
      fetchList(this.comListQuery).then(response => {
        this.comListLoading = false;
        console.log(this.companyList)
        let list1 = response.data.data;
        this.comTotal = response.data.total;
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
      this.comBusy =false;
    },
    customerLoad() {
      this.cstListLoading = true;
      if (this.drawerFirstLoad) {
        this.cstListQuery.pageNum = 1;
      }
      console.log(this.currComRow)
      if (this.currComRow != null) {
        this.cstListQuery.companyId = this.currComRow.id;
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
      }
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
</style>


