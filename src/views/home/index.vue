<template>
  <div class="app-container">
    <div class="total-layout">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="total-frame">
            <img :src="img_home_order" class="total-icon">
            <div class="total-title">今日收入金额</div>
            <div class="total-value">{{ todayIncome }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="total-frame">
            <img :src="img_home_today_amount" class="total-icon">
            <div class="total-title">今日支出金额</div>
            <div class="total-value">{{ todayOutcome }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="total-frame">
            <img :src="img_home_yesterday_amount" class="total-icon">
            <div class="total-title">今日实际盈利</div>
            <div class="total-value">{{ todayProfit }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="total-frame">
            <img :src="img_home_yesterday_amount" class="total-icon">
            <div class="total-title">月度实际盈利</div>
            <div class="total-value">{{ monthProfit }}</div>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 10px">
        <el-col :span="6">
          <div class="total-frame">
            <img :src="img_home_order" class="total-icon">
            <div class="total-title">昨日收入金额</div>
            <div class="total-value">{{ yesterdayIncome }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="total-frame">
            <img :src="img_home_today_amount" class="total-icon">
            <div class="total-title">昨日支出金额</div>
            <div class="total-value">{{ yesterdayOutcome }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="total-frame">
            <img :src="img_home_yesterday_amount" class="total-icon">
            <div class="total-title">昨日实际盈利</div>
            <div class="total-value">{{ yesterdayProfit }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="total-frame">
            <img :src="img_home_yesterday_amount" class="total-icon">
            <div class="total-title">季度实际盈利</div>
            <div class="total-value">{{ seasonProfit }}</div>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="statistics-layout">
      <div class="layout-title">总体盈利统计</div>
      <el-row>
        <el-col :span="24">
          <div style="padding: 10px;border-left:1px solid #DCDFE6">
            <el-date-picker
              style="float: right;z-index: 1"
              size="small"
              v-model="date"
              type="daterange"
              align="right"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="handleDateChange"
              :picker-options="pickerOptions">
            </el-date-picker>
            <div style="text-align: center">
              <ve-line
                :data="chartData"
                :legend-visible="true"
                :loading="loading"
                :data-empty="dataEmpty"
                :settings="chartSettings"></ve-line>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  import {str2Date} from '@/utils/date';
  import {fetchDetail,fetchInfo} from '@/api/summary'
  import img_home_order from '@/assets/images/home_order.png';
  import img_home_today_amount from '@/assets/images/home_today_amount.png';
  import img_home_yesterday_amount from '@/assets/images/home_yesterday_amount.png';
  const DATA_FROM_BACKEND = {
    columns: ['date', 'income','outcome'],
    rows: [
    ]
  };
  export default {
    name: 'home',
    data() {
      return {
        todayIncome: "",
        todayOutcome: "",
        yesterdayIncome: "",
        yesterdayOutcome: "",
        todayProfit: "",
        yesterdayProfit: "",
        monthProfit: "",
        seasonProfit:"",
        pickerOptions: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              let start = new Date();
              start.setTime(end.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一月',
            onClick(picker) {
              const end = new Date();
              let start = new Date();
              start.setTime(end.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        date: '',
        chartSettings: {
          xAxisType: 'time',
          area:true,
          axisSite: { right: ['outcome']},
        labelMap: {'income': '收入', 'outcome': '支出'}},
        chartData: {
          columns: [],
          rows: []
        },
        loading: false,
        dataEmpty: false,
        img_home_order,
        img_home_today_amount,
        img_home_yesterday_amount
      }
    },
    created(){
      this.initTotalIncomeDate();
      this.fetchChartData();
      this.fetchCommonData();
    },
    methods:{
      handleDateChange(){
        this.fetchChartData();
      },
      initTotalIncomeDate(){
        let start = new Date();
        const end = new Date();
        start.setTime(end.getTime() - 1000 * 60 * 60 * 24 * 30);
        this.date=[start,end];
      },
      fetchChartData(){
        setTimeout(() => {
          this.chartData = {
            columns: ['date', 'income','outcome'],
            rows: []
          };
          let params = {};
          console.log(typeof this.date[0])
          params.startDate = this.date[0].getTime();
          params.endDate = this.date[1].getTime();
          console.log(params)
          fetchInfo(params).then(response => {
            let data = response.data
            let dateList = data.dateList;
            let incomeMap = data.incomeMap;
            let outcomeMap = data.outcomeMap;
            for(let i=0;i< dateList.length;i++){
              let item= {};
              let dateItem = dateList[i];
              let income = incomeMap[dateItem];
              let outcome = outcomeMap[dateItem];
              item.date = dateItem;
              item.income = income;
              item.outcome = outcome;
              this.chartData.rows.push(item);
            }
            console.log(this.chartData)
            this.dataEmpty = false;
            this.loading = false
          })
        }, 1000)
      },
      fetchCommonData(){
        setTimeout(() => {
          fetchDetail().then(response => {
            let data = response.data
            console.log(data)
            this.todayIncome = data.todayIncome;
            this.todayOutcome = data.todayOutcome;
            this.yesterdayIncome = data.yesterdayIncome;
            this.yesterdayOutcome = data.yesterdayOutcome;
            this.todayProfit = data.todayProfit;
            this.yesterdayProfit = data.yesterdayProfit;
            this.monthProfit = data.monthProfit;
            this.seasonProfit = data.seasonProfit;
          })
          this.dataEmpty = false;
          this.loading = false
        }, 1000)
      }
    }
  }
</script>

<style scoped>
  .app-container {
    margin-top: 40px;
    margin-left: 120px;
    margin-right: 120px;
  }

  .address-layout {
  }

  .total-layout {
    margin-top: 20px;
  }

  .total-frame {
    border: 1px solid #DCDFE6;
    padding: 20px;
    height: 100px;
  }

  .total-icon {
    color: #409EFF;
    width: 60px;
    height: 60px;
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

  .un-handle-layout {
    margin-top: 20px;
    border: 1px solid #DCDFE6;
  }

  .layout-title {
    color: #606266;
    padding: 15px 20px;
    background: #F2F6FC;
    font-weight: bold;
  }

  .un-handle-content {
    padding: 20px 40px;
  }

  .un-handle-item {
    border-bottom: 1px solid #EBEEF5;
    padding: 10px;
  }

  .overview-layout {
    margin-top: 20px;
  }

  .overview-item-value {
    font-size: 24px;
    text-align: center;
  }

  .overview-item-title {
    margin-top: 10px;
    text-align: center;
  }

  .out-border {
    border: 1px solid #DCDFE6;
  }

  .statistics-layout {
    margin-top: 20px;
    border: 1px solid #DCDFE6;
  }
  .mine-layout {
    position: absolute;
    right: 140px;
    top: 107px;
    width: 250px;
    height: 235px;
  }
  .address-content{
    padding: 20px;
    font-size: 18px
  }
</style>
