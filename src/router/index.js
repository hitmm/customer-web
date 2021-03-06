import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
 * hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
 *                                if not set alwaysShow, only more than one route under the children
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
 **/
export const constantRouterMap = [
  {path: '/login', component: () => import('@/views/login/index'), hidden: true},
  {path: '/404', component: () => import('@/views/404'), hidden: true},
  {
    path: '',
    component: Layout,
    redirect: '/home',
    children: [{
      path: 'home',
      name: 'home',
      component: () => import('@/views/home/index'),
      meta: {title: '首页', icon: 'home'}
    }]
  }
]

export const asyncRouterMap = [
  {
    path: '/manage',
    component: Layout,
    redirect: '/manage/company/page',
    name: 'manage',
    meta: {title: '元信息管理', icon: 'product'},
    children: [{
      path: 'company',
      name: 'company',
      component: () => import('@/views/manage/company/index'),
      meta: {title: '公司管理', icon: 'product-list'}
    },{
      path: 'erdao',
      name: 'erdao',
      component: () => import('@/views/manage/erdao/index'),
      meta: {title: '二道管理', icon: 'product-comment'}
    },{
      path: 'driver',
      name: 'driver',
      component: () => import('@/views/manage/driver/index'),
      meta: {title: '司机管理', icon: 'product-comment'}
    }]
  },{
    path: '/income',
    component: Layout,
    redirect: '/income/page',
    name: 'income',
    meta: {title: '收入录入管理', icon: 'product'},
    children: [{
      path: 'company',
      name: 'company',
      component: () => import('@/views/income/company/index'),
      meta: {title: '客户录入', icon: 'product-list'}
    },{
      path: 'erdao',
      name: 'erdao',
      component: () => import('@/views/income/erdao/index'),
      meta: {title: '二道录入', icon: 'product-comment'}
    }]
  },
  {
    path: '/outcome',
    component: Layout,
    redirect: '/outcome/page',
    name: 'outcome',
    meta: {title: '支出录入管理', icon: 'sms-coupon'},
    children: [{
      path: 'driver',
      name: 'driverOutcome',
      component: () => import('@/views/outcome/driver/index'),
      meta: {title: '司机支出列表', icon: 'product-comment'}
    },{
      path: 'provider',
      name: 'provider',
      component: () => import('@/views/outcome/provider/index'),
      meta: {title: '供应商支出列表', icon: 'order'}
    }]
  },
  {
    path:'/ums',
    component: Layout,
    redirect: '/ums/admin',
    name: 'ums',
    meta: {title: '权限', icon: 'ums'},
    children: [
      {
        path: 'admin',
        name: 'admin',
        component: () => import('@/views/ums/admin/index'),
        meta: {title: '用户列表', icon: 'ums-admin'}
      },
      {
        path: 'role',
        name: 'role',
        component: () => import('@/views/ums/role/index'),
        meta: {title: '角色列表', icon: 'ums-role'}
      },
      {
        path: 'allocMenu',
        name: 'allocMenu',
        component: () => import('@/views/ums/role/allocMenu'),
        meta: {title: '分配菜单'},
        hidden: true
      },
      {
        path: 'allocResource',
        name: 'allocResource',
        component: () => import('@/views/ums/role/allocResource'),
        meta: {title: '分配资源'},
        hidden: true
      },
      {
        path: 'menu',
        name: 'menu',
        component: () => import('@/views/ums/menu/index'),
        meta: {title: '菜单列表', icon: 'ums-menu'}
      },
      {
        path: 'addMenu',
        name: 'addMenu',
        component: () => import('@/views/ums/menu/add'),
        meta: {title: '添加菜单'},
        hidden: true
      },
      {
        path: 'updateMenu',
        name: 'updateMenu',
        component: () => import('@/views/ums/menu/update'),
        meta: {title: '修改菜单'},
        hidden: true
      },
      {
        path: 'resource',
        name: 'resource',
        component: () => import('@/views/ums/resource/index'),
        meta: {title: '资源列表', icon: 'ums-resource'}
      },
      {
        path: 'resourceCategory',
        name: 'resourceCategory',
        component: () => import('@/views/ums/resource/categoryList'),
        meta: {title: '资源分类'},
        hidden: true
      }
    ]
  },
  {path: '*', redirect: '/404', hidden: true}
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({y: 0}),
  routes: constantRouterMap
})

