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
  Image as AntImage,
  Modal,
  Upload,
  Select,
  DatePicker
} from 'antd'
import { SearchOutlined, ReloadOutlined, EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd/es/upload'
import dayjs from 'dayjs'
import { imageApi } from '../../api/image'
import { Image, ImageQueryParams } from '../../types/image'
import type { ColumnsType } from 'antd/es/table'
import { getFullImageUrl, getImageBaseUrl } from '../../utils/backendUrl'
import { PermissionWrapper } from '../../components/Permission/PermissionWrapper'
import '../Product/ProductList.css'

function ImageList() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<Image[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [imageMetadata, setImageMetadata] = useState<{ width?: number; height?: number; size?: number; format?: string } | null>(null)
  
  // 保存查询参数，避免重复查询
  const queryParamsRef = useRef<ImageQueryParams>({})
  // 标记是否已初始化，避免初始加载和分页变化冲突
  const isInitializedRef = useRef(false)
  // 保存分页信息到 ref，避免闭包问题
  const paginationRef = useRef(pagination)

  // 更新 pagination ref
  useEffect(() => {
    paginationRef.current = pagination
  }, [pagination])

  // 获取图片列表（从后端查询，支持分页）
  const fetchImages = async (
    searchParams?: ImageQueryParams,
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
      
      const queryParams: ImageQueryParams = {
        ...queryParamsRef.current,
        page: currentPage,
        pageSize: currentPageSize
      }
      
      // 调用后端接口查询
      const result = await imageApi.getImages(queryParams)
      
      // 设置图片列表和分页信息
      setImages(result.images)
      setPagination({
        total: result.total,
        current: result.page,
        pageSize: result.pageSize
      })
      
      // 标记已初始化
      isInitializedRef.current = true
    } catch (error: any) {
      message.error('获取图片列表失败：' + (error.message || '未知错误'))
      setImages([])
      setPagination(prev => ({ ...prev, total: 0 }))
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    if (!isInitializedRef.current) {
      fetchImages()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 只在组件挂载时执行一次

  // 分页变化时查询（使用最新的查询参数）
  useEffect(() => {
    // 只有在已初始化后才响应分页变化
    if (isInitializedRef.current) {
      fetchImages(undefined, pagination.current, pagination.pageSize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize])

  // 查询
  const handleSearch = () => {
    const values = form.getFieldsValue()
    const searchParams: ImageQueryParams = {
      name: values.name || undefined,
      category: values.category || undefined,
      tags: values.tags || undefined,
      format: values.format || undefined,
      minWidth: values.minWidth || undefined,
      maxWidth: values.maxWidth || undefined,
      minHeight: values.minHeight || undefined,
      maxHeight: values.maxHeight || undefined,
      minSize: values.minSize ? values.minSize * 1024 : undefined, // 转换为字节
      maxSize: values.maxSize ? values.maxSize * 1024 : undefined, // 转换为字节
      startTime: values.startTime ? dayjs(values.startTime).format('YYYY-MM-DD') : undefined,
      endTime: values.endTime ? dayjs(values.endTime).format('YYYY-MM-DD') : undefined
    }
    fetchImages(searchParams, 1, pagination.pageSize)
  }

  // 重置
  const handleReset = () => {
    form.resetFields()
    queryParamsRef.current = {}
    fetchImages({}, 1, pagination.pageSize)
  }

  // 编辑/新增相关状态
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingImage, setEditingImage] = useState<Image | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editForm] = Form.useForm()
  
  // 当 Modal 打开且是编辑模式时，设置表单值
  useEffect(() => {
    if (editModalVisible && isEditMode && editingImage) {
      // 确保在 Modal 完全渲染后再设置值
      const timer = setTimeout(() => {
        const formValues = {
          name: editingImage.name,
          url: editingImage.url || '',
          description: editingImage.description || '',
          category: editingImage.category || '',
          tags: editingImage.tags || '',
          width: editingImage.width,
          height: editingImage.height,
          size: editingImage.size,
          format: editingImage.format || ''
        }
        editForm.setFieldsValue(formValues)
        
        // 如果有URL，设置元数据
        if (editingImage.url) {
          const hasMetadata = editingImage.width && editingImage.height
          if (hasMetadata) {
            setImageMetadata({
              width: editingImage.width,
              height: editingImage.height,
              size: editingImage.size,
              format: editingImage.format
            })
          }
          
          // 如果元数据不完整（缺少 size 或 format），自动获取
          const needsMetadata = !editingImage.size || !editingImage.format
          if (needsMetadata) {
            // 延迟执行，确保表单值已设置
            setTimeout(() => {
              handleUrlChange(editingImage.url!)
            }, 200)
          }
        }
      }, 100) // 给 Modal 一些时间完成渲染
      
      return () => clearTimeout(timer)
    } else if (editModalVisible && !isEditMode) {
      // 新增模式，清空表单
      editForm.resetFields()
      setFileList([])
      setImageMetadata(null)
    }
  }, [editModalVisible, isEditMode, editingImage, editForm])

  // 获取图片元数据（宽高、大小、格式）
  const getImageMetadata = (url: string): Promise<{ width: number; height: number; size?: number; format?: string }> => {
    return new Promise(async (resolve, reject) => {
      // 如果是 data URL，可以直接获取大小
      let fileSize: number | undefined
      let format: string | undefined
      
      if (url.startsWith('data:')) {
        const base64Data = url.split(',')[1]
        if (base64Data) {
          // base64 编码后大小约为原文件的 1.33 倍，所以原文件大小约为编码后的 0.75 倍
          fileSize = Math.floor(base64Data.length * 0.75)
        }
        // 从 data URL 中提取格式
        const match = url.match(/data:image\/(\w+)/i)
        if (match) {
          format = match[1].toLowerCase()
        }
      }
      
      // 如果是完整URL（http:// 或 https:// 开头），尝试通过 HEAD 请求获取大小和格式
      let imageUrl = url
      if (url.startsWith('http://') || url.startsWith('https://')) {
        imageUrl = url
        // 尝试通过 HEAD 请求获取文件大小和 Content-Type
        try {
          const response = await fetch(url, { method: 'HEAD', mode: 'cors' })
          if (response.ok) {
            // 获取文件大小
            const contentLength = response.headers.get('Content-Length')
            if (contentLength) {
              fileSize = parseInt(contentLength, 10)
            }
            
            // 从 Content-Type 获取格式
            const contentType = response.headers.get('Content-Type')
            if (contentType && contentType.startsWith('image/')) {
              const match = contentType.match(/image\/(\w+)/i)
              if (match) {
                format = match[1].toLowerCase()
                // 处理 jpeg -> jpg
                if (format === 'jpeg') {
                  format = 'jpg'
                }
              }
            }
          }
        } catch (error) {
          // HEAD 请求失败不影响图片加载，继续尝试从 URL 提取格式
          console.warn('HEAD 请求失败，将尝试从 URL 提取格式:', error)
        }
      } else if (url.startsWith('/') && !url.startsWith('//')) {
        // 相对路径，添加后端基础URL
        imageUrl = `${getImageBaseUrl()}${url}`
        // 对于相对路径，也尝试获取元数据
        try {
          const response = await fetch(imageUrl, { method: 'HEAD', mode: 'cors' })
          if (response.ok) {
            const contentLength = response.headers.get('Content-Length')
            if (contentLength) {
              fileSize = parseInt(contentLength, 10)
            }
            const contentType = response.headers.get('Content-Type')
            if (contentType && contentType.startsWith('image/')) {
              const match = contentType.match(/image\/(\w+)/i)
              if (match) {
                format = match[1].toLowerCase()
                if (format === 'jpeg') {
                  format = 'jpg'
                }
              }
            }
          }
        } catch (error) {
          console.warn('HEAD 请求失败:', error)
        }
      }
      
      // 如果还没有获取到格式，尝试从 URL 中提取
      if (!format) {
        const urlMatch = url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i)
        if (urlMatch) {
          format = urlMatch[1].toLowerCase()
          if (format === 'jpeg') {
            format = 'jpg'
          }
        }
      }
      
      const img = new window.Image()
      // 只有非 data URL 才需要设置 crossOrigin
      if (!url.startsWith('data:')) {
        img.crossOrigin = 'anonymous'
      }
      
      // 设置超时（10秒）
      const timeout = setTimeout(() => {
        reject(new Error('图片加载超时'))
      }, 10000)
      
      img.onload = () => {
        clearTimeout(timeout)
        const width = img.naturalWidth
        const height = img.naturalHeight
        
        resolve({ width, height, size: fileSize, format })
      }
      
      img.onerror = (error) => {
        clearTimeout(timeout)
        console.error('图片加载失败:', { originalUrl: url, imageUrl, error })
        reject(new Error(`无法加载图片: ${url.startsWith('/') ? '相对路径需要完整URL' : '图片URL无效'}`))
      }
      
      img.src = imageUrl
    })
  }

  // 处理URL变化，自动获取图片元数据
  const handleUrlChange = async (url: string) => {
    if (!url || !url.trim()) {
      setImageMetadata(null)
      editForm.setFieldsValue({ width: undefined, height: undefined, size: undefined, format: undefined })
      return
    }
    
    // 检查是否是有效的图片URL
    if (url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i) || url.startsWith('data:image/') || url.startsWith('http')) {
      try {
        const metadata = await getImageMetadata(url)
        setImageMetadata(metadata)
        editForm.setFieldsValue({
          width: metadata.width,
          height: metadata.height,
          format: metadata.format || editForm.getFieldValue('format')
        })
      } catch (error) {
        console.error('获取图片元数据失败:', error)
        setImageMetadata(null)
      }
    } else {
      setImageMetadata(null)
    }
  }

  // 文件上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    fileList,
    onChange: (info) => {
      setFileList(info.fileList)
    },
    customRequest: async (options) => {
      console.log('customRequest 被调用', options)
      const { file, onSuccess, onError } = options
      const fileObj = file as File
      
      // 验证文件类型
      if (!fileObj.type.startsWith('image/')) {
        onError?.(new Error('只能上传图片文件！') as any)
        return
      }
      
      // 验证文件大小
      const isLt10M = fileObj.size / 1024 / 1024 < 10
      if (!isLt10M) {
        onError?.(new Error('图片大小不能超过 10MB！') as any)
        return
      }
      
      // 读取文件并转换为 base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string
        if (dataUrl) {
          // 获取图片元数据
          const img = new window.Image()
          img.onload = async () => {
            const format = fileObj.type.split('/')[1]?.toLowerCase() || fileObj.name.split('.').pop()?.toLowerCase()
            setImageMetadata({
              width: img.naturalWidth,
              height: img.naturalHeight,
              size: fileObj.size,
              format: format
            })
            editForm.setFieldsValue({
              width: img.naturalWidth,
              height: img.naturalHeight,
              size: fileObj.size,
              format: format
            })
            
            // 上传到服务器
            try {
              const response = await fetch('/api/upload/image', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ file: dataUrl })
              })
              
              if (response.ok) {
                const result = await response.json()
                if (result.url) {
                  // 后端返回相对路径，加上服务器URL前缀
                  const fullImageUrl = getFullImageUrl(result.url)
                  editForm.setFieldsValue({ url: fullImageUrl })
                  
                  // 更新元数据中的大小
                  if (result.size) {
                    setImageMetadata(prev => ({
                      ...prev,
                      size: result.size
                    }))
                    editForm.setFieldsValue({ size: result.size })
                  }
                  
                  onSuccess?.(result, fileObj as any)
                  message.success('图片上传成功')
                } else {
                  throw new Error('服务器未返回图片URL')
                }
              } else {
                const errorText = await response.text()
                throw new Error(`上传失败: ${errorText}`)
              }
            } catch (error: any) {
              console.error('图片上传失败:', error)
              onError?.(error as any)
              message.error('图片上传失败：' + (error.message || '未知错误'))
            }
          }
          img.onerror = () => {
            onError?.(new Error('无法读取图片文件') as any)
            message.error('无法读取图片文件')
          }
          img.src = dataUrl
        }
      }
      reader.onerror = () => {
        onError?.(new Error('读取文件失败') as any)
        message.error('读取文件失败')
      }
      reader.readAsDataURL(fileObj)
    },
    onRemove: () => {
      setFileList([])
      setImageMetadata(null)
    }
  }

  // 打开新增对话框
  const handleAdd = () => {
    setEditingImage(null)
    setIsEditMode(false)
    editForm.resetFields()
    setFileList([])
    setImageMetadata(null)
    setEditModalVisible(true)
  }

  // 打开编辑对话框
  const handleEdit = async (image: Image) => {
    // 先清空 fileList，避免上传组件干扰
    setFileList([])
    setImageMetadata(null)
    
    // 设置编辑状态
    setEditingImage(image)
    setIsEditMode(true)
    
    // 打开 Modal，useEffect 会自动设置表单值
    setEditModalVisible(true)
  }

  // 保存（新增或编辑）
  const handleSave = async () => {
    try {
      const values = await editForm.validateFields()
      const imageUrl = values.url
      
      if (!imageUrl || !imageUrl.trim()) {
        message.error('图片URL不能为空')
        return
      }
      
      // 如果URL是相对路径，转换为完整URL
      const fullImageUrl = imageUrl.startsWith('http://') || imageUrl.startsWith('https://') 
        ? imageUrl 
        : getFullImageUrl(imageUrl)
      
      // 使用已有的元数据或表单中的值
      const finalMetadata = {
        width: imageMetadata?.width || values.width,
        height: imageMetadata?.height || values.height,
        size: imageMetadata?.size || values.size,
        format: imageMetadata?.format || values.format
      }
      
      if (isEditMode && editingImage) {
        // 编辑模式
        const updates: Partial<Image> = {
          name: values.name,
          url: fullImageUrl, // 使用完整URL（包含后端域名和端口）
          description: values.description,
          category: values.category,
          tags: values.tags,
          width: finalMetadata.width,
          height: finalMetadata.height,
          size: finalMetadata.size,
          format: finalMetadata.format
        }

        await imageApi.updateImage(editingImage.id, updates)
        message.success('图片更新成功')
      } else {
        // 新增模式
        const newImage: Omit<Image, 'id'> & { id?: string } = {
          name: values.name,
          url: fullImageUrl, // 使用完整URL（包含后端域名和端口）
          description: values.description,
          category: values.category,
          tags: values.tags,
          width: finalMetadata.width,
          height: finalMetadata.height,
          size: finalMetadata.size,
          format: finalMetadata.format
        }

        await imageApi.addImage(newImage)
        message.success('图片新增成功')
      }

      setEditModalVisible(false)
      setEditingImage(null)
      setIsEditMode(false)
      editForm.resetFields()
      setFileList([])
      setImageMetadata(null)
      
      // 刷新列表
      fetchImages(undefined, pagination.current, pagination.pageSize)
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return
      }
      message.error((isEditMode ? '更新' : '新增') + '图片失败：' + (error.message || '未知错误'))
    }
  }

  // 取消编辑/新增
  const handleCancel = () => {
    setEditModalVisible(false)
    setEditingImage(null)
    setIsEditMode(false)
    editForm.resetFields()
    setFileList([])
    setImageMetadata(null)
  }

  // 表格列定义
  const columns: ColumnsType<Image> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '图片',
      dataIndex: 'url',
      key: 'url',
      width: 120,
      render: (url: string) => (
        <AntImage
          src={url}
          alt="图片"
          width={80}
          height={80}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYc8L3RleHQ+PC9zdmc+"
        />
      )
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      width: 300,
      ellipsis: true
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      ellipsis: true
    },
    {
      title: '尺寸',
      key: 'dimensions',
      width: 120,
      render: (_: any, record: Image) => 
        record.width && record.height ? `${record.width} × ${record.height}` : '-'
    },
    {
      title: '格式',
      dataIndex: 'format',
      key: 'format',
      width: 80
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (size: number) => size ? `${(size / 1024).toFixed(2)} KB` : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: Image) => (
        <PermissionWrapper permission="button:image:edit">
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
      <Card title="图片列表" style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          className="product-list-form"
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="name" label="图片名称" labelCol={{ style: { width: 80 } }}>
            <Input placeholder="请输入图片名称" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="category" label="分类" labelCol={{ style: { width: 80 } }}>
            <Input placeholder="请输入分类" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="tags" label="标签" labelCol={{ style: { width: 80 } }}>
            <Input placeholder="请输入标签" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="format" label="格式" labelCol={{ style: { width: 80 } }}>
            <Select placeholder="请选择格式" allowClear style={{ width: 180 }}>
              <Select.Option value="jpg">JPG</Select.Option>
              <Select.Option value="jpeg">JPEG</Select.Option>
              <Select.Option value="png">PNG</Select.Option>
              <Select.Option value="gif">GIF</Select.Option>
              <Select.Option value="webp">WEBP</Select.Option>
              <Select.Option value="bmp">BMP</Select.Option>
              <Select.Option value="svg">SVG</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="minWidth" label="最小宽度" labelCol={{ style: { width: 80 } }}>
            <InputNumber placeholder="最小宽度" style={{ width: 180 }} min={0} />
          </Form.Item>
          <Form.Item name="maxWidth" label="最大宽度" labelCol={{ style: { width: 80 } }}>
            <InputNumber placeholder="最大宽度" style={{ width: 180 }} min={0} />
          </Form.Item>
          <Form.Item name="minHeight" label="最小高度" labelCol={{ style: { width: 80 } }}>
            <InputNumber placeholder="最小高度" style={{ width: 180 }} min={0} />
          </Form.Item>
          <Form.Item name="maxHeight" label="最大高度" labelCol={{ style: { width: 80 } }}>
            <InputNumber placeholder="最大高度" style={{ width: 180 }} min={0} />
          </Form.Item>
          <Form.Item name="minSize" label="最小大小(KB)" labelCol={{ style: { width: 80 } }}>
            <InputNumber placeholder="最小大小" style={{ width: 180 }} min={0} />
          </Form.Item>
          <Form.Item name="maxSize" label="最大大小(KB)" labelCol={{ style: { width: 80 } }}>
            <InputNumber placeholder="最大大小" style={{ width: 180 }} min={0} />
          </Form.Item>
          <Form.Item name="startTime" label="上传开始" labelCol={{ style: { width: 80 } }}>
            <DatePicker placeholder="选择开始日期" style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="endTime" label="上传结束" labelCol={{ style: { width: 80 } }}>
            <DatePicker placeholder="选择结束日期" style={{ width: 180 }} />
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
          <PermissionWrapper permission="button:image:add">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              新增图片
            </Button>
          </PermissionWrapper>
        </div>

        <Table
          columns={columns}
          dataSource={images}
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

      {/* 编辑/新增图片对话框 */}
      <Modal
        title={isEditMode ? '编辑图片' : '新增图片'}
        open={editModalVisible}
        onOk={handleSave}
        onCancel={handleCancel}
        width={700}
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
            label="图片名称"
            rules={[{ required: true, message: '请输入图片名称' }]}
          >
            <Input placeholder="请输入图片名称" />
          </Form.Item>

          <Form.Item
            name="url"
            label="图片URL"
            rules={[{ required: true, message: '请上传图片或输入图片URL' }]}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload {...uploadProps} maxCount={1}>
                <Button icon={<UploadOutlined />}>上传图片</Button>
              </Upload>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.url !== currentValues.url}
              >
                {({ getFieldValue, setFieldValue }) => {
                  const currentUrl = getFieldValue('url') || ''
                  return (
                    <Input 
                      placeholder="或手动输入图片URL"
                      value={currentUrl}
                      onChange={(e) => {
                        const url = e.target.value
                        setFieldValue('url', url)
                        // 只要 URL 变化就触发获取元数据（不判断是否等于 editingImage?.url）
                        if (url && url.trim()) {
                          handleUrlChange(url)
                        }
                      }}
                    />
                  )
                }}
              </Form.Item>
            </Space>
          </Form.Item>

          {editForm.getFieldValue('url') && (
            <Form.Item label="图片预览">
              <AntImage
                src={editForm.getFieldValue('url')}
                alt="预览"
                width={200}
                style={{ borderRadius: 4 }}
              />
            </Form.Item>
          )}

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={3} placeholder="请输入图片描述" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
          >
            <Input placeholder="请输入分类" />
          </Form.Item>

          <Form.Item
            name="tags"
            label="标签"
          >
            <Input placeholder="请输入标签，多个标签用逗号分隔" />
          </Form.Item>

          <Form.Item
            name="width"
            label="宽度（像素）"
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder={imageMetadata?.width ? '自动获取' : '请输入宽度'}
              disabled={!!imageMetadata?.width}
            />
          </Form.Item>

          <Form.Item
            name="height"
            label="高度（像素）"
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder={imageMetadata?.height ? '自动获取' : '请输入高度'}
              disabled={!!imageMetadata?.height}
            />
          </Form.Item>

          <Form.Item
            name="size"
            label="文件大小（字节）"
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder={imageMetadata?.size ? '自动获取' : '请输入文件大小'}
              disabled={!!imageMetadata?.size}
            />
          </Form.Item>

          <Form.Item
            name="format"
            label="格式"
          >
            <Input 
              placeholder={imageMetadata?.format ? '自动获取' : '请输入图片格式，如：jpg, png, gif, webp'} 
              disabled={!!imageMetadata?.format}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ImageList



