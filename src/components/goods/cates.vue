<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加分类按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 分类表格  -->
      <tree-table :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCatDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCatDialog(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </el-card>
    <!--添加分类的对话框 -->
    <el-dialog title="商品分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClose">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- options 用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <!-- v-model是用来对data中的数据进行壮行数据绑定的，在这里同时v-model必须绑定一个数组不能是一个具体的值或者是一个对象，这里数组中的值就是，绑定数据的ID  -->
          <!-- @change事件 是只要级联选择器的 选中项发生了变化，就会触发这个事件 -->
          <el-cascader expand-trigger="hover" :options="parentCateList" :props="cascaderProps" v-model="selectedKeys" @change="parentCateChanged" clearable change-on-select></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类的对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editDialogVisible" width="50%" @close="editCatClose">
      <el-form :model="editCatForm" :rules="editCatFormRules" ref="editCatFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="editCatForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCat">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Cates',
  data() {
    return {
      // 商品分类数据列表
      cateList: [],
      //查询分类数据的条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
        total: ''
      },
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        { label: '是否有效', type: 'template', template: 'isok' },
        { label: '排序', type: 'template', template: 'order' },
        { label: '操作', type: 'template', template: 'opt' }
      ],
      //保存总数据条数
      total: 0,
      addCateDialogVisible: false,
      editDialogVisible: false,
      addCateForm: {
        // 分类的名称
        cat_name: '',
        // 分类的父级的ID
        cat_pid: 0,
        // 分类的层级，0表示一级分类，1表示二级分类，2表示三级分类
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [{ required: true, message: '请输入正确分类', triggle: 'blur' }]
      },
      // 父级分类列表
      parentCateList: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedKeys: [],
      editCatForm: {
        cat_id:'',
        cat_name: ''
      },
      editCatFormRules: {
        cat_name: [{ required: true, message: '请输入正确分类', triggle: 'blur' }]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      //获取商品分类数据
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败')
      }
      //将数据列表赋值给cateList
      this.cateList = res.data.result
      //保存总数据条数
      this.total = res.data.total
      // console.log(res.data);
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    //点击添加分类弹出对话框的方法
    showAddCateDialog() {
      //获取父级分类的数据列表
      this.getPraentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类列表的方法
    async getPraentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 } //获取前两级的分类
      })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类列表失败')
      // 将获取的数据保存到父级分类列表中
      this.parentCateList = res.data
    },
    // 选择项发生变化就会触发这个函数
    parentCateChanged() {
      console.log(this.selectedKeys)
      // 如果selectedeKeys的length 大于0 说明选中了父级的分类 反之没有选中任何的父级分类 这时候添加的分来自己就是最大父级
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 当前分类的层级
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 添加新的分类
    addCate() {
      // 进行一个预判是否输入输入新的分类
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return false
        // 向后台发起提交新的分类
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 添加成功以后重置表单的方法
    addCateDialogClose() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 展示编辑分类的方法
    async editCatDialog(id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取分类信息失败')
      this.editCatForm = res.data
      this.editDialogVisible = true
    },
    // 编辑分类的方法
    editCat() {
      this.$refs.editCatFormRef.validate(async (valid) => {
        //   做一个预校验
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + this.editCatForm.cat_id, {
          cat_name: this.editCatForm.cat_name
        })
        if (res.meta.status !== 200) this.$message.error('编辑分类失败')
        this.getCateList()
        this.editDialogVisible = false
        this.$message.success('编辑分类成功')
      })
    },
    editCatClose() {
       this.$refs.editCatFormRef.resetFields()
       this.editCatForm.cat_name= ''
    },
    // 删除分类的方法
   async removeCatDialog(id){
      //弹出确定取消框，是否删除用户
      const confirmResult = await this.$confirm('请问是否要永久删除该用户', '删除提示', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      //如果用户点击确认，则confirmResult 为'confirm'
      //如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult != 'confirm') {
        return this.$message.info('已经取消删除')
      }
      //发送请求根据id完成删除操作
      const { data: res } = await this.$http.delete('categories/' + id)
      if(res.meta.status !==200) return this.$message.error('删除分类失败')
       this.$message.success('删除分类成功')  
     this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-col {
  margin-bottom: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
