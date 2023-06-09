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
                :value="obj.id"
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
            <el-button type="primary" size="small" @click="choseFn"
              >筛选</el-button
            >
            <el-button type="info" size="small" @click="resetFn"
              >重置</el-button
            >
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
      <el-table :data="artList" style="width: 100%" border stripe>
        <el-table-column label="文章标题">
          <template v-slot="{ row }">
            <el-link type="primary" @click="showDetailFn(row.id)">{{
              row.title
            }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="分类" prop="cate_name"></el-table-column>
        <el-table-column label="发表时间" prop="pub_date">
          <template v-slot="{ row }">
            <span>{{ $formatDate(row.pub_data) }} </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="state"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="{ row }">
            <el-button type="danger" size="mini" @click="removeFn(row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChangeFn"
        @current-change="handleCurrentChangeFn"
        :current-page.sync="q.pagenum"
        :page-sizes="[2, 3, 5, 10]"
        :page-size.sync="q.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 发表文章的 Dialog 对话框 -->
    <el-dialog
      title="发表文章"
      :visible.sync="pubDialogVisible"
      fullscreen
      :before-close="handleClose"
      @close="dialogCloseFn"
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
              :value="obj.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文章内容" prop="content">
          <quill-editor
            v-model="pubForm.content"
            @blur="contentChangeFn"
          ></quill-editor>
        </el-form-item>
        <el-form-item label="文章封面" prop="cover_img">
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
        <el-form-item>
          <el-button type="primary" @click="pubArticleFn('已发布')"
            >发布</el-button
          >
          <el-button type="info" @click="pubArticleFn('草稿')"
            >存为草稿</el-button
          >
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 查看文章详情的对话框 -->
    <el-dialog title="文章预览" :visible.sync="detailVisible" width="80%">
      <h1 class="title">{{ artDetail.title }}</h1>

      <div class="info">
        <span>作者：{{ artDetail.nickname || artDetail.username }}</span>
        <span>发布时间：{{ $formatDate(artDetail.pub_date) }}</span>
        <span>所属分类：{{ artDetail.cate_name }}</span>
        <span>状态：{{ artDetail.state }}</span>
      </div>

      <!-- 分割线 -->
      <el-divider></el-divider>

      <!-- 文章的封面 -->
      <img
        v-if="artDetail.cover_img"
        :src="baseURL + artDetail.cover_img"
        alt=""
      />

      <!-- 文章的详情 -->
      <div v-html="artDetail.content" class="detail-box"></div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getArtCateListAPI,
  uploadArticleAPI,
  getArticleListAPI,
  getArticleDetailAPI,
  delArticleAPI
} from '@/api'
import { baseURL } from '@/utils/request'
// 标签和样式中，引入图片文件可以写路径，在S里引入图片要用import引入
import imgObj from '../../assets/images/cover.jpg'
export default {
  name: 'ArtList',
  data() {
    return {
      // 查询参数对象
      q: {
        pagenum: 1,
        pagesize: 5, // 默认当前页需要几条数据(传递给后台,·后台就返回几个数据)
        cate_id: '',
        state: ''
      },
      pubDialogVisible: false, // 控制发表文章对话框的显示与隐藏
      pubForm: {
        // 表单的数据对象
        title: '', // 文章分类标题
        cate_id: '', // 文章分类id
        content: '', // 文章的内容
        cover_img: '', // 封面图片（保存的是文件）
        state: '' // 文章的发布状态，可选值有两个：草稿、已发布
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
          { required: true, message: '请选择文章分类', trigger: 'change' }
        ],
        content: [
          // 校验不生效
          // 原因：
          // content对应quill-editor富文本编辑器，它不是el提供表单标签
          // el-input等输入框的在blur事件时进行校验
          // 下拉菜单，单选框，复选框，是在change事件时进行校验
          // quill-editor2个事件都没有，所以你输入内容也不会自动走校验
          // 解决：
          // 自己来给quill-editor绑定change事件(在文档里查到的它支持change事件内容改变事件)
          // 在事件处理函数中用el-form组件对象内，调用某个校验规则再重新执行（validateField)
          { required: true, message: '请输入文章内容', trigger: 'blur' }
        ],
        cover_img: [
          { required: true, message: '请选择封面', trigger: 'change' }
        ]
      },
      cateList: [], // 保存文章分类列表
      artList: [], // 文章的列表数据
      total: 0, // 总数据条数
      detailVisible: false, // 控制文章详情对话框的显示与隐藏
      artDetail: {}, // 文章的详情信息对象
      baseURL
    }
  },
  created() {
    // 请求分类数据
    this.getCateListFn()
    // 请求文章列表
    this.initArtListFn()
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
        this.$refs.imgRef.setAttribute('src', imgObj)
      } else {
        // 用户选择了文件
        this.pubForm.cover_img = files[0]
        // 把图片文件显示到img标签中
        const url = URL.createObjectURL(files[0])
        this.$refs.imgRef.setAttribute('src', url)
      }

      // 让表单单独校验封面的规则
      this.$refs.pubFormRef.validateField('cover_img')
    },
    // 表单里（点击发布或存为草稿）按钮的点击事件
    pubArticleFn(str) {
      // str的值：‘已发布’或‘草稿’
      this.pubForm.state = str
      this.$refs.pubFormRef.validate(async (valid) => {
        if (valid) {
          // 通过校验
          const fd = new FormData() // 准备一个表单数据对象的容器 FormData类是H5新出的专门未来装文件内容和其他参数的一个容器
          // fd.append('参数名',值)
          fd.append('title', this.pubForm.title)
          fd.append('cate_id', this.pubForm.cate_id)
          fd.append('content', this.pubForm.content)
          fd.append('cover_img', this.pubForm.cover_img)
          fd.append('state', this.pubForm.state)
          const { data: res } = await uploadArticleAPI(fd)
          if (res.code !== 0) return this.$message.error(res.message)
          this.$message.success(res.message)

          // 关闭对话框
          this.pubDialogVisible = false
          // 刷新文章列表->再次请求文章列表数据
          this.initArtListFn()
        } else {
          return false
        }
      })
    },
    // 富文本编辑器内容改变了触发次方法
    contentChangeFn() {
      this.$refs.pubFormRef.validateField('content')
    },
    // 发布文章-。对话框关闭时-。清空表单
    dialogCloseFn() {
      this.$refs.pubFormRef.resetFields()
      // 我们需要手动给封面标签img重新设置一个值，因为它没有收到v-model影响
      this.$refs.imgRef.setAttribute('src', imgObj)
    },
    // 获取所有的文章列表
    async initArtListFn() {
      const { data: res } = await getArticleListAPI(this.q)

      if (res.code !== 0) return this.$message.error('获取文章列表失败!')
      this.artList = res.data // 保存当前获取的文章列表
      this.total = res.total // 保存总数
    },
    // 监听 pageSize 的变化->pageSize 发生了变化
    handleSizeChangeFn(newSize) {
      // newSize:当前每页需要显示的条数
      // 为 pagesize 赋值
      this.q.pagesize = newSize
      /*  问题:先点击最后一个页码，切换每页显示条数2->3，总数不够，分页只能分到2
             每页条数改变了，页码从3到2页改变了，2个事件都会触发
            偶发性的bug:有的时候自动回到第二页有数据有的时候没有
            知识点:2个网络请求一起发，谁先回来不一定
            原因:所以可能第2页3条数据回来有值铺设，紧接着第3页的3条数据回来了，空数组所以页面就是空的
            解决:当切换每页显示的条数，我们就把当前页码设置为1，而且标签里要设置
            */
      this.q.pagenum = 1
      // 重新发起请求
      this.initArtListFn()
    },
    // 监听页码值的变化->页码值发生了变化
    handleCurrentChangeFn(newPage) {
      // newPage：当前要看的页数
      // 为页码值赋值
      this.q.pagenum = newPage
      // 重新发起请求
      this.initArtListFn()
    },
    // 筛选按钮->点击事件
    choseFn() {
      // 目的:当有了筛选的条件，我想让页码回归1，每页的条数回归2
      this.q.pagenum = 1
      this.q.pagesize = 2
      // 重新发起请求
      this.initArtListFn()
    },
    // 重置按钮->点击事件
    resetFn() {
      // 重置Q对象的属性的值
      this.q.pagenum = 1
      this.q.pagesize = 2
      this.q.cate_id = ''
      this.q.state = ''
      // 重新发起请求
      this.initArtListFn()
    },
    // 文章标题点击事件->获取文章详情
    async showDetailFn(id) {
      const { data: res } = await getArticleDetailAPI(id)
      if (res.code !== 0) return this.$message.error('获取文章详情失败!')
      this.artDetail = res.data
      // 展示对话框
      this.detailVisible = true
    },
    // 删除文章按钮的点击事件
    async removeFn(artId) {
      const { data: res } = await delArticleAPI(artId)
      if (res.code !== 0) return this.$message.error(res.message)
      this.$message.success(res.message)

      // 问题:在最后一页，删除最后一条时，虽然页码能回到上一页，但是数据没有出现
      // 原因:发现network里参数q.pagenum的值不会自己回到上一页，因为你的代码里没有修改过这个q.pagenum值，只是调用getArticleFn方法，带着之前的参数请求去了所以没数据
      // 解决:解决:在调用接口以后，刷新数组列表之前,对页码最一下处理

      // 数组里只保存当前页的数据，别的页的需要传参q给后台获取覆盖
      // 1的原因:虽然你调用删除接口但是那是后端删除，前端数组里你没有代码去修改它
      if (this.artList.length === 1) {
        if (this.q.pagenum > 1) {
          // 保证pagenum最小值为1
          this.q.pagenum--
        }
      }
      // 重新请求
      this.initArtListFn()
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

.el-pagination {
  margin-top: 15px;
}

//   查看文章详情的对话框
.title {
  font-size: 24px;
  text-align: center;
  font-weight: normal;
  color: #000;
  margin: 0 0 10px 0;
}

.info {
  font-size: 12px;
  span {
    margin-right: 20px;
  }
}

// 修改 dialog 内部元素的样式，需要添加样式穿透
::v-deep .detail-box {
  img {
    width: 500px;
  }
}
</style>
<!-- 积累知识
组件创建时,会用data里的默认值，让template里标签先渲染一次
你的网络请求数据回来，data里变量发生了变化，会让template里使用此变量的地方再次更新dom
小问题:第一次渲染的时候无值可能会导致一些报错，但是效果还是出来了
解决1:v-if先不让template里会报错的那个代码先屏蔽执行
解决2:可以先给那个对象的属性一个空字符串，别让报错就行
 -->
