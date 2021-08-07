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
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="公司名称：">
            <el-input style="width: 203px" v-model="listQuery.keyword" placeholder="客户公司名称"></el-input>
          </el-form-item>
          <el-form-item label="客户名称：">
            <el-input style="width: 203px" v-model="listQuery.productSn" placeholder="客户名称"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>客户公司列表</span>
    </el-card>
    <div class="table-container">
      <el-main>
        <el-table ref="productTable"
                  :data="list"
                  style="width: 100%"
                  :row-class-name="tableRowClassName"
                  v-el-table-infinite-scroll="load"
                  @selection-change="handleSelectionChange"
                  v-loading="listLoading"
                  border>
          <el-table-column type="selection" width="60" align="center"></el-table-column>
          <el-table-column label="编号" width="100" align="center">
            <template slot-scope="scope">{{ scope.row.id }}</template>
          </el-table-column>
          <el-table-column label="商品图片" width="120" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="商品名称" align="center">
            <editable-cell slot-scope="{row}"
                           :can-edit="true"
                           v-on:blur="handleInputChange(row)"
                           v-model="row.name">
              <span slot="content">{{ row.name }}</span>
            </editable-cell>
          </el-table-column>
          <el-table-column label="昨日收入总和" align="center">
            <template slot-scope="scope">
              <p>{{ scope.row.name }}</p>
            </template>
          </el-table-column>
          <el-table-column label="近一个月收入总和" align="center">
            <template slot-scope="scope">
              <p>{{ scope.row.name }}</p>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" align="center">
            <template slot-scope="scope">
              <p>
                <el-button
                  size="mini"
                  type="primary"
                  v-if="showAdd(scope)"
                  @click="handleAddProduct">添加
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
      :before-close="handleClose">
      <el-container>
        <el-main>
          <el-table ref="productTable"
                    :data="list"
                    style="width: 100%;height: 100%"
                    :row-class-name="tableRowClassName"
                    v-el-table-infinite-scroll="load"
                    @selection-change="handleSelectionChange"
                    v-loading="listLoading"
                    border>
            <el-table-column label="客户名称" width="120" align="center">
              <editable-cell slot-scope="{row}"
                             :can-edit="true"
                             v-on:blur="handleInputChange(row)"
                             v-model="row.name">
                <span slot="content">{{ row.name }}</span>
              </editable-cell>
            </el-table-column>
            <el-table-column label="收入" align="center">
              <editable-cell slot-scope="{row}"
                             :can-edit="true"
                             v-on:change="handleInputChange(row)"
                             v-model="row.name">
                <span slot="content">{{ row.name }}</span>
              </editable-cell>
            </el-table-column>
            <el-table-column label="操作" width="160" align="center">
              <template slot-scope="scope">
                <p>
                  <el-button
                    size="mini"
                    type="primary"
                    v-if="showAdd(scope)"
                    @click="handleAddProduct()">新增
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
        <el-row>
          <el-col :span="12" class="picker-time">
            <el-date-picker
              v-model="picTime"
              type="date"
              placeholder="选择日期">
            </el-date-picker>
            <el-tag class="customer-size">员工总数：{{count}}</el-tag>
          </el-col>
          <el-col :span="12">
            <div class="total-frame">
              <img :src="img_home_today_amount" class="total-icon">
              <div class="total-title">今天总收入</div>
              <div class="total-value">￥{{ count }}</div>
            </div>
          </el-col>
        </el-row>
        <slot name="header"></slot>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import {fetchList, updateDeleteStatus, updateNewStatus, updatePublishStatus, updateRecommendStatus} from '@/api/product'
import {createId} from "@/api/primaryutils";
import EditableCell from "../../../components/Table/EditableCell.vue";
import elTableInfiniteScroll from 'el-table-infinite-scroll';
import img_home_today_amount from '@/assets/images/home_today_amount.png';

const exampleData = new Array(10).fill({
  id: 123,
  name: '王小虎',
  pic: 'https://image.baidu.com/search/detail?ct=503316480&z=&tn=baiduimagedetail&ipn=d&word=%E5%A3%81%E7%BA%B8%20%E4%B8%8D%E5%90%8C%E9%A3%8E%E6%A0%BC%20%E5%94%AF%E7%BE%8E&step_word=&ie=utf-8&in=&cl=2&lm=-1&st=-1&hd=undefined&latest=undefined&copyright=undefined&cs=1436459556,3505833851&os=4072092093,3204392709&simid=0,0&pn=2&rn=1&di=31900&ln=2574&fr=&fmq=1526269427171_R&fm=&ic=0&s=undefined&se=&sme=&tab=0&width=&height=&face=undefined&is=0,0&istype=2&ist=&jit=&bdtype=0&spn=0&pi=0&gsm=78&objurl=https%3A%2F%2Fgimg2.baidu.com%2Fimage_search%2Fsrc%3Dhttp%253A%252F%252Fimg9.51tietu.net%252Fpic%252F2019-091115%252Fzirrug2cwyjzirrug2cwyj.jpg%26refer%3Dhttp%253A%252F%252Fimg9.51tietu.net%26app%3D2002%26size%3Df9999%2C10000%26q%3Da80%26n%3D0%26g%3D0n%26fmt%3Djpeg%3Fsec%3D1630731323%26t%3De7c51292a0be0e0cec12d6def2a7f675&rpstart=0&rpnum=0&adpicid=0&nojc=undefined',
  brandName: '喂猫'
});

