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
import { DataSourceItem, DataSourceQueryParams, GuessYouLikeData } from '../../types/datasource'
import type { ColumnsType } from 'antd/es/table'
import ProductSelector from '../../components/ProductSelector/ProductSelector'
import { productApi } from '../../api/product'
import { Product } from '../../types/product'
import { getFullImageUrl } from '../../utils/backendUrl'
import '../Product/ProductList.css'

function GuessYouLikeManagement() {
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
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [products, setProducts] = useState<Record<string, Product>>({})

  const queryParamsRef = useRef<DataSourceQueryParams>({})
  const isInitializedRef = useRef(false)
  const paginationRef = useRef(pagination)

  useEffect(() => {
    paginationRef.current = pagination
  }, [pagination])

  // 获取商品信息
  const fetchProducts = async (productIds: string[]) => {
    try {
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
      setProducts(prev => ({ ...prev, ...productMap }))
    } catch (error) {
      console.error('获取商品信息失败:', error)
    }
  }

  // 获取猜你喜欢列表
  const fetchItems = async (page?: number, pageSize?: number) => {
    setLoading(true)
    try {
      const currentPage = page !== undefined ? page : paginationRef.current.current
      const currentPageSize = pageSize !== undefined ? pageSize : paginationRef.current.pageSize

      const result = await datasourceApi.getItems('guessYouLike', {
        ...queryParamsRef.current,
        page: currentPage,
        pageSize: currentPageSize
      })

      setItems(result.items)

      // 解析所有商品ID并获取商品信息
      const allProductIds = new Set<string>()
      result.items.forEach(item => {
        try {
          const data = JSON.parse(item.data) as GuessYouLikeData
          if (data.products) {
            data.products.forEach(id => allProductIds.add(id))
          }
        } catch (e) {
          console.error('解析数据失败:', e)
        }
      })
      if (allProductIds.size > 0) {
        await fetchProducts(Array.from(allProductIds))
      }

      setPagination({
        total: result.total,
        current: result.page,
        pageSize: result.pageSize
      })
    } catch (error: any) {
      message.error('获取猜你喜欢列表失败：' + (error.message || '未知错误'))
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
    setSelectedProductIds([])
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
      const data = JSON.parse(item.data) as GuessYouLikeData
      setSelectedProductIds(data.products || [])
      
      // 获取商品信息
      if (data.products && data.products.length > 0) {
        fetchProducts(data.products)
      }
      
      const config = item.config ? JSON.parse(item.config) : {}
      editForm.setFieldsValue({
        name: item.name,
        title: config.title || '猜你喜欢',
        count: data.count || 10,
        sortOrder: item.sortOrder,
        isEnabled: item.isEnabled
      })
    } catch (e) {
      console.error('解析数据失败:', e)
      setSelectedProductIds([])
      editForm.setFieldsValue({
        name: item.name,
        sortOrder: item.sortOrder,
        isEnabled: item.isEnabled
      })
    }
    
    setEditModalVisible(true)
  }

  // 从商品选择
  const handleSelectProducts = (productIds: string[]) => {
    setSelectedProductIds(prev => {
      const newIds = [...new Set([...prev, ...productIds])]
      fetchProducts(newIds)
      return newIds
    })
    setProductSelectorVisible(false)
    message.success(`已添加 ${productIds.length} 个商品`)
  }

  // 删除商品
  const handleRemoveProduct = (productId: string) => {
    setSelectedProductIds(prev => prev.filter(id => id !== productId))
  }

  // 保存
  const handleSave = async () => {
    try {
      const values = await editForm.validateFields()
      
      const config = {
        title: values.title || '猜你喜欢'
      }
      
      const data: GuessYouLikeData = {
        count: values.count || 10,
        products: selectedProductIds
      }
      
      const dataStr = JSON.stringify(data)
      const configStr = JSON.stringify(config)
      
      if (isEditMode && editingItem) {
        await datasourceApi.updateItem('guessYouLike', editingItem.id, {
          name: values.name,
          config: configStr,
          data: dataStr,
          sortOrder: values.sortOrder,
          isEnabled: values.isEnabled
        })
        message.success('更新成功')
      } else {
        await datasourceApi.createItem('guessYouLike', {
          name: values.name,
          config: configStr,
          data: dataStr,
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
    setSelectedProductIds([])
  }

  // 删除
  const handleDelete = async (item: DataSourceItem) => {
    try {
      await datasourceApi.deleteItem('guessYouLike', item.id)
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
      title: '商品数量',
      key: 'productCount',
      width: 100,
      render: (_: any, record: DataSourceItem) => {
        try {
          const data = JSON.parse(record.data) as GuessYouLikeData
          return data.products?.length || 0
        } catch (e) {
          return 0
        }
      }
    },
    {
      title: '显示数量',
      key: 'count',
      width: 100,
      render: (_: any, record: DataSourceItem) => {
        try {
          const data = JSON.parse(record.data) as GuessYouLikeData
          return data.count || '-'
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
        title={isEditMode ? '编辑猜你喜欢' : '新增猜你喜欢'}
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
          
          <Form.Item name="title" label="标题">
            <Input placeholder="如：猜你喜欢" />
          </Form.Item>

          <Form.Item name="count" label="显示数量">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="商品列表">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => setProductSelectorVisible(true)}
                block
              >
                从商品列表添加
              </Button>
              
              {selectedProductIds.map(productId => {
                const product = products[productId]
                return (
                  <Card key={productId} size="small" style={{ marginTop: 8 }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Space>
                        {product && (
                          <AntImage
                            src={getFullImageUrl(product.image)}
                            alt={product.name}
                            width={60}
                            height={60}
                            style={{ objectFit: 'cover', borderRadius: 4 }}
                          />
                        )}
                        <div>
                          <div>{product?.name || productId}</div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            ¥{product?.price?.toLocaleString() || '-'}
                          </div>
                        </div>
                      </Space>
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveProduct(productId)}
                      >
                        删除
                      </Button>
                    </Space>
                  </Card>
                )
              })}
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
        title="选择商品"
      />
    </div>
  )
}

export default GuessYouLikeManagement
