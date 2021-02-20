<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 这里是用element-ui的方法去渲染数据，这里也很重要。这里的data就是从后端拿到的数据。要记得加冒号进行数据绑定 -->
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <!-- 这里渲染状态是用作用域插槽来进行的  -->
          <template slot-scope="scope">
            <!--这里获取状态的scope.row是固定语法。要记住 -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"> </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUser(scope.row.id)"></el-button>
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页功能区 -->
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </el-card>
    <!-- 这里是添加用户的对话框 -->
    <el-dialog title="提示" :visible.sync="addDialogVisible" width="30%" @close="addDialogClosed">
      <!-- 添加用户框的主体数据 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 对话框主体区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户:{{ userInfo.username }}</p>
        <p>当前的角色:{{ userInfo.role_name }}</p>
        <p>
          分配新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo" >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: '',
  data() {
    //   验证邮箱规则
    const checkEmail = (rule, value, cb) => {
      const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if (regEmail.test(value)) {
        //  验证成功以后要调用cb()
        return cb()
      }
      //  验证失败以后要调用cb()
      cb(new Error('请输入正确邮箱'))
    }
    //   验证手机号的规则
    const checkMobile = (rule, value, cb) => {
      const regMobile = /^1[3|4|5|7|8][0-9]{9}$/
      if (regMobile.test(value)) {
        cb()
      }
      cb(new Error('请输入正确的手机号码'))
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      userInfo: {},
      selectedRoleId:'',
      rolesList:'',
      setRoleDialogVisible: false,
      //  添加用户的弹出框的状态
      addDialogVisible: false,
      //   修改用户弹出框的状态
      editDialogVisible: false,
      // 添加用户列表的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名在3~10个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '用户名在6~15个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, message: '邮箱格式不正确，请重新输入', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, message: '手机号码不正确，请重新输入', trigger: 'blur' }
        ]
      },
      editForm: { username: '', email: '', mobile: '' },
      editFormRules: { email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, message: '邮箱格式不正确，请重新输入', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, message: '手机号码不正确，请重新输入', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      // 从后台获取数据，通过GET方法，传值是固定语法
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        //   判断状态来提示是否获取用户列表成功
        return this.$message.error('获取用列表失败')
      }
      //   获取列表成功以后将数据接受过来，将数据保存到data中
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 更新页面条数的方法
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 这里是更新用户状态的方法
    async userStateChanged(userChange) {
      // 通过put方法向后台提交更新以后的用户状态数据
      const { data: res } = await this.$http.put(`users/${userChange.id}/state/${userChange.mg_state}`)
      if (res.meta.status !== 200) {
        // 如果更新状态失败了，这里为了保持前后台数据一样，需要将状态还原到未改变的样子
        userInfo.mg_state = !userInfo.mg_state
        this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    // 点击取消按钮清空添加用户的输入框里面所有的值
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户的方法
    addUser() {
      // 点击确定按钮添加新用户
      this.$refs.addFormRef.validate(async (valid) => {
        //  判断输入框的信息是否完整
        if (!valid) return this.$message.error('请填写完整信息')
        // 确定完整以后像后端发起请求添加用户
        const { data: res } = await this.$http.post('users', this.addForm)
        // 判断用户是否添加成功
        if (res.meta.status !== 201) return this.$message.error('添加用户失败哦！')
        this.$message.success('添加用户成功')

        this.addDialogVisible = false
        this.getUserList()
      })
    },
    // 展示编辑用户对话框的方法
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户信息失败')
      }
      // 获取了用户信息 填充到对话框中
      this.editForm = res.data
      // 现实弹出框
      this.editDialogVisible = true
    },
    // 编辑用户完成以后清空对话框
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息并提交到后端的方法
    editUser() {
      this.$refs.editFormRef.validate(async (valid) => {
        //   做一个预校验
        if (!valid) return
        // 向后端发起请求提交数据
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        //判断如果修改失败，就做提示
        if (res.meta.status !== 200) return this.$message.error('修改用户失败')
        // 关闭弹窗
        this.editDialogVisible = false
        // 重新刷新用户列表
        this.getUserList
        // 提示修改成功的信息
        this.$message.success('修改用户信息成功')
      })
    },
    async removeUser(id) {
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
      const { data: res } = await this.$http.delete('users/' + id)
      //判断如果删除失败，就做提示
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      //修改成功的提示
      this.$message.success('删除用户成功')
      //重新请求最新的数据
      // 解决BUG:最后页码的最后一页，只剩一条数据时，点击删除后：页码会-1，但是对应的用户信息 还是停留在上一页为空的状态，并且删除后页码-1，也必须在页码总数大于1的情况，不然就为0页了，最少也是一页
      if (document.querySelectorAll('.el-card tbody tr').length === 1) {
        this.queryInfo.pagenum = this.queryInfo.pagenum > 1 ? this.queryInfo.pagenum - 1 : 1
      }

      this.getUserList()
    },
    // 分配角色的方法
    // 展示分配角色的对话框
    async setRole(userInfo) {
      this.userInfo = userInfo
      // 展示对话框之前，获取所有的角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      // console.log(this.rolesList)
      this.setRoleDialogVisible = true
    },
    // 点击按钮，分配角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        // 没有选中角色
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })
      if (res.meta.status !== 200) {
        return this.$message.error('更新用户角色失败')
      }
      this.$message.success('更新用户角色成功')
      // 更新用户信息列表
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    setRoleDialogClosed(){
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
.el-pagination {
  margin-top: 15px;
}
</style>
