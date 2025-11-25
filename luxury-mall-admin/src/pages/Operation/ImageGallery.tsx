import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Card,
  message,
  Image as AntImage,
  Popconfirm
} from 'antd'
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import axios from 'axios'
import { getFullImageUrl } from '../../utils/backendUrl'
import '../Product/ProductList.css'

interface UploadedImageFile {
  filename: string
  url: string
  size: number
  uploadTime: string
  updateTime: string
}

function ImageGallery() {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<UploadedImageFile[]>([])

  // 获取已上传的图片文件列表
  const fetchImages = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/upload/images')
      setImages(response.data.files || [])
    } catch (error: any) {
      message.error('获取图片列表失败：' + (error.message || '未知错误'))
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    fetchImages()
  }, [])

  // 删除图片文件
  const handleDelete = async (filename: string) => {
    try {
      await axios.delete(`/api/upload/images/${encodeURIComponent(filename)}`)
      message.success('删除成功')
      // 刷新列表
      fetchImages()
    } catch (error: any) {
      message.error('删除失败：' + (error.message || '未知错误'))
    }
  }

  // 批量删除
  const handleBatchDelete = async (selectedFilenames: string[]) => {
    try {
      await Promise.all(
        selectedFilenames.map(filename => 
          axios.delete(`/api/upload/images/${encodeURIComponent(filename)}`)
        )
      )
      message.success(`成功删除 ${selectedFilenames.length} 个文件`)
      // 刷新列表
      fetchImages()
    } catch (error: any) {
      message.error('批量删除失败：' + (error.message || '未知错误'))
    }
  }

  // 表格列
  const columns = [
    {
      title: '预览',
      dataIndex: 'url',
      key: 'preview',
      width: 120,
      render: (url: string) => (
        <AntImage
          src={getFullImageUrl(url)}
          alt="预览"
          width={100}
          height={100}
          style={{ objectFit: 'cover', borderRadius: 4 }}
        />
      )
    },
    {
      title: '文件名',
      dataIndex: 'filename',
      key: 'filename',
      ellipsis: true,
      width: 250
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
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (size: number) => {
        if (!size) return '-'
        if (size < 1024) return `${size} B`
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
        return `${(size / 1024 / 1024).toFixed(2)} MB`
      }
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      key: 'uploadTime',
      width: 180,
      render: (time: string) => time ? new Date(time).toLocaleString('zh-CN') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: UploadedImageFile) => (
        <Popconfirm
          title="确定要删除这个文件吗？"
          description="删除后无法恢复"
          onConfirm={() => handleDelete(record.filename)}
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
      )
    }
  ]

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])

  return (
    <>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>静态资源</h2>
          <Space>
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`确定要删除选中的 ${selectedRowKeys.length} 个文件吗？`}
                description="删除后无法恢复"
                onConfirm={() => {
                  handleBatchDelete(selectedRowKeys)
                  setSelectedRowKeys([])
                }}
                okText="确定"
                cancelText="取消"
              >
                <Button danger icon={<DeleteOutlined />}>
                  批量删除 ({selectedRowKeys.length})
                </Button>
              </Popconfirm>
            )}
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchImages}
            >
              刷新
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={images}
          rowKey="filename"
          loading={loading}
          className="product-list-table"
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as string[]),
            getCheckboxProps: (record) => ({
              name: record.filename
            })
          }}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个文件`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </>
  )
}

export default ImageGallery
