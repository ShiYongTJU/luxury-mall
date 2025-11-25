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
import { SearchOutlined, ReloadOutlined, EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { productApi } from '../../api/product'
import { Product, ProductQueryParams } from '../../types/product'
import type { ColumnsType } from 'antd/es/table'
import ImageSelector from '../../components/ImageSelector/ImageSelector'
import { getFullImageUrl } from '../../utils/backendUrl'
import { PermissionWrapper } from '../../components/Permission/PermissionWrapper'
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

  // 编辑/新增相关状态
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editForm] = Form.useForm()

  // 复杂字段编辑 Modal 状态
  const [complexFieldModalVisible, setComplexFieldModalVisible] = useState(false)
  const [complexFieldType, setComplexFieldType] = useState<'images' | 'highlights' | 'services' | 'specs' | 'reviews' | null>(null)
  const [complexFieldData, setComplexFieldData] = useState<any[]>([])
  const [editingRowKey, setEditingRowKey] = useState<string | null>(null)
  const [editingOptions, setEditingOptions] = useState<Set<string>>(new Set()) // 正在编辑的 option key 集合（格式：specKey_optionId）
  
  // 图片选择器状态
  const [imageSelectorVisible, setImageSelectorVisible] = useState(false)
  const [imageSelectorTarget, setImageSelectorTarget] = useState<'mainImage' | 'imageList' | null>(null)
  const [imageListEditingIndex, setImageListEditingIndex] = useState<string | null>(null) // 编辑图片列表时的 key

  // 打开新增对话框
  const handleAdd = () => {
    setEditingProduct(null)
    setIsEditMode(false)
    editForm.resetFields()
    setEditModalVisible(true)
  }

  // 打开编辑对话框
  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsEditMode(true)
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
      stock: product.stock,
      images: product.images || [],
      detailDescription: product.detailDescription || '',
      highlights: product.highlights || [],
      specs: product.specs || [],
      reviews: product.reviews || [],
      services: product.services || [],
      shippingInfo: product.shippingInfo || ''
    })
    setEditModalVisible(true)
  }

  // 保存（新增或编辑）
  const handleSave = async () => {
    try {
      const values = await editForm.validateFields()
      
      // 复杂字段已经是数组格式，直接使用
      const images = values.images && Array.isArray(values.images) ? values.images : undefined
      const highlights = values.highlights && Array.isArray(values.highlights) ? values.highlights : undefined
      const specs = values.specs && Array.isArray(values.specs) ? values.specs : undefined
      const reviews = values.reviews && Array.isArray(values.reviews) ? values.reviews : undefined
      const services = values.services && Array.isArray(values.services) ? values.services : undefined

      if (isEditMode && editingProduct) {
        // 编辑模式
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
          stock: values.stock,
          images,
          detailDescription: values.detailDescription,
          highlights,
          specs,
          reviews,
          services,
          shippingInfo: values.shippingInfo
        }

        await productApi.updateProduct(editingProduct.id, updates)
        message.success('商品更新成功')
      } else {
        // 新增模式
        const newProduct: Omit<Product, 'id'> & { id?: string } = {
          name: values.name,
          description: values.description,
          image: values.image,
          price: values.price,
          originalPrice: values.originalPrice,
          tag: values.tag,
          category: values.category,
          subCategory: values.subCategory,
          brand: values.brand,
          stock: values.stock,
          images,
          detailDescription: values.detailDescription,
          highlights,
          specs,
          reviews,
          services,
          shippingInfo: values.shippingInfo
        }

        await productApi.addProduct(newProduct)
        message.success('商品新增成功')
      }

      setEditModalVisible(false)
      setEditingProduct(null)
      setIsEditMode(false)
      editForm.resetFields()
      
      // 刷新列表
      fetchProducts(undefined, pagination.current, pagination.pageSize)
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return
      }
      message.error((isEditMode ? '更新' : '新增') + '商品失败：' + (error.message || '未知错误'))
    }
  }

  // 取消编辑/新增
  const handleCancel = () => {
    setEditModalVisible(false)
    setEditingProduct(null)
    setIsEditMode(false)
    editForm.resetFields()
  }

  // 打开复杂字段编辑 Modal
  const handleOpenComplexField = (fieldType: 'images' | 'highlights' | 'services' | 'specs' | 'reviews') => {
    const currentValue = editForm.getFieldValue(fieldType) || []
    setComplexFieldType(fieldType)
    
    // 将数据转换为表格格式
    let tableData: any[] = []
    if (fieldType === 'images' || fieldType === 'highlights' || fieldType === 'services') {
      // 简单数组：转换为 { key, value } 格式
      tableData = currentValue.map((item: string, index: number) => ({
        key: `row_${index}`,
        value: item
      }))
    } else if (fieldType === 'specs') {
      // specs: ProductSpec[] -> 展开为表格行，options 保持为数组
      tableData = currentValue.map((spec: any, index: number) => ({
        key: spec.id || `spec_${index}`,
        id: spec.id || '',
        name: spec.name || '',
        options: (spec.options || []).map((opt: any, optIndex: number) => ({
          ...opt,
          _internalKey: opt._internalKey || `internal_${spec.id || index}_${opt.id || optIndex}_${Date.now()}` // 为每个 option 添加稳定的内部 key
        }))
      }))
    } else if (fieldType === 'reviews') {
      // reviews: ProductReview[] -> 展开为表格行
      tableData = currentValue.map((review: any, index: number) => ({
        key: review.id || `review_${index}`,
        id: review.id || '',
        user: review.user || '',
        avatar: review.avatar || '',
        rating: review.rating || 5,
        comment: review.comment || '',
        date: review.date || '',
        specSummary: review.specSummary || ''
      }))
    }
    
    setComplexFieldData(tableData)
    setComplexFieldModalVisible(true)
  }

  // 保存复杂字段数据
  const handleSaveComplexField = () => {
    if (!complexFieldType) return

    // 检查是否有未保存的嵌套信息（options）
    if (complexFieldType === 'specs' && editingOptions.size > 0) {
      message.warning('请先保存正在编辑的选项，然后再保存整个规格')
      return
    }

    let convertedData: any[] = []
    
    if (complexFieldType === 'images' || complexFieldType === 'highlights' || complexFieldType === 'services') {
      // 简单数组：从 { key, value } 转换回数组
      convertedData = complexFieldData.map(row => row.value).filter((v: string) => v && v.trim())
    } else if (complexFieldType === 'specs') {
      // specs: 从表格行转换回 ProductSpec[]，options 已经是数组
      convertedData = complexFieldData.map(row => ({
        id: row.id || `spec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: row.name || '',
        options: Array.isArray(row.options) ? row.options : []
      })).filter((spec: any) => spec.name && spec.name.trim())
    } else if (complexFieldType === 'reviews') {
      // reviews: 从表格行转换回 ProductReview[]
      convertedData = complexFieldData.map(row => ({
        id: row.id || `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user: row.user || '',
        avatar: row.avatar || '',
        rating: row.rating || 5,
        comment: row.comment || '',
        date: row.date || new Date().toISOString().split('T')[0],
        specSummary: row.specSummary || ''
      })).filter((review: any) => review.user && review.user.trim())
    }

    // 更新表单字段值
    editForm.setFieldsValue({
      [complexFieldType]: convertedData
    })
    
    setComplexFieldModalVisible(false)
    setComplexFieldType(null)
    setComplexFieldData([])
    setEditingRowKey(null)
    setEditingOptions(new Set())
  }

  // 取消复杂字段编辑
  const handleCancelComplexField = () => {
    setComplexFieldModalVisible(false)
    setComplexFieldType(null)
    setComplexFieldData([])
    setEditingRowKey(null)
    setEditingOptions(new Set())
  }

  // 新增行
  const handleAddRow = () => {
    if (!complexFieldType) return

    const newKey = `new_${Date.now()}`
    let newRow: any = { key: newKey }

    if (complexFieldType === 'images' || complexFieldType === 'highlights' || complexFieldType === 'services') {
      newRow.value = ''
    } else if (complexFieldType === 'specs') {
      newRow = {
        key: newKey,
        id: '',
        name: '',
        options: [] // 使用数组而不是 JSON 字符串
      }
    } else if (complexFieldType === 'reviews') {
      newRow = {
        key: newKey,
        id: '',
        user: '',
        avatar: '',
        rating: 5,
        comment: '',
        date: new Date().toISOString().split('T')[0],
        specSummary: ''
      }
    }

    setComplexFieldData([...complexFieldData, newRow])
    setEditingRowKey(newKey)
    // 新增选项后，自动进入编辑状态
    if (complexFieldType === 'specs') {
      const newOption = newRow.options && newRow.options.length > 0 ? newRow.options[newRow.options.length - 1] : null
      if (newOption) {
        const optionKey = `${newKey}_${newOption.id}`
        setEditingOptions(new Set([...editingOptions, optionKey]))
      }
    }
  }

  // 删除行
  const handleDeleteRow = (key: string) => {
    setComplexFieldData(complexFieldData.filter(row => row.key !== key))
  }

  // 更新行数据
  const handleUpdateRow = (key: string, field: string, value: any) => {
    setComplexFieldData(complexFieldData.map(row => 
      row.key === key ? { ...row, [field]: value } : row
    ))
  }

  // 新增 option
  const handleAddOption = (specKey: string) => {
    setComplexFieldData(complexFieldData.map(row => {
      if (row.key === specKey) {
        const newOption = {
          id: `option_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          label: '',
          subLabel: '',
          _internalKey: `internal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // 稳定的内部 key
        }
        return {
          ...row,
          options: [...(row.options || []), newOption]
        }
      }
      return row
    }))
  }

  // 删除 option
  const handleDeleteOption = (specKey: string, optionInternalKey: string) => {
    // 如果正在编辑，先移除编辑状态
    const optionKey = `${specKey}_${optionInternalKey}`
    if (editingOptions.has(optionKey)) {
      const newEditingOptions = new Set(editingOptions)
      newEditingOptions.delete(optionKey)
      setEditingOptions(newEditingOptions)
    }
    
    setComplexFieldData(complexFieldData.map(row => {
      if (row.key === specKey) {
        return {
          ...row,
          options: (row.options || []).filter((opt: any) => {
            const matchKey = opt._internalKey || opt.id
            return matchKey !== optionInternalKey
          })
        }
      }
      return row
    }))
  }

  // 更新 option
  // optionInternalKey: 用于定位 option 的稳定 key（_internalKey）
  const handleUpdateOption = (specKey: string, optionInternalKey: string, field: string, value: any) => {
    // 使用函数式更新，避免闭包问题，并确保 _internalKey 被保持
    setComplexFieldData(prevData => prevData.map(row => {
      if (row.key === specKey) {
        return {
          ...row,
          options: (row.options || []).map((opt: any) => {
            // 使用 _internalKey 或 id 来匹配
            const matchKey = opt._internalKey || opt.id
            if (matchKey === optionInternalKey) {
              // 确保 _internalKey 被保持
              return { ...opt, [field]: value, _internalKey: opt._internalKey || optionInternalKey }
            }
            return opt
          })
        }
      }
      return row
    }))
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
        <PermissionWrapper permission="button:product:edit">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
        </PermissionWrapper>
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
        <div style={{ marginTop: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
          <PermissionWrapper permission="button:product:add">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              新增商品
            </Button>
          </PermissionWrapper>
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

      {/* 编辑/新增商品对话框 */}
      <Modal
        title={isEditMode ? '编辑商品' : '新增商品'}
        open={editModalVisible}
        onOk={handleSave}
        onCancel={handleCancel}
        width={900}
        okText={isEditMode ? '保存' : '创建'}
        cancelText="取消"
        destroyOnHidden
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
            label="商品主图URL"
            rules={[{ required: true, message: '请选择商品主图' }]}
          >
            <Space>
              {editForm.getFieldValue('image') && (
                <Image
                  src={getFullImageUrl(editForm.getFieldValue('image'))}
                  alt="主图预览"
                  width={80}
                  height={80}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                />
              )}
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setImageSelectorTarget('mainImage')
                  setImageSelectorVisible(true)
                }}
              >
                {editForm.getFieldValue('image') ? '更换' : '选择'}
              </Button>
            </Space>
          </Form.Item>

          <Form.Item
            name="images"
            label="商品图片列表"
          >
            <Space>
              <span style={{ color: '#999' }}>
                {editForm.getFieldValue('images')?.length || 0} 张图片
              </span>
              <Button 
                type="link" 
                icon={<EditOutlined />}
                onClick={() => handleOpenComplexField('images')}
              >
                编辑
              </Button>
            </Space>
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

          <Form.Item
            name="detailDescription"
            label="详细描述"
          >
            <Input.TextArea rows={4} placeholder="请输入商品详细描述" />
          </Form.Item>

          <Form.Item
            name="highlights"
            label="商品亮点"
          >
            <Space>
              <span style={{ color: '#999' }}>
                {editForm.getFieldValue('highlights')?.length || 0} 个亮点
              </span>
              <Button 
                type="link" 
                icon={<EditOutlined />}
                onClick={() => handleOpenComplexField('highlights')}
              >
                编辑
              </Button>
            </Space>
          </Form.Item>

          <Form.Item
            name="specs"
            label="商品规格"
          >
            <Space>
              <span style={{ color: '#999' }}>
                {editForm.getFieldValue('specs')?.length || 0} 个规格
              </span>
              <Button 
                type="link" 
                icon={<EditOutlined />}
                onClick={() => handleOpenComplexField('specs')}
              >
                编辑
              </Button>
            </Space>
          </Form.Item>

          <Form.Item
            name="reviews"
            label="商品评价"
          >
            <Space>
              <span style={{ color: '#999' }}>
                {editForm.getFieldValue('reviews')?.length || 0} 条评价
              </span>
              <Button 
                type="link" 
                icon={<EditOutlined />}
                onClick={() => handleOpenComplexField('reviews')}
              >
                编辑
              </Button>
            </Space>
          </Form.Item>

          <Form.Item
            name="services"
            label="服务承诺"
          >
            <Space>
              <span style={{ color: '#999' }}>
                {editForm.getFieldValue('services')?.length || 0} 项服务
              </span>
              <Button 
                type="link" 
                icon={<EditOutlined />}
                onClick={() => handleOpenComplexField('services')}
              >
                编辑
              </Button>
            </Space>
          </Form.Item>

          <Form.Item
            name="shippingInfo"
            label="配送信息"
          >
            <Input.TextArea rows={2} placeholder="请输入配送信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 复杂字段编辑 Modal */}
      <Modal
        title={
          complexFieldType === 'images' ? '编辑商品图片列表' :
          complexFieldType === 'highlights' ? '编辑商品亮点' :
          complexFieldType === 'services' ? '编辑服务承诺' :
          complexFieldType === 'specs' ? '编辑商品规格' :
          complexFieldType === 'reviews' ? '编辑商品评价' :
          '编辑'
        }
        open={complexFieldModalVisible}
        onOk={handleSaveComplexField}
        onCancel={handleCancelComplexField}
        width={complexFieldType === 'specs' || complexFieldType === 'reviews' ? 1000 : 600}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        {complexFieldType && (
          <div>
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRow}>
                新增
              </Button>
            </div>
            
            {complexFieldType === 'images' && (
              <Table
                dataSource={complexFieldData}
                rowKey="key"
                pagination={false}
                columns={[
                  {
                    title: '预览',
                    dataIndex: 'value',
                    key: 'preview',
                    width: 100,
                    render: (text: string) => text ? (
                      <Image
                        src={getFullImageUrl(text)}
                        alt="预览"
                        width={60}
                        height={60}
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                      />
                    ) : (
                      <span style={{ color: '#999' }}>暂无图片</span>
                    )
                  },
                  {
                    title: '图片URL',
                    dataIndex: 'value',
                    key: 'value',
                    ellipsis: true,
                    render: (text: string) => (
                      <span style={{ fontSize: 12, color: '#666' }}>
                        {text || '未设置'}
                      </span>
                    )
                  },
                  {
                    title: '操作',
                    key: 'action',
                    width: 150,
                    render: (_: any, record: any) => (
                      <Space>
                        <Button
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => {
                            setImageSelectorTarget('imageList')
                            setImageListEditingIndex(record.key)
                            setImageSelectorVisible(true)
                          }}
                        >
                          编辑
                        </Button>
                        <Button
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteRow(record.key)}
                        >
                          删除
                        </Button>
                      </Space>
                    )
                  }
                ]}
              />
            )}

            {complexFieldType === 'highlights' && (
              <Table
                dataSource={complexFieldData}
                rowKey="key"
                pagination={false}
                columns={[
                  {
                    title: '亮点内容',
                    dataIndex: 'value',
                    key: 'value',
                    render: (text: string, record: any) => 
                      editingRowKey === record.key ? (
                        <Input
                          value={text}
                          onChange={(e) => handleUpdateRow(record.key, 'value', e.target.value)}
                          onBlur={() => setEditingRowKey(null)}
                          autoFocus
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingRowKey(record.key)}
                          style={{ cursor: 'pointer', color: '#1890ff' }}
                        >
                          {text || '点击编辑'}
                        </span>
                      )
                  },
                  {
                    title: '操作',
                    key: 'action',
                    width: 100,
                    render: (_: any, record: any) => (
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteRow(record.key)}
                      >
                        删除
                      </Button>
                    )
                  }
                ]}
              />
            )}

            {complexFieldType === 'services' && (
              <Table
                dataSource={complexFieldData}
                rowKey="key"
                pagination={false}
                columns={[
                  {
                    title: '服务内容',
                    dataIndex: 'value',
                    key: 'value',
                    render: (text: string, record: any) => 
                      editingRowKey === record.key ? (
                        <Input
                          value={text}
                          onChange={(e) => handleUpdateRow(record.key, 'value', e.target.value)}
                          onBlur={() => setEditingRowKey(null)}
                          autoFocus
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingRowKey(record.key)}
                          style={{ cursor: 'pointer', color: '#1890ff' }}
                        >
                          {text || '点击编辑'}
                        </span>
                      )
                  },
                  {
                    title: '操作',
                    key: 'action',
                    width: 100,
                    render: (_: any, record: any) => (
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteRow(record.key)}
                      >
                        删除
                      </Button>
                    )
                  }
                ]}
              />
            )}

            {complexFieldType === 'specs' && (
              <Table
                dataSource={complexFieldData}
                rowKey="key"
                pagination={false}
                expandable={{
                  expandedRowRender: (record: any) => {
                    const options = Array.isArray(record.options) ? record.options : []
                    return (
                      <div style={{ padding: '16px 0' }}>
                        <div style={{ marginBottom: 12, textAlign: 'right' }}>
                          <Button 
                            type="primary" 
                            size="small"
                            icon={<PlusOutlined />} 
                            onClick={() => handleAddOption(record.key)}
                          >
                            新增选项
                          </Button>
                        </div>
                        <Table
                          dataSource={options}
                          rowKey={(option: any) => option._internalKey || option.id}
                          pagination={false}
                          size="small"
                          columns={[
                            {
                              title: 'ID',
                              dataIndex: 'id',
                              key: 'id',
                              width: 150,
                              render: (text: string, option: any) => {
                                const optionKey = `${record.key}_${option._internalKey || option.id}`
                                const isOptionEditing = editingOptions.has(optionKey)
                                return isOptionEditing ? (
                                  <Input
                                    key={`input_${optionKey}_id`}
                                    size="small"
                                    value={text}
                                    onChange={(e) => handleUpdateOption(record.key, option._internalKey || option.id, 'id', e.target.value)}
                                  />
                                ) : (
                                  <span>{text || '-'}</span>
                                )
                              }
                            },
                            {
                              title: '标签',
                              dataIndex: 'label',
                              key: 'label',
                              render: (text: string, option: any) => {
                                const optionKey = `${record.key}_${option._internalKey || option.id}`
                                const isOptionEditing = editingOptions.has(optionKey)
                                return isOptionEditing ? (
                                  <Input
                                    key={`input_${optionKey}_label`}
                                    size="small"
                                    value={text}
                                    onChange={(e) => handleUpdateOption(record.key, option._internalKey || option.id, 'label', e.target.value)}
                                    autoFocus
                                  />
                                ) : (
                                  <span>{text || '-'}</span>
                                )
                              }
                            },
                            {
                              title: '子标签',
                              dataIndex: 'subLabel',
                              key: 'subLabel',
                              render: (text: string, option: any) => {
                                const optionKey = `${record.key}_${option._internalKey || option.id}`
                                const isOptionEditing = editingOptions.has(optionKey)
                                return isOptionEditing ? (
                                  <Input
                                    key={`input_${optionKey}_subLabel`}
                                    size="small"
                                    value={text || ''}
                                    onChange={(e) => handleUpdateOption(record.key, option._internalKey || option.id, 'subLabel', e.target.value)}
                                  />
                                ) : (
                                  <span>{text || '-'}</span>
                                )
                              }
                            },
                            {
                              title: '操作',
                              key: 'action',
                              width: 180,
                              render: (_: any, option: any) => {
                                const optionKey = `${record.key}_${option._internalKey || option.id}`
                                const isEditing = editingOptions.has(optionKey)
                                return (
                                  <Space>
                                    {!isEditing ? (
                                      <Button
                                        type="link"
                                        size="small"
                                        icon={<EditOutlined />}
                                        onClick={() => {
                                          setEditingOptions(new Set([...editingOptions, optionKey]))
                                        }}
                                      >
                                        编辑
                                      </Button>
                                    ) : (
                                      <Button
                                        type="link"
                                        size="small"
                                        icon={<EditOutlined />}
                                        onClick={() => {
                                          const newSet = new Set(editingOptions)
                                          newSet.delete(optionKey)
                                          setEditingOptions(newSet)
                                        }}
                                      >
                                        保存
                                      </Button>
                                    )}
                                    <Button
                                      type="link"
                                      danger
                                      size="small"
                                      icon={<DeleteOutlined />}
                                      onClick={() => handleDeleteOption(record.key, option._internalKey || option.id)}
                                    >
                                      删除
                                    </Button>
                                  </Space>
                                )
                              }
                            }
                          ]}
                        />
                      </div>
                    )
                  },
                  rowExpandable: () => true
                }}
                columns={[
                  {
                    title: 'ID',
                    dataIndex: 'id',
                    key: 'id',
                    width: 150,
                    render: (text: string, record: any) => 
                      editingRowKey === record.key ? (
                        <Input
                          value={text}
                          onChange={(e) => handleUpdateRow(record.key, 'id', e.target.value)}
                          onBlur={() => setEditingRowKey(null)}
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingRowKey(record.key)}
                          style={{ cursor: 'pointer', color: '#1890ff' }}
                        >
                          {text || '点击编辑'}
                        </span>
                      )
                  },
                  {
                    title: '规格名称',
                    dataIndex: 'name',
                    key: 'name',
                    render: (text: string, record: any) => 
                      editingRowKey === record.key ? (
                        <Input
                          value={text}
                          onChange={(e) => handleUpdateRow(record.key, 'name', e.target.value)}
                          onBlur={() => setEditingRowKey(null)}
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingRowKey(record.key)}
                          style={{ cursor: 'pointer', color: '#1890ff' }}
                        >
                          {text || '点击编辑'}
                        </span>
                      )
                  },
                  {
                    title: '选项数量',
                    dataIndex: 'options',
                    key: 'options',
                    width: 120,
                    render: (options: any[]) => (
                      <span>{Array.isArray(options) ? options.length : 0} 个选项</span>
                    )
                  },
                  {
                    title: '操作',
                    key: 'action',
                    width: 150,
                    render: (_: any, record: any) => (
                      <Space>
                        {editingRowKey !== record.key && (
                          <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => setEditingRowKey(record.key)}
                          >
                            编辑
                          </Button>
                        )}
                        <Button
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteRow(record.key)}
                        >
                          删除
                        </Button>
                      </Space>
                    )
                  }
                ]}
              />
            )}

            {complexFieldType === 'reviews' && (
              <Table
                dataSource={complexFieldData}
                rowKey="key"
                pagination={false}
                scroll={{ x: 1000 }}
                columns={[
                  {
                    title: 'ID',
                    dataIndex: 'id',
                    key: 'id',
                    width: 120,
                    render: (text: string, record: any) => 
                      editingRowKey === record.key ? (
                        <Input
                          value={text}
                          onChange={(e) => handleUpdateRow(record.key, 'id', e.target.value)}
                          onBlur={() => setEditingRowKey(null)}
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingRowKey(record.key)}
                          style={{ cursor: 'pointer', color: '#1890ff' }}
                        >
                          {text || '点击编辑'}
                        </span>
                      )
                  },
                  {
                    title: '用户',
                    dataIndex: 'user',
                    key: 'user',
                    width: 100,
                    render: (text: string, record: any) => 
                      editingRowKey === record.key ? (
                        <Input
                          value={text}
                          onChange={(e) => handleUpdateRow(record.key, 'user', e.target.value)}
                          onBlur={() => setEditingRowKey(null)}
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingRowKey(record.key)}
                          style={{ cursor: 'pointer', color: '#1890ff' }}
                        >
                          {text || '点击编辑'}
                        </span>
                      )
                  },
                  {
                    title: '头像URL',
                    dataIndex: 'avatar',
                    key: 'avatar',
                    width: 150,
                    render: (text: string, record: any) => 
                      editingRowKey === record.key ? (
                        <Input
                          value={text}
                          onChange={(e) => handleUpdateRow(record.key, 'avatar', e.target.value)}
                          onBlur={() => setEditingRowKey(null)}
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingRowKey(record.key)}
                          style={{ cursor: 'pointer', color: '#1890ff' }}
                        >
                          {text || '点击编辑'}
                        </span>
                      )
                  },
                  {
                    title: '评分',
                    dataIndex: 'rating',
                    key: 'rating',
                    width: 100,
                    render: (text: number, record: any) => 
                      editingRowKey === record.key ? (
                        <InputNumber
                          min={1}
                          max={5}
                          value={text}
                          onChange={(value) => handleUpdateRow(record.key, 'rating', value)}
                          onBlur={() => setEditingRowKey(null)}
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingRowKey(record.key)}
                          style={{ cursor: 'pointer', color: '#1890ff' }}
                        >
                          {text || '点击编辑'}
                        </span>
                      )
                  },
                  {
                    title: '评价内容',
                    dataIndex: 'comment',
                    key: 'comment',
                    width: 200,
                    render: (text: string, record: any) => 
                      editingRowKey === record.key ? (
                        <Input.TextArea
                          rows={2}
                          value={text}
                          onChange={(e) => handleUpdateRow(record.key, 'comment', e.target.value)}
                          onBlur={() => setEditingRowKey(null)}
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingRowKey(record.key)}
                          style={{ cursor: 'pointer', color: '#1890ff' }}
                        >
                          {text || '点击编辑'}
                        </span>
                      )
                  },
                  {
                    title: '日期',
                    dataIndex: 'date',
                    key: 'date',
                    width: 120,
                    render: (text: string, record: any) => 
                      editingRowKey === record.key ? (
                        <Input
                          value={text}
                          onChange={(e) => handleUpdateRow(record.key, 'date', e.target.value)}
                          onBlur={() => setEditingRowKey(null)}
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingRowKey(record.key)}
                          style={{ cursor: 'pointer', color: '#1890ff' }}
                        >
                          {text || '点击编辑'}
                        </span>
                      )
                  },
                  {
                    title: '规格摘要',
                    dataIndex: 'specSummary',
                    key: 'specSummary',
                    width: 150,
                    render: (text: string, record: any) => 
                      editingRowKey === record.key ? (
                        <Input
                          value={text}
                          onChange={(e) => handleUpdateRow(record.key, 'specSummary', e.target.value)}
                          onBlur={() => setEditingRowKey(null)}
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingRowKey(record.key)}
                          style={{ cursor: 'pointer', color: '#1890ff' }}
                        >
                          {text || '点击编辑'}
                        </span>
                      )
                  },
                  {
                    title: '操作',
                    key: 'action',
                    width: 150,
                    fixed: 'right' as const,
                    render: (_: any, record: any) => (
                      <Space>
                        {editingRowKey !== record.key && (
                          <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => setEditingRowKey(record.key)}
                          >
                            编辑
                          </Button>
                        )}
                        <Button
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteRow(record.key)}
                        >
                          删除
                        </Button>
                      </Space>
                    )
                  }
                ]}
              />
            )}
          </div>
        )}
      </Modal>

      {/* 图片选择器 */}
      <ImageSelector
        open={imageSelectorVisible}
        onCancel={() => {
          setImageSelectorVisible(false)
          setImageSelectorTarget(null)
          setImageListEditingIndex(null)
        }}
        onSelect={(imageUrl: string) => {
          if (imageSelectorTarget === 'mainImage') {
            // 设置主图URL
            editForm.setFieldsValue({ image: imageUrl })
          } else if (imageSelectorTarget === 'imageList' && imageListEditingIndex !== null) {
            // 更新图片列表中的某个图片URL
            handleUpdateRow(imageListEditingIndex, 'value', imageUrl)
          }
          setImageSelectorVisible(false)
          setImageSelectorTarget(null)
          setImageListEditingIndex(null)
        }}
        title={imageSelectorTarget === 'mainImage' ? '选择商品主图' : '选择图片'}
      />
    </div>
  )
}

export default ProductList

