import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, message, Upload, Space, Tree } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  uploadRoleExcel,
  getPermissions,
  Role,
  CreateRoleData,
  UpdateRoleData,
  Permission
} from '../../api/auth'
import { PermissionWrapper } from '../../components/Permission/PermissionWrapper'

const { TextArea } = Input

const RoleManagement = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadRoles()
    loadPermissions()
  }, [])

  const loadRoles = async () => {
    try {
      setLoading(true)
      const data = await getRoles()
      setRoles(data)
    } catch (error: any) {
      message.error('加载角色列表失败')
    } finally {
      setLoading(false)
    }
  }

  const loadPermissions = async () => {
    try {
      const data = await getPermissions(true)
      setPermissions(data)
    } catch (error: any) {
      message.error('加载权限列表失败')
    }
  }

  const handleAdd = () => {
    setEditingRole(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    form.setFieldsValue({
      name: role.name,
      code: role.code,
      description: role.description,
      permissionIds: role.permissions?.map(p => p.id) || []
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteRole(id)
      message.success('删除成功')
      loadRoles()
    } catch (error: any) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingRole) {
        const updateData: UpdateRoleData = {
          name: values.name,
          description: values.description,
          permissionIds: values.permissionIds
        }
        await updateRole(editingRole.id, updateData)
        message.success('更新成功')
      } else {
        const createData: CreateRoleData = {
          name: values.name,
          code: values.code,
          description: values.description,
          permissionIds: values.permissionIds || []
        }
        await createRole(createData)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadRoles()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  const handleUpload = async (file: File) => {
    try {
      const result = await uploadRoleExcel(file)
      message.success(`导入完成：成功 ${result.success} 条，失败 ${result.failed} 条`)
      if (result.errors.length > 0) {
        console.error('导入错误：', result.errors)
      }
      loadRoles()
    } catch (error: any) {
      message.error('导入失败')
    }
    return false
  }

  // 将权限转换为树形数据
  const getTreeData = (perms: Permission[]): any[] => {
    return perms.map(perm => ({
      title: perm.name,
      key: perm.id,
      children: perm.children ? getTreeData(perm.children) : undefined
    }))
  }

  const columns = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '角色代码',
      dataIndex: 'code',
      key: 'code',
      width: 150
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '系统角色',
      dataIndex: 'isSystem',
      key: 'isSystem',
      width: 100,
      render: (isSystem: boolean) => (isSystem ? '是' : '否')
    },
    {
      title: '权限数量',
      key: 'permissionCount',
      width: 100,
      render: (_: any, record: Role) => record.permissions?.length || 0
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Role) => (
        <Space>
          <PermissionWrapper permission="button:role:edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={record.isSystem}
            >
              编辑
            </Button>
          </PermissionWrapper>
          <PermissionWrapper permission="button:role:delete">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: '确认删除',
                  content: `确定要删除角色"${record.name}"吗？`,
                  onOk: () => handleDelete(record.id)
                })
              }}
              disabled={record.isSystem}
            >
              删除
            </Button>
          </PermissionWrapper>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <PermissionWrapper permission="button:role:add">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增角色
            </Button>
          </PermissionWrapper>
          <PermissionWrapper permission="button:role:import">
            <Upload
              beforeUpload={handleUpload}
              showUploadList={false}
              accept=".xlsx,.xls"
            >
              <Button icon={<UploadOutlined />}>导入Excel</Button>
            </Upload>
          </PermissionWrapper>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={roles}
        loading={loading}
        rowKey="id"
        pagination={false}
      />

      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          {!editingRole && (
            <Form.Item
              name="code"
              label="角色代码"
              rules={[{ required: true, message: '请输入角色代码' }]}
            >
              <Input placeholder="如：editor" />
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="如：编辑员" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="角色描述" />
          </Form.Item>
          <Form.Item name="permissionIds" label="权限">
            <Tree
              checkable
              treeData={getTreeData(permissions)}
              defaultCheckedKeys={editingRole?.permissions?.map(p => p.id) || []}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default RoleManagement

