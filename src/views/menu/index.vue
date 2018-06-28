<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" v-if="perms.indexOf('sys:menu:add')!==-1" @click="handleCreate(-1, 0)" type="primary"
                 icon="el-icon-edit">添加
      </el-button>
    </div>

    <tree-table :data="list" :columns="columns" border fit highlight-current-row>
      <el-table-column class-name="status-col" label="类型" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.type | statusFilter">{{scope.row.type | msgFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="250" v-if="perms.indexOf('sys:menu:edit')!==-1
                       || perms.indexOf('sys:menu:delete')!==-1 || perms.indexOf('sys:menu:add')!==-1"
                       class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" v-if="perms.indexOf('sys:menu:edit')!==-1" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" v-if="perms.indexOf('sys:menu:delete')!==-1" @click="handleDelete(scope.row)">删除</el-button>
          <el-button type="primary" size="mini" v-if="scope.row.type !== 2 && perms.indexOf('sys:menu:add')!==-1"
                     @click="handleCreate(scope.row.menuId, scope.row.type+1)">添加
          </el-button>
        </template>
      </el-table-column>
    </tree-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="100px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入菜单名称"></el-input>
        </el-form-item>
        <el-form-item label="授权标识" prop="perms">
          <el-input v-model="temp.perms" placeholder="请输入授权标识"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input-number v-model="temp.orderNum" ></el-input-number>
        </el-form-item>
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
  import { getList, deleteMenu, addData, updateData } from '@/api/menu'
  import waves from '@/directive/waves' // 水波纹指令
  import TreeTable from '@/components/TreeTable/index'

  const defaultForm = {
    menuId: undefined,
    parentId: 0,
    name: '', // 名称
    perms: '', // 头像Url
    type: 0, // 类型 0：目录 1：菜单 2：按钮
    orderNum: 0 // 排序
  }

  export default {
    components: { TreeTable },
    directives: {
      waves
    },
    data() {
      const validateName = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入菜单名称'))
        } else {
          callback()
        }
      }
      const validatePerms = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入权限标识'))
        } else {
          callback()
        }
      }
      return {
        columns: [
          { text: 'MenuId', value: 'menuId' },
          { text: 'ParentId', value: 'parentId' },
          { text: '名称', value: 'name' },
          { text: '授权标识', value: 'perms' },
          { text: '排序', value: 'orderNum' }
        ],
        perms: [],
        list: [],
        total: 0,
        listLoading: true,
        listQuery: {},
        temp: defaultForm,
        dialogStatus: '',
        dialogFormVisible: false,
        textMap: {
          update: '编辑菜单',
          create: '新增菜单'
        },
        rules: {
          name: [{ required: true, trigger: 'change', validator: validateName }],
          perms: [{ required: true, trigger: 'change', validator: validatePerms }]
        }
      }
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          2: 'danger',
          1: 'success',
          0: 'gray'
        }
        return statusMap[status]
      },
      msgFilter(status) {
        const statusMap = {
          2: '按钮',
          1: '菜单',
          0: '目录'
        }
        return statusMap[status]
      }
    },
    created() {
      this.userPerms()
      this.fetchData()
    },
    methods: {
      userPerms() {
        this.perms = this.$store.state.user.perms
      },
      fetchData() {
        this.listLoading = true
        getList(this.listQuery).then(response => {
          // this.list = response.data.list
          this.list = response.data.list
          this.listLoading = false
        })
      },
      callback(response) {
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
      resetTemp() {
        this.temp = {
          menuId: undefined,
          parentId: 0,
          name: '', // 名称
          perms: '', // 头像Url
          type: 0, // 类型 0：目录 1：菜单 2：按钮
          orderNum: 0 // 排序
        }
      },
      handleCreate(parentId, type) {
        this.resetTemp()
        this.temp.parentId = parentId
        this.temp.type = type
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
          menuId: row.menuId
        }
        deleteMenu(params).then(this.callback)
      }
    }
  }
</script>
