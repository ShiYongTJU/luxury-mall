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
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons'
import { imageApi } from '../../api/image'
import { Image, ImageQueryParams } from '../../types/image'
import type { ColumnsType } from 'antd/es/table'
import { getFullImageUrl } from '../../utils/backendUrl'

interface ImageSelectorProps {
  open: boolean
  onCancel: () => void
  onSelect: (imageUrl: string) => void
  title?: string
}

function ImageSelector({ open, onCancel, onSelect, title = '选择图片' }: ImageSelectorProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<Image[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  
  const queryParamsRef = useRef<ImageQueryParams>({})
  const isInitializedRef = useRef(false)
  const paginationRef = useRef(pagination)

  useEffect(() => {
    paginationRef.current = pagination
  }, [pagination])

  // 获取图片列表
  const fetchImages = async (
    searchParams?: ImageQueryParams,
    page?: number,
    pageSize?: number
  ) => {
    setLoading(true)
    try {
      if (searchParams !== undefined) {
        queryParamsRef.current = searchParams
      }
      
      const currentPage = page !== undefined ? page : paginationRef.current.current
      const currentPageSize = pageSize !== undefined ? pageSize : paginationRef.current.pageSize
      
      const queryParams: ImageQueryParams = {
        ...queryParamsRef.current,
        page: currentPage,
        pageSize: currentPageSize
      }
      
      const result = await imageApi.getImages(queryParams)
      
      setImages(result.images)
      setPagination({
        total: result.total,
        current: result.page,
        pageSize: result.pageSize
      })
      
      isInitializedRef.current = true
    } catch (error: any) {
      message.error('获取图片列表失败：' + (error.message || '未知错误'))
      setImages([])
      setPagination(prev => ({ ...prev, total: 0 }))
    } finally {
      setLoading(false)
    }
  }

  // 打开时加载数据
  useEffect(() => {
    if (open && !isInitializedRef.current) {
      fetchImages()
    }
  }, [open])

  // 分页变化
  useEffect(() => {
    if (open && isInitializedRef.current) {
      fetchImages(undefined, pagination.current, pagination.pageSize)
    }
  }, [pagination.current, pagination.pageSize, open])

  // 查询
  const handleSearch = () => {
    const values = form.getFieldsValue()
    const params: ImageQueryParams = {}
    
    if (values.name) params.name = values.name
    if (values.category) params.category = values.category
    if (values.tags) params.tags = values.tags
    if (values.format) params.format = values.format
    if (values.minWidth) params.minWidth = Number(values.minWidth)
    if (values.maxWidth) params.maxWidth = Number(values.maxWidth)
    if (values.minHeight) params.minHeight = Number(values.minHeight)
    if (values.maxHeight) params.maxHeight = Number(values.maxHeight)
    if (values.minSize) params.minSize = Number(values.minSize)
    if (values.maxSize) params.maxSize = Number(values.maxSize)
    // 注意：DatePicker 相关功能暂时移除，简化组件
    // if (values.startTime) params.startTime = values.startTime.format('YYYY-MM-DD')
    // if (values.endTime) params.endTime = values.endTime.format('YYYY-MM-DD')

    setPagination(prev => ({ ...prev, current: 1 }))
    fetchImages(params, 1, pagination.pageSize)
  }

  // 重置
  const handleReset = () => {
    form.resetFields()
    queryParamsRef.current = {}
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchImages({}, 1, pagination.pageSize)
  }

  // 表格分页变化
  const handleTableChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }))
  }

  // 选择图片
  const handleSelectImage = (image: Image) => {
    const fullUrl = getFullImageUrl(image.url)
    onSelect(fullUrl)
    message.success('已选择图片')
  }

  // 表格列
  const columns: ColumnsType<Image> = [
    {
      title: '预览',
      dataIndex: 'url',
      key: 'preview',
      width: 100,
      render: (url: string) => (
        <AntImage
          src={getFullImageUrl(url)}
          alt="预览"
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4 }}
        />
      )
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
      render: (url: string) => (
        <span style={{ fontSize: 12, color: '#666' }}>{url}</span>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100
    },
    {
      title: '尺寸',
      key: 'dimensions',
      width: 120,
      render: (_: any, record: Image) => {
        if (record.width && record.height) {
          return `${record.width} × ${record.height}`
        }
        return '-'
      }
    },
    {
      title: '格式',
      dataIndex: 'format',
      key: 'format',
      width: 80
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: Image) => (
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => handleSelectImage(record)}
        >
          选择
        </Button>
      )
    }
  ]

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1000}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Form.Item name="name" label="名称">
            <Input placeholder="请输入图片名称" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Input placeholder="请输入分类" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Input placeholder="请输入标签" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="format" label="格式">
            <Input placeholder="jpg/png/gif" style={{ width: 100 }} />
          </Form.Item>
        </Space>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
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
      </Form>

      <Table
        columns={columns}
        dataSource={images}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: handleTableChange,
          onShowSizeChange: handleTableChange
        }}
        scroll={{ x: 800 }}
      />
    </Modal>
  )
}

export default ImageSelector

