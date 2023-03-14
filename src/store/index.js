import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: '' // 保存token字符串
  },
  getters: {
  },
  mutations: {
    // 保存token
    updateToken(state, val) {
      state.token = val
    }
  },
  actions: {
  },
  modules: {
  },
  // 配置 vuex 的插件
  plugins: [createPersistedState()]
})

// vuex默认保存在内存中,所以刷新所有的值会回归初始化(无法做到持久存储)
// 借助npm i vuex-persistedstate@3.2.1这个包可以让vuex左持久化存储
