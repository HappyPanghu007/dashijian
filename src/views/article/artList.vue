<template>
  <div>
    <!-- 内容区域 -->
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>文章列表</span>
      </div>
      <!-- 搜索区域 -->
      <div class="search-box">
        <el-form :inline="true" :model="q">
          <el-form-item label="文章分类">
            <el-select
              v-model="q.cate_id"
              placeholder="请选择分类"
              size="small"
            >
              <el-option
                v-for="obj in cateList"
                :key="obj.id"
                :label="obj.cate_name"
                :value="obj.cate_id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="发布状态" style="margin-left: 15px">
            <el-select v-model="q.state" placeholder="请选择状态" size="small">
              <el-option label="已发布" value="已发布"></el-option>
              <el-option label="草稿" value="草稿"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small">筛选</el-button>
            <el-button type="info" size="small">重置</el-button>
          </el-form-item>
        </el-form>
        <!-- 发表文章的按钮 -->
        <el-button
          type="primary"
          size="small"
          class="btn-pub"
          @click="showPubDialogFn"
          >发表文章</el-button
        >
      </div>

      <!-- 文章表格区域 -->

      <!-- 分页区域 -->
    </el-card>
    <!-- 发表文章的 Dialog 对话框 -->
    <el-dialog
      title="发表文章"
      :visible.sync="pubDialogVisible"
      fullscreen
      :before-close="handleClose"
    >
      <!-- 发布文章的对话框 -->
      <el-form
        :model="pubForm"
        :rules="pubFormRules"
        ref="pubFormRef"
        label-width="100px"
      >
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="pubForm.title" placeholder="请输入标题"></el-input>
        </el-form-item>
        <el-form-item label="文章分类" prop="cate_id">
          <el-select
            v-model="pubForm.cate_id"
            placeholder="请选择分类"
            style="width: 100%"
          >
            <el-option
              v-for="obj in cateList"
              :key="obj.id"
              :label="obj.cate_name"
              :value="obj.cate_id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文章内容" prop="content">
          <quill-editor v-model="pubForm.content"></quill-editor>
        </el-form-item>
        <el-form-item label="文章封面">
          <!-- 用来显示封面的图片 -->
          <img
            src="../../assets/images/cover.jpg"
            alt=""
            class="cover-img"
            ref="imgRef"
          />
          <br />
          <!-- 文件选择框，默认被隐藏 -->
          <input
            type="file"
            style="display: none"
            accept="image/*"
            ref="iptFileRef"
            @change="changeCoverFn"
          />
          <!-- 选择封面的按钮 -->
          <el-button type="text" @click="selCoverFn">+ 选择封面</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { getArtCateListAPI } from '@/api'
