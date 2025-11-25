import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, InputNumber, message, Upload, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  uploadPermissionExcel,
  Permission,
  CreatePermissionData,
  UpdatePermissionData
} from '../../api/auth'
import { PermissionWrapper } from '../../components/Permission/PermissionWrapper'

const { TextArea } = Input

const PermissionManagement = () => {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadPermissions()
  }, [])

  const loadPermissions = async () => {
    try {
      setLoading(true)
      const data = await getPermissions(true) // 获取树形结构
      setPermissions(data)
    } catch (error: any) {
      message.error('加载权限列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingPermission(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission)
    form.setFieldsValue({
      code: permission.code,
      name: permission.name,
      type: permission.type,
      parentId: permission.parentId,
      path: permission.path,
      description: permission.description,
      sortOrder: permission.sortOrder
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deletePermission(id)
      message.success('删除成功')
      loadPermissions()
    } catch (error: any) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingPermission) {
        const updateData: UpdatePermissionData = {
          name: values.name,
          path: values.path,
          description: values.description,
          sortOrder: values.sortOrder,
          parentId: values.parentId
        }
        await updatePermission(editingPermission.id, updateData)
        message.success('更新成功')
      } else {
        const createData: CreatePermissionData = {
          code: values.code,
          name: values.name,
          type: values.type,
          parentId: values.parentId,
          path: values.path,
          description: values.description,
          sortOrder: values.sortOrder || 0
        }
        await createPermission(createData)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadPermissions()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  const handleUpload = async (file: File) => {
    try {
      const result = await uploadPermissionExcel(file)
      message.success(`导入完成：成功 ${result.success} 条，失败 ${result.failed} 条`)
      if (result.errors.length > 0) {
        console.error('导入错误：', result.errors)
      }
      loadPermissions()
    } catch (error: any) {
      message.error('导入失败')
    }
    return false // 阻止默认上传
  }

  const columns = [
    {
      title: '权限代码',
      dataIndex: 'code',
      key: 'code',
      width: 200
    },
    {
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => type === 'menu' ? '菜单' : '按钮'
    },
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      width: 200
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Permission) => (
        <Space>
          <PermissionWrapper permission="button:permission:edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </PermissionWrapper>
          <PermissionWrapper permission="button:permission:delete">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: '确认删除',
                  content: `确定要删除权限"${record.name}"吗？`,
                  onOk: () => handleDelete(record.id)
                })
              }}
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
          <PermissionWrapper permission="button:permission:add">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增权限
            </Button>
          </PermissionWrapper>
          <PermissionWrapper permission="button:permission:import">
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
        dataSource={permissions}
        loading={loading}
        rowKey="id"
        pagination={false}
        expandable={{
          defaultExpandAllRows: true
        }}
      />

      <Modal
        title={editingPermission ? '编辑权限' : '新增权限'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          {!editingPermission && (
            <Form.Item
              name="code"
              label="权限代码"
              rules={[{ required: true, message: '请输入权限代码' }]}
            >
              <Input placeholder="如：menu:operation" />
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label="权限名称"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input placeholder="如：运营中心" />
          </Form.Item>
          {!editingPermission && (
            <Form.Item
              name="type"
              label="权限类型"
              rules={[{ required: true, message: '请选择权限类型' }]}
            >
              <Select>
                <Select.Option value="menu">菜单</Select.Option>
                <Select.Option value="button">按钮</Select.Option>
              </Select>
            </Form.Item>
          )}
          <Form.Item name="parentId" label="父权限">
            <Select placeholder="选择父权限（可选）" allowClear>
              {permissions
                .filter(p => p.type === 'menu')
                .map(p => (
                  <Select.Option key={p.id} value={p.id}>
                    {p.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item name="path" label="路径">
            <Input placeholder="如：/admin/operation" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="权限描述" />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序">
            <InputNumber min={0} defaultValue={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PermissionManagement

