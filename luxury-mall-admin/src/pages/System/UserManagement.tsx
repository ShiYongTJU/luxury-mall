import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Space } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  getRoles,
  AdminUser,
  CreateAdminUserData,
  UpdateAdminUserData,
  Role
} from '../../api/auth'
import { PermissionWrapper } from '../../components/Permission/PermissionWrapper'

const UserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadUsers()
    loadRoles()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await getAdminUsers()
      setUsers(data)
    } catch (error: any) {
      message.error('加载用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const data = await getRoles()
      setRoles(data)
    } catch (error: any) {
      message.error('加载角色列表失败')
    }
  }

  const handleAdd = () => {
    setEditingUser(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user)
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      phone: user.phone,
      realName: user.realName,
      status: user.status,
      roleIds: user.roles?.map(r => r.id) || []
    })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingUser) {
        const updateData: UpdateAdminUserData = {
          email: values.email,
          phone: values.phone,
          realName: values.realName,
          status: values.status,
          roleIds: values.roleIds
        }
        await updateAdminUser(editingUser.id, updateData)
        message.success('更新成功')
      } else {
        const createData: CreateAdminUserData = {
          username: values.username,
          password: values.password,
          email: values.email,
          phone: values.phone,
          realName: values.realName,
          roleIds: values.roleIds
        }
        await createAdminUser(createData)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadUsers()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150
    },
    {
      title: '真实姓名',
      dataIndex: 'realName',
      key: 'realName',
      width: 120
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          active: { text: '正常', color: 'green' },
          inactive: { text: '禁用', color: 'red' },
          locked: { text: '锁定', color: 'orange' }
        }
        const statusInfo = statusMap[status] || { text: status, color: 'default' }
        return <span style={{ color: statusInfo.color }}>{statusInfo.text}</span>
      }
    },
    {
      title: '角色',
      key: 'roles',
      render: (_: any, record: AdminUser) => record.roles?.map(r => r.name).join(', ') || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: AdminUser) => (
        <Space>
          <PermissionWrapper permission="button:user:edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </PermissionWrapper>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <PermissionWrapper permission="button:user:add">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增用户
          </Button>
        </PermissionWrapper>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={false}
      />

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          {!editingUser && (
            <>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="用户名" />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password placeholder="密码" />
              </Form.Item>
            </>
          )}
          <Form.Item name="realName" label="真实姓名">
            <Input placeholder="真实姓名" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="邮箱" />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="手机号" />
          </Form.Item>
          {editingUser && (
            <Form.Item name="status" label="状态">
              <Select>
                <Select.Option value="active">正常</Select.Option>
                <Select.Option value="inactive">禁用</Select.Option>
                <Select.Option value="locked">锁定</Select.Option>
              </Select>
            </Form.Item>
          )}
          <Form.Item name="roleIds" label="角色">
            <Select mode="multiple" placeholder="选择角色">
              {roles.map(role => (
                <Select.Option key={role.id} value={role.id}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagement

