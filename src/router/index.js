import Vue from 'vue'
import Router from 'vue-router'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

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
  { path: '/login', component: () => import('@/views/login/index'), hidden: true },
  { path: '/404', component: () => import('@/views/404'), hidden: true },

  {
    path: '',
    component: Layout,
    redirect: '/dashboard',
    meta: { title: '首页', icon: 'dashboard' },
    children: [{
      path: 'dashboard',
      name: 'dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页', icon: 'dashboard', noCache: true }
    }]
  },

  {
    path: '/form',
    component: Layout,
    redirect: '/form/index',
    meta: { title: '表单', icon: 'form' },
    children: [
      {
        path: 'index',
        name: '表单',
        component: () => import('@/views/form/index'),
        meta: { title: '表单', icon: 'form' }
      }
    ]
  }
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export const asyncRouterMap = [
  {
    path: '/sys',
    component: Layout,
    redirect: '/sys/user/list',
    meta: { title: '系统管理', icon: 'table', perms: 'sys' },
    children: [
      {
        path: 'user/list',
        name: '用户列表',
        component: () => import('@/views/user/index'),
        meta: { title: '用户列表', icon: 'table', perms: 'sys:user:list' }
      },
      {
        path: 'menu/list',
        name: '菜单列表',
        component: () => import('@/views/menu/index'),
        meta: { title: '菜单列表', icon: 'table', perms: 'sys:menu:list' }
      },
      {
        path: 'role/list',
        name: '角色列表',
        component: () => import('@/views/role/index'),
        meta: { title: '角色列表', icon: 'table', perms: 'sys:role:list' }
      }
    ]
  },

  /**
   * 这里有一个需要非常注意的地方就是404页面一定要最后加载，如果放在constantRouterMap一同声明了404，后面的所以页面都会被拦截到404
   */
  { path: '*', redirect: '/404', hidden: true }
]

