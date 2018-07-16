<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="用户"
                v-model="listQuery.username">
      </el-input>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">查询</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" v-if="perms.indexOf('sys:user:add')!==-1" @click="handleCreate" type="primary"
                 icon="el-icon-edit">添加
      </el-button>
    </div>

    <!--指定列设置  width="330" 即可 -->
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column label="UID" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.userId}}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.username}}</span>
        </template>
      </el-table-column>
      <el-table-column label="昵称"  align="center">
        <template slot-scope="scope">
          <span>{{scope.row.nickname}}</span>
        </template>
      </el-table-column>
      <el-table-column label="描述" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.desc}}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色标识" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.roleKey}}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="用户状态" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{scope.row.status | msgFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span>{{scope.row.gmtCreate}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="更新时间" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span>{{scope.row.gmtModified}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="330"
                       v-if="perms.indexOf('sys:user:edit')!==-1 || perms.indexOf('sys:user:modify')!==-1
                       || perms.indexOf('sys:user:delete')!==-1 || perms.indexOf('sys:user:resetPwd')!==-1"
                       class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" v-if="perms.indexOf('sys:user:edit')!==-1" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button v-if="scope.row.status!='1' && perms.indexOf('sys:user:modify')!==-1" size="mini" @click="handleModifyStatus(scope.row, 1)">激活
          </el-button>
          <el-button v-if="scope.row.status!='0' && perms.indexOf('sys:user:modify')!==-1" size="mini" @click="handleModifyStatus(scope.row, 0)">禁用
          </el-button>
          <el-button size="mini" type="danger" v-if="perms.indexOf('sys:user:delete')!==-1" @click="handleDelete(scope.row)">删除
          </el-button>
          <el-button type="primary" size="mini" v-if="perms.indexOf('sys:user:resetPwd')!==-1" @click="handleUpdatePwd(scope.row)">重置密码</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="listQuery.page"
                     :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit"
                     layout="total, sizes, prev, pager, next" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="70px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="temp.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogStatus=='create'">
          <el-input v-model="temp.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="temp.nickname" placeholder="请输入昵称"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="status">
          <el-select class="filter-item" v-model="temp.roleKey" placeholder="Please select">
            <el-option v-for="item in roleList" :key="item.roleKey" :label="item.roleName" :value="item.roleKey"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status" v-if="dialogStatus=='create'">
          <el-select class="filter-item" v-model="temp.status" placeholder="Please select">
            <el-option v-for="item in userStatus" :key="item.status" :label="item.value" :value="item.status"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <el-upload ref="upload" class="avatar-uploader" :action="config.uploadUrl" :data="config.updateData"
                     :headers="config.uploadHeaders" :show-file-list="false"
                     :on-success="handleUploadSuccess" :before-upload="beforeUpload">
            <img v-if="temp.avatarUrl" :src="temp.avatarUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" placeholder="请输入用户描述" v-model="temp.desc">
          </el-input>
        </el-form-item>
        <!--<el-form-item label="日期" prop="gmtCreate">-->
          <!--<el-date-picker v-model="temp.gmtCreate" type="datetime" placeholder="Please pick a date">-->
          <!--</el-date-picker>-->
        <!--</el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确定</el-button>
        <el-button v-else type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import { getList, modifyStatus, deleteUser, resetPwd, addData, updateData } from '@/api/user'
  import { getList as getRoleList } from '@/api/role'
  import waves from '@/directive/waves' // 水波纹指令
  import { isvalidUsername } from '@/utils/validate'

  const defaultForm = {
    userId: undefined,
    username: '',
    password: '', // 密码
    nickname: '', // 昵称
    avatar: '', // 头像
    avatarUrl: '', // 头像Url
    status: '0', // 状态
    roleKey: '', // 角色标识
    desc: '' // 描述
  }

  const userStatus = [
    { status: '0', value: '禁用' },
    { status: '1', value: '激活' }
  ]

  const uploadConfig = {
    uploadUrl: '',
    updateData: { urlPrefix: '/avatar' },
    uploadHeaders: { 'X-Token': '' } // 防止被服务器拦截器拦截
  }

  export default {
    directives: {
      waves
    },
    data() {
      const validatePass = (rule, value, callback) => {
        if (value.length < 5) {
          callback(new Error('密码不能小于5位'))
        } else {
          callback()
        }
      }
      const validateUsername = (rule, value, callback) => {
        if (!isvalidUsername(value)) {
          callback(new Error('请输入正确的用户名'))
        } else {
          callback()
        }
      }
      return {
        config: uploadConfig,
        perms: [],
        list: null,
        roleList: null,
        total: 0,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 10,
          username: ''
        },
        temp: defaultForm,
        userStatus,
        dialogStatus: '',
        dialogFormVisible: false,
        textMap: {
          update: '编辑用户',
          create: '新增用户'
        },
        rules: {
          username: [{ required: true, trigger: 'change', validator: validateUsername }],
          password: [{ required: true, trigger: 'change', validator: validatePass }]
        }
      }
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          1: 'success',
          0: 'gray'
        }
        return statusMap[status]
      },
      msgFilter(status) {
        const statusMap = {
          1: '正常',
          0: '禁用'
        }
        return statusMap[status]
      }
    },
    created() {
      this.initConfig()
      this.userPerms()
      this.fetchData()
    },
    methods: {
      initConfig() {
        this.config.uploadUrl = this.$store.state.user.uploadUrl
        this.config.uploadHeaders['X-Token'] = this.$store.state.user.token
      },
      initRoleList() {
        getRoleList(this.listQuery).then(response => {
          this.roleList = response.data.list
        })
      },
      userPerms() {
        this.perms = this.$store.state.user.perms
      },
      fetchData() {
        this.listLoading = true
        this.initRoleList()
        getList(this.listQuery).then(response => {
          this.list = response.data.list
          this.total = response.data.total
          this.listLoading = false
        })
      },
      callback(response) {
        this.listQuery.page = 1
        this.fetchData()
        const type = response.data.code === 200 ? 'success' : 'error'
        const title = response.data.code === 200 ? '成功' : '失败'
        if (this.dialogFormVisible) {
          this.dialogFormVisible = false
        }
        this.$notify({
          title: title,
          message: response.data.msg,
          type: type,
          duration: 2000
        })
      },
      handleSizeChange(val) {
        this.listQuery.limit = val
        this.fetchData()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.fetchData()
      },
      handleFilter() {
        // console.log('perms:' + this.perms)
        this.listQuery.page = 1
        this.fetchData()
      },
      resetTemp() {
        this.temp = {
          userId: undefined,
          username: '',
          password: '', // 密码
          nickname: '', // 昵称
          avatar: '', // 头像
          avatarUrl: '', // 头像Url
          status: '0', // 状态
          roleKey: '', // 角色标识
          desc: '' // 描述
        }
      },
      handleCreate() {
        this.resetTemp()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      handleUpdate(row) {
        this.temp = Object.assign({}, row) // copy obj
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      handleModifyStatus(row, status) {
        const params = {
          userId: row.userId,
          status: status
        }
        modifyStatus(params).then(this.callback)
      },
      handleUpdatePwd(row) {
        const params = {
          userId: row.userId,
          password: '123456'
        }
        resetPwd(params).then(this.callback)
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            addData(this.temp).then(this.callback)
          }
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            updateData(this.temp).then(this.callback)
          }
        })
      },
      handleDelete(row) {
        const params = {
          userId: row.userId
        }
        deleteUser(params).then(this.callback)
      },
      // TODO 文件上传处理
      handleUploadSuccess(res, file) {
        if (res.code === 200) {
          this.temp.avatarUrl = res.visitPath
          this.temp.avatar = res.resPath
          // console.log(JSON.stringify(res))
        } else {
          this.callback(res)
        }
      },
      beforeUpload(file) {
        // 上传前的格式大小等校验
      }
    }
  }
</script>
