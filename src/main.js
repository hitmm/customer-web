import Vue from 'vue'

import 'normalize.css/normalize.css'// A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n
import VCharts from 'v-charts'

import '@/styles/index.scss' // global css
import InfiniteScroll from 'vue-infinite-scroll'
import App from './App'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue'
import VueScroller from 'vue-scroller'
import 'ant-design-vue/dist/antd.css';
import {MessageBox} from 'element-ui'

import '@/icons' // icon
import '@/permission' // permission control

Vue.use(ElementUI, { locale })
Vue.use(VCharts)
Vue.use(Antd)
Vue.use(InfiniteScroll)
Vue.use(VueScroller)

Vue.config.productionTip = false
Vue.prototype.$confirm=MessageBox.confirm;


new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
