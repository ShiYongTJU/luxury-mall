import { useState, useEffect, useRef } from 'react'
import {
  Table,
  Form,
  Input,
  Button,
  Space,
  Card,
  message,
  Modal,
  Select,
  Popconfirm,
  Tag
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  RocketOutlined,
  ToolOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { pageApi } from '../../api/page'
import { Page, PageQueryParams, PageType, CreatePageData, UpdatePageData } from '../../types/page'
import type { ColumnsType } from 'antd/es/table'
import '../Product/ProductList.css'

const { Option } = Select

function PageManagement() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [pages, setPages] = useState<Page[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | null>(null)

  const queryParamsRef = useRef<PageQueryParams>({})
  const isInitializedRef = useRef(false)
  const paginationRef = useRef(pagination)

  useEffect(() => {
    paginationRef.current = pagination
  }, [pagination])

  // 获取页面列表
  const fetchPages = async (page?: number, pageSize?: number) => {
    setLoading(true)
    try {
      const currentPage = page !== undefined ? page : paginationRef.current.current
      const currentPageSize = pageSize !== undefined ? pageSize : paginationRef.current.pageSize

      const result = await pageApi.getPages({
        ...queryParamsRef.current,
        page: currentPage,
        pageSize: currentPageSize
      })

      setPages(result.pages)
      setPagination({
        total: result.total,
        current: result.page,
        pageSize: result.pageSize
      })
    } catch (error: any) {
      message.error('获取页面列表失败：' + (error.message || '未知错误'))
      setPages([])
      setPagination(prev => ({ ...prev, total: 0 }))
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true
      fetchPages()
    }
  }, [])

  // 分页变化
  useEffect(() => {
    if (isInitializedRef.current) {
      fetchPages(pagination.current, pagination.pageSize)
    }
  }, [pagination.current, pagination.pageSize])

  // 查询
  const handleSearch = () => {
    const values = form.getFieldsValue()
    queryParamsRef.current = {
      pageType: values.pageType,
      isPublished: values.isPublished !== undefined ? values.isPublished : undefined
    }
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchPages(1, pagination.pageSize)
  }

  // 重置
  const handleReset = () => {
    form.resetFields()
    queryParamsRef.current = {}
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchPages(1, pagination.pageSize)
  }

  // 新增
  const handleAdd = () => {
    setIsEditMode(false)
    setEditingPage(null)
    editForm.resetFields()
    setEditModalVisible(true)
  }

  // 编辑
  const handleEdit = (page: Page) => {
    setIsEditMode(true)
    setEditingPage(page)
    editForm.setFieldsValue({
      name: page.name,
      pageType: page.pageType
    })
    setEditModalVisible(true)
  }

  // 保存编辑/新增
  const handleSave = async () => {
    try {
      const values = await editForm.validateFields()
      
      if (isEditMode && editingPage) {
        // 更新页面
        const updates: UpdatePageData = {
          name: values.name,
          pageType: values.pageType
        }
        await pageApi.updatePage(editingPage.id, updates)
        message.success('更新成功')
      } else {
        // 创建页面
        const newPage: CreatePageData = {
          name: values.name,
          pageType: values.pageType
        }
        await pageApi.createPage(newPage)
        message.success('创建成功')
      }
      
      setEditModalVisible(false)
      fetchPages(pagination.current, pagination.pageSize)
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return
      }
      message.error('保存失败：' + (error.message || '未知错误'))
    }
  }

  // 取消编辑
  const handleCancel = () => {
    setEditModalVisible(false)
    editForm.resetFields()
    setEditingPage(null)
  }

  // 发布
  const handlePublish = async (page: Page) => {
    try {
      await pageApi.publishPage(page.id)
      message.success('发布成功')
      fetchPages(pagination.current, pagination.pageSize)
    } catch (error: any) {
      message.error('发布失败：' + (error.message || '未知错误'))
    }
  }

  // 装修
  const handleDesign = (page: Page) => {
    navigate(`/admin/operation/page/design/${page.id}`)
  }

  // 删除
  const handleDelete = async (page: Page) => {
    try {
      await pageApi.deletePage(page.id)
      message.success('删除成功')
      fetchPages(pagination.current, pagination.pageSize)
    } catch (error: any) {
      message.error('删除失败：' + (error.message || '未知错误'))
    }
  }

  // 表格分页变化
  const handleTableChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }))
  }

  // 表格列
  const columns: ColumnsType<Page> = [
    {
      title: '页面类型',
      dataIndex: 'pageType',
      key: 'pageType',
      width: 120,
      render: (type: PageType) => (
        <Tag color={type === 'homepage' ? 'blue' : 'green'}>
          {type === 'homepage' ? '首页' : '分类页'}
        </Tag>
      )
    },
    {
      title: '发布状态',
      dataIndex: 'isPublished',
      key: 'isPublished',
      width: 100,
      render: (isPublished: boolean) => (
        <Tag color={isPublished ? 'success' : 'default'}>
          {isPublished ? '已发布' : '未发布'}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (time: string) => time ? new Date(time).toLocaleString('zh-CN') : '-'
    },
    {
      title: '最近操作时间',
      dataIndex: 'lastOperationTime',
      key: 'lastOperationTime',
      width: 180,
      render: (time: string) => time ? new Date(time).toLocaleString('zh-CN') : '-'
    },
    {
      title: '最近操作类型',
      dataIndex: 'lastOperationType',
      key: 'lastOperationType',
      width: 120,
      render: (type: string) => {
        if (!type) return '-'
        const typeMap: Record<string, { text: string; color: string }> = {
          edit: { text: '编辑', color: 'blue' },
          operate: { text: '装修', color: 'orange' },
          publish: { text: '发布', color: 'success' }
        }
        const config = typeMap[type] || { text: type, color: 'default' }
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right' as const,
      render: (_: any, record: Page) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<ToolOutlined />}
            onClick={() => handleDesign(record)}
          >
            装修
          </Button>
          <Popconfirm
            title="确定要发布这个页面吗？"
            description="发布后，其他所有页面将自动取消发布"
            onConfirm={() => handlePublish(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              icon={<RocketOutlined />}
              disabled={record.isPublished}
            >
              发布
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确定要删除这个页面吗？"
            description="删除后无法恢复"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        {/* 查询表单 */}
        <Form
          form={form}
          layout="inline"
          className="product-list-form"
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="pageType" label="页面类型">
            <Select placeholder="请选择页面类型" allowClear style={{ width: 150 }}>
              <Option value="homepage">首页</Option>
              <Option value="category">分类页</Option>
            </Select>
          </Form.Item>
          <Form.Item name="isPublished" label="发布状态">
            <Select placeholder="请选择发布状态" allowClear style={{ width: 150 }}>
              <Option value={true}>已发布</Option>
              <Option value={false}>未发布</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                重置
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                新增
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={pages}
          rowKey="id"
          loading={loading}
          className="product-list-table"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: handleTableChange,
            onShowSizeChange: handleTableChange
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 编辑/新增模态框 */}
      <Modal
        title={isEditMode ? '编辑页面' : '新增页面'}
        open={editModalVisible}
        onOk={handleSave}
        onCancel={handleCancel}
        width={600}
        destroyOnHidden
      >
        <Form
          form={editForm}
          layout="vertical"
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="name"
            label="页面名称"
            rules={[{ required: true, message: '请输入页面名称' }]}
          >
            <Input placeholder="请输入页面名称" />
          </Form.Item>
          <Form.Item
            name="pageType"
            label="页面类型"
            rules={[{ required: true, message: '请选择页面类型' }]}
          >
            <Select placeholder="请选择页面类型">
              <Option value="homepage">首页</Option>
              <Option value="category">分类页</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PageManagement
