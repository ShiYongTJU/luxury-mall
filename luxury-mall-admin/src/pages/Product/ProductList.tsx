import { useState, useEffect, useRef } from 'react'
import {
  Table,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  Card,
  message,
  Image,
  Modal
} from 'antd'
import { SearchOutlined, ReloadOutlined, EditOutlined } from '@ant-design/icons'
import { productApi } from '../../api/product'
import { Product, ProductQueryParams } from '../../types/product'
import type { ColumnsType } from 'antd/es/table'
import './ProductList.css'

function ProductList() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  
  // 保存查询参数，避免重复查询
  const queryParamsRef = useRef<ProductQueryParams>({})
  // 标记是否已初始化，避免初始加载和分页变化冲突
  const isInitializedRef = useRef(false)
  // 保存分页信息到 ref，避免闭包问题
  const paginationRef = useRef(pagination)

  // 更新 pagination ref
  useEffect(() => {
    paginationRef.current = pagination
  }, [pagination])

  // 获取商品列表（从后端查询，支持分页）
  const fetchProducts = async (
    searchParams?: ProductQueryParams,
    page?: number,
    pageSize?: number
  ) => {
    setLoading(true)
    try {
      // 如果有新的查询参数，更新 ref
      if (searchParams !== undefined) {
        queryParamsRef.current = searchParams
      }
      
      // 构建查询参数，优先使用传入的分页参数，否则使用 ref 中的分页状态
      const currentPage = page !== undefined ? page : paginationRef.current.current
      const currentPageSize = pageSize !== undefined ? pageSize : paginationRef.current.pageSize
      
      const queryParams: ProductQueryParams = {
        ...queryParamsRef.current,
        page: currentPage,
        pageSize: currentPageSize
      }
      
      // 调用后端接口查询
      const result = await productApi.getProducts(queryParams)
      
      // 设置商品列表和分页信息
      setProducts(result.products)
      setPagination({
        total: result.total,
        current: result.page,
        pageSize: result.pageSize
      })
      
      // 标记已初始化
      isInitializedRef.current = true
    } catch (error: any) {
      message.error('获取商品列表失败：' + (error.message || '未知错误'))
      setProducts([])
      setPagination(prev => ({ ...prev, total: 0 }))
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    if (!isInitializedRef.current) {
      fetchProducts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 只在组件挂载时执行一次

  // 分页变化时查询（使用最新的查询参数）
  useEffect(() => {
    // 只有在已初始化后才响应分页变化
    if (isInitializedRef.current) {
      fetchProducts(undefined, pagination.current, pagination.pageSize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize])

  // 查询
  const handleSearch = () => {
    const values = form.getFieldsValue()
    const params: ProductQueryParams = {}
    
    if (values.name) params.name = values.name
    if (values.category) params.category = values.category
    if (values.subCategory) params.subCategory = values.subCategory
    if (values.brand) params.brand = values.brand
    if (values.tag) params.tag = values.tag
    if (values.minPrice) params.minPrice = Number(values.minPrice)
    if (values.maxPrice) params.maxPrice = Number(values.maxPrice)
    if (values.stock !== undefined && values.stock !== null && values.stock !== '') {
      params.stock = Number(values.stock)
    }

    // 重置到第一页并查询
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchProducts(params, 1, pagination.pageSize)
  }

  // 重置
  const handleReset = () => {
    form.resetFields()
    queryParamsRef.current = {}
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchProducts({}, 1, pagination.pageSize)
  }

  // 编辑相关状态
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editForm] = Form.useForm()

  // 打开编辑对话框
  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    editForm.setFieldsValue({
      name: product.name,
      description: product.description,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      tag: product.tag,
      category: product.category,
      subCategory: product.subCategory,
      brand: product.brand,
      stock: product.stock
    })
    setEditModalVisible(true)
  }

  // 保存编辑
  const handleSaveEdit = async () => {
    try {
      const values = await editForm.validateFields()
      if (!editingProduct) return

      const updates: Partial<Product> = {
        name: values.name,
        description: values.description,
        image: values.image,
        price: values.price,
        originalPrice: values.originalPrice,
        tag: values.tag,
        category: values.category,
        subCategory: values.subCategory,
        brand: values.brand,
        stock: values.stock
      }

      await productApi.updateProduct(editingProduct.id, updates)
      message.success('商品更新成功')
      setEditModalVisible(false)
      setEditingProduct(null)
      editForm.resetFields()
      
      // 刷新列表
      fetchProducts(undefined, pagination.current, pagination.pageSize)
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return
      }
      message.error('更新商品失败：' + (error.message || '未知错误'))
    }
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setEditModalVisible(false)
    setEditingProduct(null)
    editForm.resetFields()
  }

  // 表格列定义
  const columns: ColumnsType<Product> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '商品图片',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image: string) => (
        <Image
          src={image}
          alt="商品图片"
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYc8L3RleHQ+PC9zdmc+"
        />
      )
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number, record: Product) => (
        <div>
          <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{price.toFixed(2)}</div>
          {record.originalPrice && record.originalPrice > price && (
            <div style={{ color: '#999', textDecoration: 'line-through', fontSize: 12 }}>
              ¥{record.originalPrice.toFixed(2)}
            </div>
          )}
        </div>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string, record: Product) => (
        <div>
          {category && <div>{category}</div>}
          {record.subCategory && (
            <div style={{ color: '#999', fontSize: 12 }}>{record.subCategory}</div>
          )}
        </div>
      )
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 120
    },
    {
      title: '标签',
      dataIndex: 'tag',
      key: 'tag',
      width: 100,
      render: (tag: string) =>
        tag ? (
          <span style={{ background: '#f0f0f0', padding: '2px 8px', borderRadius: 4 }}>
            {tag}
          </span>
        ) : (
          '-'
        )
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      render: (stock: number) => stock ?? '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: Product) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>
      )
    }
  ]

  // 处理分页变化
  const handleTableChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }))
  }

  return (
    <div>
      <Card title="商品列表" style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          className="product-list-form"
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="name" label="商品名称" labelCol={{ style: { width: 80 } }}>
            <Input placeholder="请输入商品名称" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="category" label="分类" labelCol={{ style: { width: 80 } }}>
            <Input placeholder="请输入分类" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="subCategory" label="子分类" labelCol={{ style: { width: 80 } }}>
            <Input placeholder="请输入子分类" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="brand" label="品牌" labelCol={{ style: { width: 80 } }}>
            <Input placeholder="请输入品牌" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="tag" label="标签" labelCol={{ style: { width: 80 } }}>
            <Input placeholder="请输入标签" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="minPrice" label="最低价格" labelCol={{ style: { width: 80 } }}>
            <Input
              type="number"
              placeholder="最低价格"
              allowClear
              style={{ width: 180 }}
            />
          </Form.Item>
          <Form.Item name="maxPrice" label="最高价格" labelCol={{ style: { width: 80 } }}>
            <Input
              type="number"
              placeholder="最高价格"
              allowClear
              style={{ width: 180 }}
            />
          </Form.Item>
          <Form.Item name="stock" label="库存" labelCol={{ style: { width: 80 } }}>
            <Input
              type="number"
              placeholder="库存数量"
              allowClear
              style={{ width: 180 }}
            />
          </Form.Item>
        </Form>
        
        {/* 查询和重置按钮单独一行 */}
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <Space>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              查询
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={products}
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

      {/* 编辑商品对话框 */}
      <Modal
        title="编辑商品"
        open={editModalVisible}
        onOk={handleSaveEdit}
        onCancel={handleCancelEdit}
        width={800}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={editForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="商品名称"
            rules={[{ required: true, message: '请输入商品名称' }]}
          >
            <Input placeholder="请输入商品名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="商品描述"
          >
            <Input.TextArea rows={3} placeholder="请输入商品描述" />
          </Form.Item>

          <Form.Item
            name="image"
            label="商品图片URL"
            rules={[{ required: true, message: '请输入商品图片URL' }]}
          >
            <Input placeholder="请输入商品图片URL" />
          </Form.Item>

          <Form.Item
            name="price"
            label="价格"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              placeholder="请输入价格"
            />
          </Form.Item>

          <Form.Item
            name="originalPrice"
            label="原价"
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              placeholder="请输入原价（可选）"
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
          >
            <Input placeholder="请输入分类" />
          </Form.Item>

          <Form.Item
            name="subCategory"
            label="子分类"
          >
            <Input placeholder="请输入子分类" />
          </Form.Item>

          <Form.Item
            name="brand"
            label="品牌"
          >
            <Input placeholder="请输入品牌" />
          </Form.Item>

          <Form.Item
            name="tag"
            label="标签"
          >
            <Input placeholder="请输入标签" />
          </Form.Item>

          <Form.Item
            name="stock"
            label="库存"
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="请输入库存数量"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ProductList

