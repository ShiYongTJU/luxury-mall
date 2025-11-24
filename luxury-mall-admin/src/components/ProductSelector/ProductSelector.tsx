import { useState, useEffect, useRef } from 'react'
import {
  Modal,
  Table,
  Form,
  Input,
  Button,
  Space,
  Image as AntImage,
  message
} from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { productApi } from '../../api/product'
import { Product, ProductQueryParams } from '../../types/product'
import type { ColumnsType } from 'antd/es/table'
import { getFullImageUrl } from '../../utils/backendUrl'

interface ProductSelectorProps {
  open: boolean
  onCancel: () => void
  onSelect: (productIds: string[]) => void
  multiple?: boolean // 是否多选
  title?: string
}

function ProductSelector({ open, onCancel, onSelect, multiple = true, title = '选择商品' }: ProductSelectorProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  
  const queryParamsRef = useRef<ProductQueryParams>({})
  const paginationRef = useRef(pagination)

  useEffect(() => {
    paginationRef.current = pagination
  }, [pagination])

  // 获取商品列表
  const fetchProducts = async (
    searchParams?: ProductQueryParams,
    page?: number,
    pageSize?: number
  ) => {
    setLoading(true)
    try {
      const currentPage = page !== undefined ? page : paginationRef.current.current
      const currentPageSize = pageSize !== undefined ? pageSize : paginationRef.current.pageSize

      const params = {
        ...queryParamsRef.current,
        ...searchParams,
        page: currentPage,
        pageSize: currentPageSize
      }

      const result = await productApi.getProducts(params)
      setProducts(result.products)
      setPagination({
        total: result.total,
        current: result.page,
        pageSize: result.pageSize
      })
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
    if (open) {
      // 每次打开弹窗时重置状态并查询第一页
      setPagination(prev => ({ ...prev, current: 1 }))
      queryParamsRef.current = {}
      form.resetFields()
      fetchProducts({}, 1, pagination.pageSize)
    }
  }, [open])

  // 分页变化
  useEffect(() => {
    if (open) {
      fetchProducts(undefined, pagination.current, pagination.pageSize)
    }
  }, [pagination.current, pagination.pageSize])

  // 查询
  const handleSearch = () => {
    const values = form.getFieldsValue()
    queryParamsRef.current = {
      name: values.name,
      category: values.category,
      brand: values.brand
    }
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchProducts(queryParamsRef.current, 1, pagination.pageSize)
  }

  // 重置
  const handleReset = () => {
    form.resetFields()
    queryParamsRef.current = {}
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchProducts({}, 1, pagination.pageSize)
  }

  // 确认选择
  const handleConfirm = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请至少选择一个商品')
      return
    }
    onSelect(selectedRowKeys)
    setSelectedRowKeys([])
  }

  // 表格列
  const columns: ColumnsType<Product> = [
    {
      title: '预览',
      dataIndex: 'image',
      key: 'preview',
      width: 80,
      render: (image: string) => (
        <AntImage
          src={getFullImageUrl(image)}
          alt="预览"
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4 }}
        />
      )
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: 200
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number, record: Product) => (
        <div>
          <div style={{ color: '#ff4d4f', fontWeight: 500 }}>¥{price.toLocaleString()}</div>
          {record.originalPrice && (
            <div style={{ fontSize: '12px', color: '#999', textDecoration: 'line-through' }}>
              ¥{record.originalPrice.toLocaleString()}
            </div>
          )}
        </div>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 120
    }
  ]

  return (
    <Modal
      title={title}
      open={open}
      onCancel={() => {
        onCancel()
        setSelectedRowKeys([])
      }}
      width={900}
      footer={[
        <Button key="cancel" onClick={() => {
          onCancel()
          setSelectedRowKeys([])
        }}>
          取消
        </Button>,
        <Button key="confirm" type="primary" onClick={handleConfirm}>
          确定 ({selectedRowKeys.length})
        </Button>
      ]}
      destroyOnHidden
    >
      <Form 
        form={form} 
        layout="inline" 
        style={{ 
          marginBottom: 24,
          marginTop: 16,
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '16px 0'
        }}
      >
        <Form.Item name="name" label="商品名称" style={{ marginBottom: 16 }}>
          <Input placeholder="请输入商品名称" allowClear style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="category" label="分类" style={{ marginBottom: 16 }}>
          <Input placeholder="请输入分类" allowClear style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="brand" label="品牌" style={{ marginBottom: 16 }}>
          <Input placeholder="请输入品牌" allowClear style={{ width: 200 }} />
        </Form.Item>
        <Form.Item style={{ marginBottom: 16, width: '100%', textAlign: 'center' }}>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              查询
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        rowSelection={{
          type: multiple ? 'checkbox' : 'radio',
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as string[])
        }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 个商品`,
          onChange: (page, pageSize) => {
            setPagination(prev => ({ ...prev, current: page, pageSize }))
          },
          onShowSizeChange: (page, pageSize) => {
            setPagination(prev => ({ ...prev, current: page, pageSize }))
          }
        }}
        scroll={{ y: 400 }}
      />
    </Modal>
  )
}

export default ProductSelector

