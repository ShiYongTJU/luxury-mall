import { useState, useEffect } from 'react'
import {
  Table,
  Form,
  Input,
  Select,
  Button,
  Space,
  Card,
  message,
  Image
} from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
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

  // 获取商品列表
  const fetchProducts = async (params?: ProductQueryParams) => {
    setLoading(true)
    try {
      // 后端目前只支持 category 参数，其他参数在前端过滤
      const backendParams: any = {}
      if (params?.category) {
        backendParams.category = params.category
      }
      
      const data = await productApi.getProducts(backendParams)
      const products = Array.isArray(data) ? data : []
      
      // 前端过滤
      let filteredProducts = products
      if (params) {
        if (params.name) {
          filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(params.name!.toLowerCase())
          )
        }
        if (params.subCategory) {
          filteredProducts = filteredProducts.filter(p =>
            p.subCategory?.toLowerCase().includes(params.subCategory!.toLowerCase())
          )
        }
        if (params.brand) {
          filteredProducts = filteredProducts.filter(p =>
            p.brand?.toLowerCase().includes(params.brand!.toLowerCase())
          )
        }
        if (params.tag) {
          filteredProducts = filteredProducts.filter(p =>
            p.tag?.toLowerCase().includes(params.tag!.toLowerCase())
          )
        }
        if (params.minPrice !== undefined) {
          filteredProducts = filteredProducts.filter(p => p.price >= params.minPrice!)
        }
        if (params.maxPrice !== undefined) {
          filteredProducts = filteredProducts.filter(p => p.price <= params.maxPrice!)
        }
        if (params.stock !== undefined && params.stock !== null) {
          filteredProducts = filteredProducts.filter(p =>
            p.stock !== undefined && p.stock >= params.stock!
          )
        }
      }
      
      // 分页处理
      const start = (pagination.current - 1) * pagination.pageSize
      const end = start + pagination.pageSize
      setProducts(filteredProducts.slice(start, end))
      setPagination(prev => ({ ...prev, total: filteredProducts.length }))
    } catch (error: any) {
      message.error('获取商品列表失败：' + (error.message || '未知错误'))
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    fetchProducts()
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

    setPagination(prev => ({ ...prev, current: 1 }))
    fetchProducts(params)
  }

  // 重置
  const handleReset = () => {
    form.resetFields()
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchProducts()
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
    </div>
  )
}

export default ProductList

