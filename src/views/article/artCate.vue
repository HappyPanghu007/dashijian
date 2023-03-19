<template>
  <div>
    <!-- 预览文章分类 -->
    <el-card class="box-card">
      <div slot="header" class="clearfix header-box">
        <span>文章分类</span>
        <el-button type="primary" size="mini" @click="addCateShowDialogBtnFn"
          >添加分类</el-button
        >
      </div>
      <el-table :data="cateList" style="width: 100%" border stripe>
        <!-- type是table-column内置属性，你告诉他用index，意思就是第一个单元格用索引值 -->
        <el-table-column
          type="index"
          label="序号"
          width="100"
        ></el-table-column>
        <el-table-column prop="cate_name" label="分类名称"></el-table-column>
        <el-table-column prop="cate_alias" label="分类别名"></el-table-column>
        <el-table-column label="操作">
          <!-- scope对象 : { row： 行对象} -->
          <template v-slot="scope">
            <el-button
              type="primary"
              size="mini"
              @click="updateCateBtnFn(scope.row)"
              >修改</el-button
            >
            <el-button type="danger" size="mini">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加文章分类的对话框
    el-dialog对话框组件
        title:左上角标题
        visible:控制对话框是否显示(右侧Vue变量为true显示，为false就隐藏)
        visible.sync:组件内检测到对话框关闭(点击蒙层，按esc，按右上角x)，它会回传false给右侧vue变量
        before-close:对话框关闭前回调
            可以在内部用done()关闭对话框什么都不调用就会阻止对话框关闭

        扩展知识点:.sync是Vue2.3版本新增
        .sync类似v-model，可以给子组件实现"双向数据绑定"
        复习: v-model如何给子组件实现双向数据绑定（父Vue变量要传给子组件，子组件传出的值也要自动绑定到父Vue变量)
        v-model本质:给所在标签绑定:value="Vue变量"@input="val => Vue变量= val"
        <标签· v-model="Vue变量"></标签>
        运行时如下
        <标签:value="Vue变量”@input="val =>Vue变量= val"></标签>
        .sync本质:给所在标签绑定:props属性名="Vue变量"@update:props属性名="val => Vue变量= val"
        <标签:visible.sync="Vue变量"></标签>
        运行时如下
        <标签 :visible="Vue变量”@update:visible="val => Vue变量= val"></标签>
        子组件内子传父的时候 this.$emit( 'update:visible'，值)
        Vue2里面它可以用多次,Vue3里面把它移除了

 -->
    <el-dialog
      title="添加文章分类"
      :visible.sync="addVisible"
      width="35%"
      @close="dialogCloseFn"
    >
      <!-- 添加的表单 -->
      <el-form
        :model="addForm"
        :rules="addRules"
        ref="addRef"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="cate_name">
          <el-input
            v-model="addForm.cate_name"
            minlength="1"
            maxlength="10"
          ></el-input>
        </el-form-item>
        <el-form-item label="分类别名" prop="cate_alias">
          <el-input
            v-model="addForm.cate_alias"
            minlength="1"
            maxlength="15"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancelFn">取 消</el-button>
        <el-button size="mini" type="primary" @click="addFn">添 加</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* 经验:如果用同一个按钮，想要做状态区分
1.定义一个标记变量isEdit (true编辑,false新增),还要定义本次要编辑的数据唯一id值, veditId
2.在点击修改的时候，isEdit改为true ,  editId保存要修改的数据id
3.在点击新增按钮的时候,-isEdit改为false, editId置空
4。在点击保存按钮时(确定按钮时)，就可以用isEdit变量做区分了
 */

import { getArtCateListAPI, addArtCateAPI, updateArtCateAPI } from '@/api'
export default {
  name: 'ArtCate',
  data() {
    return {
      cateList: [], // 文章分类的列表
      addVisible: false, // 添加分类-对话框是否显示
      addForm: {
        // 添加表单的数据对象
        cate_name: '',
        cate_alias: ''
      },
      addRules: {
        // 添加表单的验证规则对象
        cate_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          {
            pattern: /^\S{1,10}$/,
            message: '分类名必须是1-10位的非空字符',
            trigger: 'blur'
          }
        ],
        cate_alias: [
          { required: true, message: '请输入分类别名', trigger: 'blur' },
          {
            pattern: /^[a-zA-Z0-9]{1,15}$/,
            message: '分类别名必须是1-15位的字母数字',
            trigger: 'blur'
          }
        ]
      },
      isEdit: false, // true为编辑状态,false新增状态
      editId: '' // 保存正在要编辑的数据id值
    }
  },
  created() {
    // 获取文章分类的列表
    this.getArtCateFn()
  },
  methods: {
    // 获取文章分类的列表
    async getArtCateFn() {
      const res = await getArtCateListAPI()
      this.cateList = res.data.data
    },
    // 添加分类按钮点击事件
    addCateShowDialogBtnFn() {
      this.addVisible = true
      this.isEdit = false
      this.editId = ''
    },
    // 对话框内-添加按钮-点击事件
    async addFn() {
      // 表单预校验
      this.$refs.addRef.validate(async (valid) => {
        if (valid) {
          // 判断当前是新增还是编辑
          if (this.isEdit) {
            // 编辑状态
            // 调用接口传递数据给后台
            const { data: res } = await updateArtCateAPI({
              id: this.editId,
              ...this.addForm
            })
            if (res.code !== 0) return this.$message.error('更新分类失败！')
            this.$message.success('更新分类成功！')
          } else {
            // 新增
            // 调用接口传递数据给后台
            const { data: res } = await addArtCateAPI(this.addForm)
            if (res.code !== 0) return this.$message.error('添加分类失败！')
            this.$message.success('添加分类成功！')
          }

          // 重新请求列表数据
          this.getArtCateFn()
          // 关闭对话框
          this.addVisible = false
        } else {
          return false
        }
      })
    },
    // 对话框内-取消按钮-点击事件
    cancelFn() {
      this.addVisible = false
    },
    // 对话框关闭的回调
    dialogCloseFn() {
      this.$refs.addRef.resetFields()
    },
    // 修改按钮的点击事件
    updateCateBtnFn(obj) {
      // obj的值:{ id:文章分类id, cate_name:文章分类名字, cate_alias:文章分类别名}
      this.addVisible = true
      this.editId = obj.id
      this.isEdit = true
      // 数据回显（回填）
      this.addForm.cate_name = obj.cate_name
      this.addForm.cate_alias = obj.cate_alias
    }
  }
}
</script>

  <style lang="less" scoped>
.header-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
