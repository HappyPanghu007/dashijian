import Vue from 'vue'

import App from './App.vue'
import router from './router'
import store from './store'
import '@/assets/global.less' // 全局初始化样式
import '@/elementUI/index'
// 富文本
import VueQuillEditor from 'vue-quill-editor'

// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 格式化时间
import dayjs from 'dayjs'

Vue.use(VueQuillEditor)
Vue.config.productionTip = false

// 定义格式化时间函数
Vue.prototype.$formatDate = (dataObj) => {
  return dayjs(dataObj).format('YYYY-MM-DD HH:mm:ss')
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

// 前端预览图片格式和发给后台图片格式总结

// 前提:通过input[type=file]让用户选择文件，通过事件对象.target.files拿到用户选择的"文件对象""预览；img标签的src属性的值（base64字符串/图片链接地址)

//    情况1:文件转成图片base64字符串:new FileReader()
//    给src属性赋予base64字符串（图片数据转base64字符串)，特点以data:image/png;base64,开头

//    情况2:文件转成图片链接地址:URL.createObjURL(文件)
//    注意:它的地址只能在前端使用

//  需求:把用户选择的文件发给后台保存在服务器上
//      情况1:文件转成图片base64字符串，传递给后台
//      情况2:用new FormData()表单数据直接装文件本身，直接传递给后台

// 打包相关问题:
// 问题:打开index.html，出现了404问题
// 原因:
// 1．默认打包， index.html引入其他打包的文件使用的是绝对地址
// 地址是以/开头（要找到当前index.html打开时所在服务器的根地址(文件夹))
// 就得确保你的vscode+liserver插件打开时，vscode根目录得直接是dist文件夹
// 你如果把dist文件夹交给后台运维工程师部署到服务器上，dist下内容就得在服务器根目录才行
// 但是服务器一般会有多个项目，不让你用根目录直接放一个项目，很乱
// 解决: webpack让你写一个配置项publicPath(控制index.html引入其他资源前缀地址)
// vue.config.js（脚手架配置文件,webpack配置文件)
// publicPath:默认值‘/’确保开发环境下，是这个值，因为开发服务器会把所有打包在内存里而且作为服务器的根目录文件夹，绝对地址
// 生产环境准备上线了，这个时候得用相对地址,publicPath:'./'
// 路径不以/开头其实就是./开头(默认的)
