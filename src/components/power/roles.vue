<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
      <el-table :data="roleList" border>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="deleteRight(scope.row, item1.id)"> {{ item1.authName }} </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二，三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限  -->
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="deleteRight(scope.row, item2.id)">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 这里的close事件需要传两个参数，一个是scope. row     另外一个就是ID 主要是为了确保能这直接拿到该角色下面的权限  -->
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="deleteRight(scope.row, item3.id)">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeDialog(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色的对话框 -->
    <el-dialog title="提示" :visible.sync="addDialogVisible" width="30%">
      <el-form :model="addForm" ref="addFormRef" label-width="100px">
        <el-form-item label="角色名称">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUsers">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色的对话框 -->
    <el-dialog title="修改角色信息" :visible.sync="editdialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" ref="ruleFormRef" label-width="100px">
        <el-form-item label="角色名称">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser(editForm)">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限角色的对话框 -->
    <el-dialog title="提示" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClose">
      <el-tree :data="rightsList" :props="treeProps" ref="treeRef" :default-checked-keys="defKeys" default-expand-all show-checkbox node-key="id"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',

  data() {
    return {
      roleList: [],
      rightsList: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      editdialogVisible: false,
      addDialogVisible: false,
      editForm: {},
      addForm: {},
      setRightDialogVisible: false,
      defKeys: [],
      roleId: ''
      // editFormid: null
      // editFormRules:{}
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    // 渲染角色列表的方法
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.roleList = res.data
    },
    // 添加用户觉得的方法
    async addUsers() {
      const { data: res } = await this.$http.post('roles', {
        roleName: this.addForm.roleName,
        roleDesc: this.addForm.roleDesc
      })
      if (res.meta.status !== 201) return this.$message.error('添加角色失败')
      this.$message.success('添加角色成功')
      this.addDialogVisible = false
      this.getRoleList()
    },
    // 编辑角色列表的方法
    async showEditDialog(id) {
      this.editFormid = id
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取编辑角色列表失败')
      // 通过展开运算符拿到ID 再次将ID传到编辑的方法中去
      this.editForm = { ...res.data, id: id }
      this.editdialogVisible = true
    },
    // 编辑完成以后清空编辑对话框的方法
    editDialogClosed() {
      this.$refs.ruleFormRef.resetFields()
    },
    // 编辑角色列表的方法
    async editUser() {
      //  这里的ID是由上面的获取方法中拿到的id
      const { data: res } = await this.$http.put('roles/' + this.editForm.id, {
        roleName: this.editForm.roleName,
        roleDesc: this.editForm.roleDesc
      })

      if (res.meta.status !== 200) return this.$message.error('修改角色失败')
      this.editdialogVisible = true
      this.getRoleList()
      this.$message.success('修改角色成功')
    },
    // 删除角色的方法
    async removeDialog(id) {
      //弹出确定取消框，是否删除用户
      const confirmResult = await this.$confirm('请问是否要永久删除该用户', '删除提示', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      console.log(confirmResult)
      //如果用户点击确认，则confirmResult 为'confirm'
      //如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult != 'confirm') {
        return this.$message.info('已经取消删除')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      //修改成功的提示
      this.$message.success('删除用户成功')
      //重新请求最新的数据
      this.getRoleList()
    },
    // 删除权限角色的方法
    async deleteRight(role, rightId) {
      //弹窗提示用户是否要删除
      const confirmResult = await this.$confirm('请问是否要删除该权限', '删除提示', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (confirmResult != 'confirm') {
        return this.$message.info('已经取消删除')
      }
      //当发送delete请求之后，返回的数据就是最新的角色权限信息
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('删除角色权限失败')
      //无需再重新加载所有权限,
      //只需要对现有的角色权限进行更新即可
      // this.getRoleList();
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      // 存储角色 ID，修改角色权限接口会用到
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      this.rightsList = res.data
      // 递归存储三级节点的 ID
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 这里要用一个递归函数，需要通过一级权限去找二级权限下面的三级权限的id，本质上可以使用三级for循环，但是用递归函数更加有效率
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      // 这里就是递归函数的调用
      node.children.forEach((item) => this.getLeafKeys(item, arr))
    },
    // 在点开分配权限的时候有个bug,就是如果关闭以后，点击其他角色的权限时，会记录上一个角色的权限，所以要定义一个方法在关闭这个设置权限的对话框的时候，同时清空之前的角色的权限状态
    setRightDialogClose() {
      this.defKeys = []
    },
    // 定义一个编辑权限的方法
    async allotRight() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr
      })
      if (res.meta.status !== 200) return this.$message.error('设置权限失败')
      this.$message.success('设置权限成功')
      this.getRoleList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #ccc;
}
.bdbottom {
  border-bottom: 1px solid #ccc;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
