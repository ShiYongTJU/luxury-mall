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
import { DataSourceItem, DataSourceQueryParams, GroupbuyData } from '../../types/datasource'
import type { ColumnsType } from 'antd/es/table'
import ProductSelector from '../../components/ProductSelector/ProductSelector'
import { productApi } from '../../api/product'
import { Product } from '../../types/product'
import { getFullImageUrl } from '../../utils/backendUrl'
import { getDataSourceAbbreviation } from '../../utils/datasource'
import '../Product/ProductList.css'

function GroupbuyManagement() {
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
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])

  const queryParamsRef = useRef<DataSourceQueryParams>({})
  const isInitializedRef = useRef(false)
  const paginationRef = useRef(pagination)

  useEffect(() => {
    paginationRef.current = pagination
  }, [pagination])

  // 获取团购列表
  const fetchItems = async (page?: number, pageSize?: number) => {
    setLoading(true)
    try {
      const currentPage = page !== undefined ? page : paginationRef.current.current
      const currentPageSize = pageSize !== undefined ? pageSize : paginationRef.current.pageSize

      const result = await datasourceApi.getItems('groupbuy', {
        ...queryParamsRef.current,
        page: currentPage,
        pageSize: currentPageSize
      })

      setItems(result.items)

      // 注意：不在列表查询时获取商品详情，只在编辑/新增时按需获取

      setPagination({
        total: result.total,
        current: result.page,
        pageSize: result.pageSize
      })
    } catch (error: any) {
      message.error('获取团购列表失败：' + (error.message || '未知错误'))
      setItems([])
      setPagination(prev => ({ ...prev, total: 0 }))
    } finally {
      setLoading(false)
    }
  }

  // 初始加载和分页变化
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true
      fetchItems()
    } else if (pagination.total > 0) {
      // 只有在已初始化且已有数据时才响应分页变化
      fetchItems(pagination.current, pagination.pageSize)
    }
  }, [pagination.current, pagination.pageSize])

  // 查询
  const handleSearch = () => {
    const values = form.getFieldsValue()
    queryParamsRef.current = {
      id: values.id?.trim() || undefined,
      name: values.name?.trim() || undefined,
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
    setSelectedProducts([])
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
      const data = JSON.parse(item.data) as GroupbuyData
      // 从JSON解析完整商品对象数组
      setSelectedProducts(data.products || [])
      
      editForm.setFieldsValue({
        name: item.name
      })
    } catch (e) {
      console.error('解析数据失败:', e)
      setSelectedProducts([])
      editForm.setFieldsValue({
        name: item.name
      })
    }
    
    setEditModalVisible(true)
  }

  // 从商品选择器选择商品，获取完整商品数据并保存
  const handleSelectProducts = async (productIds: string[]) => {
    try {
      // 获取完整商品数据
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
      
      // 将新商品添加到已选商品列表（去重）
      const newProducts = Object.values(productMap)
      setSelectedProducts(prev => {
        const existingIds = new Set(prev.map(p => p.id))
        const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.id))
        return [...prev, ...uniqueNewProducts]
      })
      
      setProductSelectorVisible(false)
      message.success(`已添加 ${newProducts.length} 个商品`)
    } catch (error) {
      console.error('获取商品信息失败:', error)
      message.error('获取商品信息失败')
    }
  }

  // 删除商品
  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId))
  }

  // 保存
  const handleSave = async () => {
    try {
      const values = await editForm.validateFields()
      
      if (selectedProducts.length === 0) {
        message.warning('请至少添加一个商品')
        return
      }
      
      const data: GroupbuyData = {
        products: selectedProducts // 保存完整商品对象数组
      }
      
      const dataStr = JSON.stringify(data)
      
      if (isEditMode && editingItem) {
        await datasourceApi.updateItem('groupbuy', editingItem.id, {
          name: values.name,
          data: dataStr
        })
        message.success('更新成功')
      } else {
        await datasourceApi.createItem('groupbuy', {
          name: values.name,
          dataSourceType: 'groupbuy',
          abbreviation: getDataSourceAbbreviation('groupbuy'),
          data: dataStr,
          sortOrder: 0,
          isEnabled: true
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
    setSelectedProducts([])
  }

  // 删除
  const handleDelete = async (item: DataSourceItem) => {
    try {
      await datasourceApi.deleteItem('groupbuy', item.id)
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
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      ellipsis: true,
      render: (id: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{id}</span>
      )
    },
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
          const data = JSON.parse(record.data) as GroupbuyData
          return data.products?.length || 0
        } catch (e) {
          return 0
        }
      }
    },
    {
      title: '成团人数',
      key: 'groupSize',
      width: 100,
      render: (_: any, record: DataSourceItem) => {
        try {
          const data = JSON.parse(record.data) as GroupbuyData
          return data.groupSize || '-'
        } catch (e) {
          return '-'
        }
      }
    },
    {
      title: '商品列表',
      key: 'products',
      width: 300,
      ellipsis: true,
      render: (_: any, record: DataSourceItem) => {
        try {
          const data = JSON.parse(record.data) as GroupbuyData
          if (!data.products || data.products.length === 0) {
            return '-'
          }
          return (
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {data.products.slice(0, 3).map((product: Product) => (
                <Space key={product.id} size="small">
                  <AntImage
                    src={getFullImageUrl(product.image)}
                    alt={product.name}
                    width={40}
                    height={40}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                  />
                  <div>
                    <div style={{ fontSize: '12px' }}>{product.name}</div>
                    <div style={{ fontSize: '11px', color: '#999' }}>
                      ¥{product.price?.toLocaleString() || '-'}
                    </div>
                  </div>
                </Space>
              ))}
              {data.products.length > 3 && (
                <div style={{ fontSize: '12px', color: '#999' }}>
                  还有 {data.products.length - 3} 个商品...
                </div>
              )}
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
          <Form.Item name="id" label="ID">
            <Input placeholder="请输入ID" allowClear style={{ width: 200 }} />
          </Form.Item>
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
        title={isEditMode ? '编辑团购' : '新增团购'}
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

          <Form.Item label="商品列表" required>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => setProductSelectorVisible(true)}
                block
              >
                从商品列表添加
              </Button>
              
              {selectedProducts.map(product => (
                <Card key={product.id} size="small" style={{ marginTop: 8 }}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                      <AntImage
                        src={getFullImageUrl(product.image)}
                        alt={product.name}
                        width={60}
                        height={60}
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                      />
                      <div>
                        <div>{product.name}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          ¥{product.price?.toLocaleString() || '-'}
                        </div>
                      </div>
                    </Space>
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveProduct(product.id)}
                    >
                      删除
                    </Button>
                  </Space>
                </Card>
              ))}
            </Space>
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

export default GroupbuyManagement
