import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: () => import('@/views/layout'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        component: () => import('@/views/home')
      },
      {
        path: 'user-info',
        component: () => import('@/views/user/userInfo')
      },
      {
        path: 'user-avatar',
        component: () => import('@/views/user/userAvatar')
      }
    ]
  },
  {
    path: '/reg',
    component: () => import('@/views/register')
    // webpack提供import函数来路由懒加载导入组件
    // 路由懒加载，就是页面路由路径切换到/reg，才去加载对应组件代码
    // 好处：让首页加载的体积更小，打开更快

  },
  {
    path: '/login',
    component: () => import('@/views/login')
  }
]

const router = new VueRouter({
  routes
})

const whiteList = ['/login', '/reg'] // 白名单 （无需登录可以访问的路由地址）

// 全局前置路由守卫
// 浏览器第一次打开项目页面,会触发一次全局前置路由守卫函数
// 有token证明登录了，没有则未登录
// next()如果强制切换路由地址，会再次走路由守卫再次去匹配路由表
router.beforeEach((to, from, next) => {
  const token = store.state.token
  if (token) {
    // 登录了
    if (!store.state.userInfo.username) {
    // 有token值时才去获取用户信息
      store.dispatch('initUserInfo')
    }

    next()
  } else {
    // 未登录
    // 数组.includes(值)，作用:判断值是否在数组里出现过，出现过原地返回true
    if (whiteList.includes(to.path)) {
      // 未登录，可以访问的路由地址，则放行(路由全局前置守卫不会再次触发了，而是匹配路由表)
      next()
    } else {
      // 强制切换到登录页
      next('/login')
    }
  }
})

export default router
