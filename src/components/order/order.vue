<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 这里是用element-ui的方法去渲染数据，这里也很重要。这里的data就是从后端拿到的数据。要记得加冒号进行数据绑定 -->
      <!-- 用户列表区域 -->
      <el-table :data="orderList" border style="width: 100%">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="300"> </el-table-column>
        <el-table-column prop="order_price" label="订单价格(元)" width="110"> </el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"> </el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">{{ scope.row.create_time | dataFormat('yyyy-MM-dd hh:mm:ss') }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130">
          <el-tooltip class="item" effect="dark" content="修改订单地址" placement="top" :enterable="false">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editAtress"></el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="物流信息" placement="top" :enterable="false">
            <el-button type="success" icon="el-icon-location-information" size="mini" @click="showProgressBox"></el-button>
          </el-tooltip>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
    </el-card>

    <!-- 修改物流地址的对话框 -->
    <el-dialog title="修改地址" :visible.sync="editAtressdialogVisible" width="50%" @close="addressDialogClosed">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader v-model="addressForm.adress1" :options="cityData"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editAtressdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddress">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 展示物流信息的对话框 -->
    <el-dialog title="物流信息" :visible.sync="ProgressDialogVisible" width="50%" >
      <span>这是一段信息</span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata'
export default {
  name: 'Order',

  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      orderList: [],
      total: 0,
      editAtressdialogVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [{ required: true, message: '请选择省市区县', trigger: 'blur' }],
        address2: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      },
      cityData,
      ProgressDialogVisible:false
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 这是获取订单的方法
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      this.total = res.data.total
      this.orderList = res.data.goods
    },
    //拿到页面条数的方法
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    //拿到新的页面数的方法
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    //添加物流地址的方法
    editAtress() {
      this.editAtressdialogVisible = true
    },
    // 添加完成以后关闭对话框的方法
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    editAddress() {
      this.editAtressdialogVisible = false
    },
    //展示物流信息的方法
    showProgressBox() {
      this.ProgressDialogVisible=true
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