export default {
  name: 'ArtList',
  data() {
    return {
      // 查询参数对象
      q: {
        pagenum: 1,
        pagesize: 2,
        cate_id: '',
        state: ''
      },
      pubDialogVisible: false, // 控制发表文章对话框的显示与隐藏
      pubForm: {
        // 表单的数据对象
        title: '', // 文章分类标题
        cate_id: '', // 文章分类id
        content: '', // 文章的内容
        cover_img: '' // 封面图片（保存的是文件）
      },
      pubFormRules: {
        // 表单的验证规则对象
        title: [
          { required: true, message: '请输入文章标题', trigger: 'blur' },
          {
            min: 1,
            max: 30,
            message: '文章标题的长度为1-30个字符',
            trigger: 'blur'
          }
        ],
        cate_id: [
          { required: true, message: '请选择文章标题', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入文章内容', trigger: 'blur' }
        ]
      },
      cateList: [] // 保存文章分类列表
    }
  },
  created() {
    this.getCateListFn()
  },
  methods: {
    // 发表文章按钮->点击事件->让添加文章对话框出现
    showPubDialogFn() {
      this.pubDialogVisible = true
    },

    // 对话框关闭前的回调
    async handleClose(done) {
      // 询问用户是否确认关闭对话框
      const confirmResult = await this.$confirm(
        '此操作将导致文章信息丢失, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err) // 捕获确认框Promise对象里选择取消时，拒绝状态结果'cancel'字符串

      // $confirm内部虽然是一个确认提示框，但是它借用了Promise语法来管理，点击确定它的状态为兑现成功状态返回' confirm'，如果用户点击了取消按钮，此Promise对象状态为拒绝状态，返回' cancel'字符串

      /*  知识点回顾:
        1.await只能用在被async修饰的函数内
        async修饰:就是在当前函数名左边加async关键字，如果没有函数名，在形参的左边加async
        原因: async修饰的函数就是异步函数，如果此函数被调用，总是返回一个全新Promise对象
        而且本次函数调用因为是异步函数，所以外面的同步代码继续执行，而await暂停代码只能暂停async函数内的，等待await后面异步结果 */
      // 2.await只能拿到成功的结果并放行往下走，如果失败内部会向浏览器控制台抛出错误并不会让await往下走代码
      //   3. await后面的Promise的对象的拒绝状态(错误)如何捕获呢?
      //   方法1: try {} catch (err) {}I
      //    方式2:用Promise的链式调用，而且在catch里return的非Promise拒绝状态的对象值，都会当做成功的结果返回给原地新的Promise对象结果

      // 取消了关闭-阻止住, 什么都不干
      if (confirmResult === 'cancel') return
      // 确认关闭
      done()
    },
    // 获取所有的分类
    async getCateListFn() {
      const { data: res } = await getArtCateListAPI()
      this.cateList = res.data
    },
    // 选择封面点击事件-> 让文件选择窗口出现
    selCoverFn() {
      this.$refs.iptFileRef.click() // 用JS来模拟一次点击事件动作
    },
    // 用户选择了封面文件
    changeCoverFn(e) {
      // e.target 拿到触发事件的那个标签(input标签对象本身)
      // e.target.files拿到选择的文件数组
      const files = e.target.files
      if (files.length === 0) {
        // 用户没有选择文件
        this.pubForm.cover_img = null
      } else {
        // 用户选择了文件
        this.pubForm.cover_img = files[0]
      }
    }
  }
}
</script>

  <style lang="less" scoped>
// scoped属性作用:让style里的选择器，只能选中当前组件的标签(为了保证样式的独立性，不影响别的组件)
// scoped原理: (多加了一个data-v的属性选择器)webpack打包的时候，会给组件标签上添加相同data-v-hash值，然后也会给所有选择器后面加上一个[data-v-hash]值的属性选择器
// <标签data-v-390246 class="my_a"></标签>
// 选择器会变成.my_a[data-v-390246]
// 重要注意事项: scoped只会给当前组件所有原生标签添加data-v-hash值属性，还会给组件标签内根标签添加data-v-hash值属性,组件内的标签不会添加

.search-box {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  .btn-pub {
    margin-top: 5px;
  }
}

// 设置富文本编辑器的默认最小高度
// ::v-deep作用: 穿透选择, 正常style上加了scope的话, 会给.ql-editor[data-v-hash]属性, 只能选择当前页面标签或者组件的根标签
// 如果想要选择组件内的标签(那些标签没有data-v-hash值)所以正常选择选不中, 加了::v-deep空格前置的话, 选择器就会变成如下形式
// [data-v-hash] .ql-editor 这样就能选中组件内的标签的class类名了
::v-deep .ql-editor {
  // 最小高度:标签本身的高度靠内容撑开，但是无内容没有300高度，标签会设置最小高度为300pX
  // 如果内容大于300px，标签高度也会随着撑开(比300px大)
  // 直接给height:那么无论容器内的内容有多少，超出300高度的内容会溢出到外面而不是撑开此容器

  min-height: 300px;
}

/* .ql-editor {
  min-height: 300px;
} */
// 上面这样写选不中富文本的标签的
// 原因:你写在这里会被在后面加上[data-v-hash]属性选择器，而它对应的那个标签组件内标签， scoped又不会给他加入data-v-hash值属性,所以属性选择器选不中
// 原来.ql-editor[data-v-hash值]你标签上既有class也要有属性才能选中设置样式
// 解决:Vue提供了一个::v-deep样式语法，设置后，可以把属性选择器被自动添加到左侧
// 现在[data-v-hash值].ql-editor

// 总结: scoped不会给组件内的标签添加data-v属性，所以你要用::v-deep穿透选择组件内的标签设置样式
</style>
