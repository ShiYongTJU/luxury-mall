import { useState, useEffect, useRef } from 'react'
import {
  Table,
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Space,
  Card,
  message,
  Modal,
  Popconfirm,
  Tag,
  Image as AntImage
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import { datasourceApi } from '../../api/datasource'
import { DataSourceItem, DataSourceQueryParams, CarouselItemData } from '../../types/datasource'
import type { ColumnsType } from 'antd/es/table'
import ProductSelector from '../../components/ProductSelector/ProductSelector'
import { productApi } from '../../api/product'
import { Product } from '../../types/product'
import { getFullImageUrl } from '../../utils/backendUrl'
import '../Product/ProductList.css'

function CarouselManagement() {
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<DataSourceItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingItem, setEditingItem] = useState<DataSourceItem | null>(null)
  const [productSelectorVisible, setProductSelectorVisible] = useState(false)
  const [carouselItems, setCarouselItems] = useState<CarouselItemData[]>([])

  const queryParamsRef = useRef<DataSourceQueryParams>({})
  const isInitializedRef = useRef(false)
  const paginationRef = useRef(pagination)

  useEffect(() => {
    paginationRef.current = pagination
  }, [pagination])


  // 获取轮播图列表
  const fetchItems = async (page?: number, pageSize?: number) => {
    setLoading(true)
    try {
      const currentPage = page !== undefined ? page : paginationRef.current.current
      const currentPageSize = pageSize !== undefined ? pageSize : paginationRef.current.pageSize

      const result = await datasourceApi.getItems('carousel', {
        ...queryParamsRef.current,
        page: currentPage,
        pageSize: currentPageSize
      })

      setItems(result.items)

      // 注意：轮播图项已经包含图片和标题，不需要额外获取商品信息

      setPagination({
        total: result.total,
        current: result.page,
        pageSize: result.pageSize
      })
    } catch (error: any) {
      message.error('获取轮播图列表失败：' + (error.message || '未知错误'))
      setItems([])
      setPagination(prev => ({ ...prev, total: 0 }))
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true
      fetchItems()
    }
  }, [])

  // 分页变化
  useEffect(() => {
    if (isInitializedRef.current) {
      fetchItems(pagination.current, pagination.pageSize)
    }
  }, [pagination.current, pagination.pageSize])

  // 查询
  const handleSearch = () => {
    const values = form.getFieldsValue()
    queryParamsRef.current = {
      name: values.name,
      isEnabled: values.isEnabled !== undefined ? values.isEnabled : undefined
    }
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchItems(1, pagination.pageSize)
  }

  // 重置
  const handleReset = () => {
    form.resetFields()
    queryParamsRef.current = {}
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchItems(1, pagination.pageSize)
  }

  // 新增
  const handleAdd = () => {
    setIsEditMode(false)
    setEditingItem(null)
    setCarouselItems([])
    editForm.resetFields()
    editForm.setFieldsValue({
      isEnabled: true,
      sortOrder: 0
    })
    setEditModalVisible(true)
  }

  // 编辑
  const handleEdit = (item: DataSourceItem) => {
    setIsEditMode(true)
    setEditingItem(item)
    
    try {
      const data = JSON.parse(item.data) as CarouselItemData[]
      setCarouselItems(data)
      
      // 注意：轮播图项已经包含图片和标题，不需要额外获取商品信息
      
      const config = item.config ? JSON.parse(item.config) : {}
      editForm.setFieldsValue({
        name: item.name,
        height: config.height || '200px',
        autoplay: config.autoplay !== false,
        interval: config.interval || 3000,
        sortOrder: item.sortOrder,
        isEnabled: item.isEnabled
      })
    } catch (e) {
      console.error('解析数据失败:', e)
      setCarouselItems([])
      editForm.setFieldsValue({
        name: item.name,
        sortOrder: item.sortOrder,
        isEnabled: item.isEnabled
      })
    }
    
    setEditModalVisible(true)
  }

  // 从商品选择
  const handleSelectProducts = async (productIds: string[]) => {
    // 获取商品信息并创建轮播图项
    const productMap: Record<string, Product> = {}
    for (const id of productIds) {
      try {
        const product = await productApi.getProductById(id)
        if (product) {
          productMap[id] = product
        }
      } catch (e) {
        console.warn(`获取商品 ${id} 失败:`, e)
      }
    }
    
    // 创建轮播图项
    const newItems: CarouselItemData[] = productIds.map(id => {
      const product = productMap[id]
      return {
        id: `carousel_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        image: product?.image || '',
        title: product?.name || '',
        link: `/product/${id}`,
        productId: id
      }
    })
    
    setCarouselItems(prev => [...prev, ...newItems])
    setProductSelectorVisible(false)
    message.success(`已添加 ${productIds.length} 个商品到轮播图`)
  }

  // 删除轮播图项
  const handleDeleteCarouselItem = (itemId: string) => {
    setCarouselItems(prev => prev.filter(item => item.id !== itemId))
  }

  // 保存
  const handleSave = async () => {
    try {
      const values = await editForm.validateFields()
      
      const config = {
        height: values.height || '200px',
        autoplay: values.autoplay !== false,
        interval: values.interval || 3000
      }
      
      const data = JSON.stringify(carouselItems)
      const configStr = JSON.stringify(config)
      
      if (isEditMode && editingItem) {
        await datasourceApi.updateItem('carousel', editingItem.id, {
          name: values.name,
          config: configStr,
          data,
          sortOrder: values.sortOrder,
          isEnabled: values.isEnabled
        })
        message.success('更新成功')
      } else {
        await datasourceApi.createItem('carousel', {
          name: values.name,
          config: configStr,
          data,
          sortOrder: values.sortOrder || 0,
          isEnabled: values.isEnabled !== false
        })
        message.success('创建成功')
      }
      
      setEditModalVisible(false)
      fetchItems(pagination.current, pagination.pageSize)
    } catch (error: any) {
      if (error.errorFields) {
        return
      }
      message.error('保存失败：' + (error.message || '未知错误'))
    }
  }

  // 取消
  const handleCancel = () => {
    setEditModalVisible(false)
    editForm.resetFields()
    setEditingItem(null)
    setCarouselItems([])
  }

  // 删除
  const handleDelete = async (item: DataSourceItem) => {
    try {
      await datasourceApi.deleteItem('carousel', item.id)
      message.success('删除成功')
      fetchItems(pagination.current, pagination.pageSize)
    } catch (error: any) {
      message.error('删除失败：' + (error.message || '未知错误'))
    }
  }

  // 表格分页变化
  const handleTableChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }))
  }

  // 表格列
  const columns: ColumnsType<DataSourceItem> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: 200
    },
    {
      title: '轮播图项',
      key: 'items',
      width: 300,
      render: (_: any, record: DataSourceItem) => {
        try {
          const data = JSON.parse(record.data) as CarouselItemData[]
          return (
            <Space>
              {data.slice(0, 3).map((item, index) => (
                <AntImage
                  key={index}
                  src={getFullImageUrl(item.image)}
                  alt={item.title}
                  width={60}
                  height={40}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                />
              ))}
              {data.length > 3 && <span>+{data.length - 3}</span>}
            </Space>
          )
        } catch (e) {
          return '-'
        }
      }
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      key: 'isEnabled',
      width: 100,
      render: (isEnabled: boolean) => (
        <Tag color={isEnabled ? 'success' : 'default'}>
          {isEnabled ? '启用' : '禁用'}
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
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: DataSourceItem) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除吗？"
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
          <Form.Item name="name" label="名称">
            <Input placeholder="请输入名称" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="isEnabled" label="状态">
            <Input placeholder="请选择状态" allowClear style={{ width: 150 }} />
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
          dataSource={items}
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
        title={isEditMode ? '编辑轮播图' : '新增轮播图'}
        open={editModalVisible}
        onOk={handleSave}
        onCancel={handleCancel}
        width={800}
        destroyOnHidden
      >
        <Form
          form={editForm}
          layout="vertical"
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="请输入名称" />
          </Form.Item>
          
          <Form.Item label="配置">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item name="height" label="高度" style={{ marginBottom: 8 }}>
                <Input placeholder="如：200px" />
              </Form.Item>
              <Form.Item name="autoplay" label="自动播放" valuePropName="checked" style={{ marginBottom: 8 }}>
                <Switch />
              </Form.Item>
              <Form.Item name="interval" label="切换间隔(ms)" style={{ marginBottom: 8 }}>
                <InputNumber min={1000} step={1000} style={{ width: '100%' }} />
              </Form.Item>
            </Space>
          </Form.Item>

          <Form.Item label="轮播图项">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => setProductSelectorVisible(true)}
                block
              >
                从商品列表添加
              </Button>
              
              {carouselItems.map((item) => (
                <Card key={item.id} size="small" style={{ marginTop: 8 }}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                      <AntImage
                        src={getFullImageUrl(item.image)}
                        alt={item.title}
                        width={80}
                        height={50}
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                      />
                      <div>
                        <div>{item.title || '-'}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>{item.link || '-'}</div>
                      </div>
                    </Space>
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteCarouselItem(item.id)}
                    >
                      删除
                    </Button>
                  </Space>
                </Card>
              ))}
            </Space>
          </Form.Item>

          <Form.Item name="sortOrder" label="排序" style={{ marginBottom: 8 }}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item name="isEnabled" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* 商品选择器 */}
      <ProductSelector
        open={productSelectorVisible}
        onCancel={() => setProductSelectorVisible(false)}
        onSelect={handleSelectProducts}
        multiple={true}
        title="选择商品（将作为轮播图项）"
      />
    </div>
  )
}

export default CarouselManagement