const defaultListQuery = {
  keyword: null,
  pageNum: 1,
  pageSize: 5,
  publishStatus: null,
  verifyStatus: null,
  productSn: null,
  productCategoryId: null,
  brandId: null
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
  name: "productList",
  data() {
    return {
      operateType: null,
      listQuery: Object.assign({}, defaultListQuery),
      list: null,
      total: null,
      count: null,
      picTime: null,
      flag: false,
      showDrawerClose: false,
      drawerTitle: "默认",
      listLoading: true,
      selectProductCateValue: null,
      multipleSelection: [],
      productCateOptions: [],
      brandOptions: [],
      drawer: false,
      img_home_today_amount,
      direction: 'ltr',
    }
  },
  created() {
  },
  watch: {
    selectProductCateValue: function (newValue) {
      if (newValue != null && newValue.length == 2) {
        this.listQuery.productCategoryId = newValue[1];
      } else {
        this.listQuery.productCategoryId = null;
      }

    }
  },
  filters: {
    verifyStatusFilter(value) {
      if (value === 1) {
        return '审核通过';
      } else {
        return '未审核';
      }
    }
  },
  methods: {
    showDrawer(row) {
      this.drawer = true;
      this.drawerTitle = row.name + "公司详细客户信息";
    },
    showAdd(scope) {
      if (this.count == null) {
        this.count = this.total;
        return true;
      }
      console.log(scope.$index)
      return scope.$index >= this.count - 1;
    },
    handleClose(done) {
      done();
    },
    handleInputChange(row) {
      console.log(row)
    },
    tableRowClassName({row, rowIndex}) {
      if (rowIndex === 1) {
        return 'warning-row';
      } else if (rowIndex === 3) {
        return 'success-row';
      }
      return '';
    },
    load() {
      this.listLoading = true;
      console.log(this.listQuery)
      fetchList(this.listQuery).then(response => {
        this.listLoading = false;
        let list1 = response.data.list;
        console.log(list1)
        if (list1 == null || list1.length <= 0) {
          this.$message.success('您要的太多，而我已经没有了');
        } else {
          if (this.listQuery.pageNum === 1) {
            this.list = list1;
          } else {
            this.list = this.list.concat(list1);
          }
          this.listQuery.pageNum = this.listQuery.pageNum + 1;
        }
        this.total = response.data.total;
        console.log(this.list)
      });
    },
    getProductSkuSp(row, index) {
      let spData = JSON.parse(row.spData);
      if (spData != null && index < spData.length) {
        return spData[index].value;
      } else {
        return null;
      }
    },
    handleSearchList() {
      this.listQuery.pageNum = 1;
      this.load();
    },
    handleAddProduct() {
      //新增一条表记录，获取一个id
      createId().then(response => {
        console.log(response)
        let id = response.data
        let newRow = [{
          id: id,
          name: "",
          pic: "",
          brandName: ""
        }]
        this.list = this.list.concat(newRow);
        this.count++;
      })
      // this.$router.push({path: '/pms/addProduct'});
    },
    handleCurrentChange(val) {
      this.listQuery.pageNum = val;
      this.getList();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handlePublishStatusChange(index, row) {
      let ids = [];
      ids.push(row.id);
      this.updatePublishStatus(row.publishStatus, ids);
    },
    handleNewStatusChange(index, row) {
      let ids = [];
      ids.push(row.id);
      this.updateNewStatus(row.newStatus, ids);
    },
    handleRecommendStatusChange(index, row) {
      let ids = [];
      ids.push(row.id);
      this.updateRecommendStatus(row.recommandStatus, ids);
    },
    handleResetSearch() {
      this.selectProductCateValue = [];
      this.listQuery = Object.assign({}, defaultListQuery);
    },
    handleDelete(index, row) {
      this.$confirm('是否要进行删除操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let ids = [];
        ids.push(row.id);
        this.updateDeleteStatus(1, ids);
        this.count--;
      });
    },
    handleUpdateProduct(index, row) {
      this.$router.push({path: '/pms/updateProduct', query: {id: row.id}});
    },
    handleShowProduct(index, row) {
      console.log("handleShowProduct", row);
    },
    handleShowVerifyDetail(index, row) {
      console.log("handleShowVerifyDetail", row);
    },
    handleShowLog(index, row) {
      console.log("handleShowLog", row);
    },
    updatePublishStatus(publishStatus, ids) {
      let params = new URLSearchParams();
      params.append('ids', ids);
      params.append('publishStatus', publishStatus);
      updatePublishStatus(params).then(response => {
        this.$message({
          message: '修改成功',
          type: 'success',
          duration: 1000
        });
      });
    },
    updateNewStatus(newStatus, ids) {
      let params = new URLSearchParams();
      params.append('ids', ids);
      params.append('newStatus', newStatus);
      updateNewStatus(params).then(response => {
        this.$message({
          message: '修改成功',
          type: 'success',
          duration: 1000
        });
      });
    },
    updateRecommendStatus(recommendStatus, ids) {
      let params = new URLSearchParams();
      params.append('ids', ids);
      params.append('recommendStatus', recommendStatus);
      updateRecommendStatus(params).then(response => {
        this.$message({
          message: '修改成功',
          type: 'success',
          duration: 1000
        });
      });
    },
    updateDeleteStatus(deleteStatus, ids) {
      let params = new URLSearchParams();
      params.append('ids', ids);
      params.append('deleteStatus', deleteStatus);
      updateDeleteStatus(params).then(response => {
        this.$message({
          message: '删除成功',
          type: 'success',
          duration: 1000
        });
      });
      this.getList();
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
  margin: 10px;
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

.customer-size{
  padding:10px;
  margin:5px;
  width: 100%;
  height: 50px;
  font-size: 24px;
}
</style>


