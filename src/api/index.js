// 封装的是具体的接口请求方法
// 注意:每个方法只负责请求一个url地址
import request from '@/utils/request'

// 导出接口方法，为了在逻辑页面引入后调用

/**
 * 注册接口
 * @param {*} param0 {username:用户名, password:密码, repassword:确认密码}
 * @returns  promise对象
 */
export const registerAPI = ({ username, password, repassword }) => {
  // 原地是一个Promise对象(内部包含原生ajax请求)
  // return这个Promise对象到逻辑页面，去那边对Promise对象提取结果
  return request({
    url: '/api/reg',
    method: 'POST',
    // axios传参params, data
    // params的对象参数名和值，axios源码会把参数和值,拼接在url?后面给后台(query查询字符串)
    // data的对象参数名和值，axios源码会把参数和值，拼接在请求体里 （body参数)
    data: {
      username,
      password,
      repassword
    }
  })
}

/**
 * 登录接口
 * @param {*} param0 {username:用户名,password:密码}
 * @returns Promise对象
 */
export const loginAPI = ({ username, password }) => {
  return request({
    url: '/api/login',
    method: 'POST',
    data: {
      username,
      password
    }
  })
}

/**
 * 获取用户信息
 * @returns  Promise对象
 */
export const getUserInfoAPI = () => {
  return request({
    url: '/my/userinfo'
    // metgod不写默认GET类型
    // 传参给后台: params(查询字符串query), data(请求体body), headers(请求头)
    // this.$store.state.token这里this不是组件对象不能用this.$store拿到store对象
  })
}

/**
 * 获取-侧边栏菜单数据
 * @returns Promise对象
 */
export const getMenusAPI = () => {
  return request({
    url: '/my/menus'
  })
}
