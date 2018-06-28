<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" v-if="perms.indexOf('sys:role:add')!==-1" @click="handleCreate" type="primary"
                 icon="el-icon-edit">添加
      </el-button>
    </div>

    <!--指定列设置  width="330" 即可 -->
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column type="index" align="center" width="50"> </el-table-column>
      <el-table-column label="名称" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.roleName}}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色标识" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.roleKey}}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注"  align="center">
        <template slot-scope="scope">
          {{scope.row.remark}}
        </template>
      </el-table-column>
      <el-table-column align="center" width="200" label="创建时间">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span>{{scope.row.gmtCreate}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" width="200" label="更新时间">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span>{{scope.row.gmtModified}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="330" v-if="perms.indexOf('sys:role:edit')!==-1
                       || perms.indexOf('sys:role:delete')!==-1" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" v-if="perms.indexOf('sys:role:edit')!==-1" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" v-if="perms.indexOf('sys:role:delete')!==-1" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="70px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="名称" prop="roleName">
          <el-input v-model="temp.roleName" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色标识" prop="roleKey" v-if="dialogStatus=='create'">
          <el-input v-model="temp.roleKey" placeholder="请输入角色标识"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" placeholder="请输入角色备注" v-model="temp.remark">
          </el-input>
        </el-form-item>
        <el-form-item label="权限">
          <el-tree
            :data="menus"
            show-checkbox
            check-strictly
            node-key="menuId"
            :default-expanded-keys="menuIds"
            :default-checked-keys="menuIds"
            @check-change="menuChanged"
            :props="treeProps"
            ref="menuAddTree">
          </el-tree>
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
  import { getList, getRoleMenu, deleteRole, addData, updateData } from '@/api/role'
  import { getList as getMenuList } from '@/api/menu'
  import waves from '@/directive/waves' // 水波纹指令

  const defaultForm = {
    roleId: undefined,
    roleKey: '',
    roleName: '',
    remark: ''
  }

  export default {
    directives: {
      waves
    },
    data() {
      const validateName = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入角色名称'))
        } else {
          callback()
        }
      }
      const validateKey = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入角色标识'))
        } else {
          callback()
        }
      }
      return {
        perms: [],
        list: null,
        total: 0,
        listLoading: true,
        listQuery: {},
        temp: defaultForm,
        dialogStatus: '',
        dialogFormVisible: false,
        textMap: {
          update: '编辑角色',
          create: '新增角色'
        },
        rules: {
          roleName: [{ required: true, trigger: 'change', validator: validateName }],
          roleKey: [{ required: true, trigger: 'change', validator: validateKey }]
        },
        menus: [], // 系统菜单
        menuIds: [], // 角色拥有的权限1, 2, 4, 5, 6, 7, 3, 8, 9, 10, 11, 12, 13, 14
        treeProps: { // 设置节点对应数据的字段
          children: 'children',
          label: 'name'
        }
      }
    },
    created() {
      this.userPerms()
      this.fetchData()
      this.initMenuList()
    },
    methods: {
      userPerms() {
        this.perms = this.$store.state.user.perms
      },
      initMenuList() {
        getMenuList().then(response => {
          this.menus = response.data.list
        })
      },
      fetchData() {
        this.listLoading = true
        getList(this.listQuery).then(response => {
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
          roleId: undefined,
          roleKey: '',
          roleName: '',
          remark: ''
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
      getRoleMenu(roleId) {
        const params = { roleId: roleId }
        getRoleMenu(params).then(response => {
          this.menuIds = response.data.roleMenu
          this.setMenuIds(this.menuIds)
        })
      },
      handleUpdate(row) {
        this.temp = Object.assign({}, row) // copy obj
        this.getRoleMenu(this.temp.roleId)
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      // 获取选中、半选中节点
      getMenuIds() {
        this.menuIds = this.$refs.menuAddTree.getCheckedKeys().concat(this.$refs.menuAddTree.getHalfCheckedKeys())
      },
      setMenuIds(keys) {
        this.$refs.menuAddTree.setCheckedKeys(keys, true)
      },
      menuChanged(key) {
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.getMenuIds()
            this.temp.menuIds = this.menuIds.toString()
            addData(this.temp).then(this.callback)
          }
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.getMenuIds()
            this.temp.menuIds = this.menuIds.toString()
            updateData(this.temp).then(this.callback)
          }
        })
      },
      handleDelete(row) {
        const params = {
          roleId: row.roleId
        }
        deleteRole(params).then(this.callback)
      }
    }
  }
</script>
