import { useState, useEffect, useRef } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {
  Layout,
  Card,
  Button,
  Space,
  message,
  Empty,
  Typography,
  Divider,
  Form,
  Input,
  InputNumber,
  ColorPicker,
  Modal,
  Table,
  Tag,
  Select,
  Image as AntImage
} from 'antd'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  DeleteOutlined,
  DragOutlined,
  SettingOutlined,
  DatabaseOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { pageApi } from '../../api/page'
import { Page } from '../../types/page'
import { datasourceApi } from '../../api/datasource'
import { 
  DataSourceItem, 
  DataSourceType, 
  DataSourceQueryParams,
  CarouselItemData,
  SeckillData,
  GroupbuyData,
  ProductListData,
  GuessYouLikeData
} from '../../types/datasource'
import { Product } from '../../types/product'
import { getFullImageUrl } from '../../utils/backendUrl'
import type { ColumnsType } from 'antd/es/table'

const { Header, Content, Sider } = Layout
const { Title, Text } = Typography

// 组件类型定义
type ComponentType = 'carousel' | 'seckill' | 'groupbuy' | 'productList' | 'guessYouLike'

interface PageComponent {
  id: string
  type: ComponentType
  config: any // 样式配置
  dataSource?: string // 数据源ID
  sortOrder: number
}

// 组件配置
const COMPONENT_CONFIGS: Record<ComponentType, { name: string; icon: string; description: string }> = {
  carousel: { name: '轮播图', icon: '🖼️', description: '展示轮播图片' },
  seckill: { name: '秒杀', icon: '⚡', description: '限时秒杀活动' },
  groupbuy: { name: '团购', icon: '👥', description: '团购优惠活动' },
  productList: { name: '商品列表', icon: '📦', description: '商品列表展示' },
  guessYouLike: { name: '猜你喜欢', icon: '❤️', description: '个性化推荐' }
}

// 左侧组件列表项
function ComponentItem({ type }: { type: ComponentType }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  const config = COMPONENT_CONFIGS[type]

  return (
    <div
      ref={drag}
      style={{
        padding: '12px',
        marginBottom: '8px',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
        cursor: 'move',
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: '#fff',
        transition: 'all 0.2s'
      }}
    >
      <Space>
        <span style={{ fontSize: '20px' }}>{config.icon}</span>
        <div>
          <div style={{ fontWeight: 500 }}>{config.name}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{config.description}</div>
        </div>
      </Space>
    </div>
  )
}

// 预览区域的组件项
function PreviewComponentItem({
  component,
  index,
  moveComponent,
  onSelect,
  onDelete,
  isSelected
}: {
  component: PageComponent
  index: number
  moveComponent: (dragIndex: number, hoverIndex: number) => void
  onSelect: () => void
  onDelete: () => void
  isSelected: boolean
}) {
  const [{ isDragging }, drag] = useDrag({
    type: 'preview-component',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  const [, drop] = useDrop({
    accept: 'preview-component',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveComponent(item.index, index)
        item.index = index
      }
    }
  })

  const config = COMPONENT_CONFIGS[component.type]

  return (
    <div
      ref={(node) => drag(drop(node))}
      onClick={onSelect}
      style={{
        padding: '16px',
        marginBottom: '12px',
        border: `2px solid ${isSelected ? '#1890ff' : '#d9d9d9'}`,
        borderRadius: '4px',
        cursor: 'move',
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isSelected ? '#e6f7ff' : '#fff',
        transition: 'all 0.2s',
        position: 'relative'
      }}
    >
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <DragOutlined style={{ color: '#999' }} />
          <span style={{ fontSize: '20px' }}>{config.icon}</span>
          <div>
            <div style={{ fontWeight: 500 }}>{config.name}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>排序: {component.sortOrder}</div>
          </div>
        </Space>
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          删除
        </Button>
      </Space>
    </div>
  )
}

// 数据源选择器弹窗
function DataSourceSelector({
  open,
  type,
  currentDataSourceId,
  onSelect,
  onCancel
}: {
  open: boolean
  type: ComponentType
  currentDataSourceId?: string
  onSelect: (dataSourceId: string) => void
  onCancel: () => void
}) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [dataSources, setDataSources] = useState<DataSourceItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const queryParamsRef = useRef<DataSourceQueryParams>({})

  // 组件类型到数据源类型的映射
  const componentToDataSourceType: Record<ComponentType, DataSourceType> = {
    carousel: 'carousel',
    seckill: 'seckill',
    groupbuy: 'groupbuy',
    productList: 'productList',
    guessYouLike: 'guessYouLike'
  }

  const dataSourceType = componentToDataSourceType[type]

  // 获取数据源列表
  const fetchDataSources = async (page: number = 1, pageSize: number = 10) => {
    try {
      setLoading(true)
      const params: DataSourceQueryParams = {
        ...queryParamsRef.current,
        page,
        pageSize
      }
      const result = await datasourceApi.getItems(dataSourceType, params)
      setDataSources(result.items)
      setPagination({
        current: result.page,
        pageSize: result.pageSize,
        total: result.total
      })
    } catch (error: any) {
      message.error('获取数据源列表失败：' + (error.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      form.resetFields()
      queryParamsRef.current = {}
      fetchDataSources(1, 10)
    }
  }, [open, type])

  useEffect(() => {
    if (open && currentDataSourceId) {
      setSelectedRowKeys([currentDataSourceId])
    } else if (open) {
      setSelectedRowKeys([])
    }
  }, [open, currentDataSourceId])

  // 查询
  const handleSearch = () => {
    const values = form.getFieldsValue()
    queryParamsRef.current = {
      name: values.name?.trim() || undefined,
      isEnabled: values.isEnabled !== undefined ? values.isEnabled : undefined
    }
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchDataSources(1, pagination.pageSize)
  }

  // 重置
  const handleReset = () => {
    form.resetFields()
    queryParamsRef.current = {}
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchDataSources(1, pagination.pageSize)
  }

  // 根据类型生成列定义
  const getColumns = (): ColumnsType<DataSourceItem> => {
    const baseColumns: ColumnsType<DataSourceItem> = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        width: 200
      }
    ]

    // 根据不同类型添加特定列
    if (type === 'carousel') {
      baseColumns.push({
        title: '轮播图项',
        key: 'items',
        width: 300,
        render: (_: any, record: DataSourceItem) => {
          try {
            const data = JSON.parse(record.data) as CarouselItemData[]
            if (!data || data.length === 0) return '-'
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
      })
    } else if (type === 'seckill') {
      baseColumns.push(
        {
          title: '商品数量',
          key: 'productCount',
          width: 100,
          render: (_: any, record: DataSourceItem) => {
            try {
              const data = JSON.parse(record.data) as SeckillData
              return data.products?.length || 0
            } catch (e) {
              return 0
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
              const data = JSON.parse(record.data) as SeckillData
              if (!data.products || data.products.length === 0) return '-'
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
          title: '结束时间',
          key: 'endTime',
          width: 180,
          render: (_: any, record: DataSourceItem) => {
            try {
              const data = JSON.parse(record.data) as SeckillData
              return data.endTime ? new Date(data.endTime).toLocaleString('zh-CN') : '-'
            } catch (e) {
              return '-'
            }
          }
        }
      )
    } else if (type === 'groupbuy') {
      baseColumns.push(
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
          title: '商品列表',
          key: 'products',
          width: 300,
          ellipsis: true,
          render: (_: any, record: DataSourceItem) => {
            try {
              const data = JSON.parse(record.data) as GroupbuyData
              if (!data.products || data.products.length === 0) return '-'
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
        }
      )
    } else if (type === 'productList') {
      baseColumns.push(
        {
          title: '分类',
          key: 'category',
          width: 150,
          render: (_: any, record: DataSourceItem) => {
            try {
              const data = JSON.parse(record.data) as ProductListData
              return data.category || '-'
            } catch (e) {
              return '-'
            }
          }
        },
        {
          title: '商品数量',
          key: 'productCount',
          width: 100,
          render: (_: any, record: DataSourceItem) => {
            try {
              const data = JSON.parse(record.data) as ProductListData
              return data.products?.length || 0
            } catch (e) {
              return 0
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
              const data = JSON.parse(record.data) as ProductListData
              if (!data.products || data.products.length === 0) return '-'
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
        }
      )
    } else if (type === 'guessYouLike') {
      baseColumns.push(
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
          title: '商品列表',
          key: 'products',
          width: 300,
          ellipsis: true,
          render: (_: any, record: DataSourceItem) => {
            try {
              const data = JSON.parse(record.data) as GuessYouLikeData
              if (!data.products || data.products.length === 0) return '-'
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
        }
      )
    }

    // 添加通用列
    baseColumns.push(
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
      }
    )

    return baseColumns
  }

  const handleOk = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择一个数据源')
      return
    }
    onSelect(selectedRowKeys[0])
  }

  const handleTableChange = (page: number, pageSize: number) => {
    fetchDataSources(page, pageSize)
  }

  return (
    <Modal
      title={`选择${COMPONENT_CONFIGS[type].name}数据源`}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={1000}
      okText="确定"
      cancelText="取消"
      style={{ top: 20 }}
      bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}
    >
      <Card size="small" style={{ marginBottom: 16 }}>
        {/* 查询表单 */}
        <Form
          form={form}
          layout="inline"
          style={{ marginBottom: 0 }}
        >
          <Form.Item name="name" label="名称">
            <Input placeholder="请输入名称" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="isEnabled" label="状态">
            <Select placeholder="请选择状态" allowClear style={{ width: 150 }}>
              <Select.Option value={true}>启用</Select.Option>
              <Select.Option value={false}>禁用</Select.Option>
            </Select>
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
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Table
        columns={getColumns()}
        dataSource={dataSources}
        rowKey="id"
        loading={loading}
        rowSelection={{
          type: 'radio',
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as string[])
        }}
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
    </Modal>
  )
}

// 组件配置面板
function ComponentConfigPanel({
  selectedComponent,
  onUpdate
}: {
  selectedComponent: PageComponent | null
  onUpdate: (updates: { config?: any; dataSource?: string }) => void
}) {
  const [form] = Form.useForm()
  const [dataSourceSelectorVisible, setDataSourceSelectorVisible] = useState(false)
  const [currentDataSource, setCurrentDataSource] = useState<DataSourceItem | null>(null)

  useEffect(() => {
    if (selectedComponent) {
      // 初始化表单值
      // 处理 backgroundColor：确保是字符串格式
      let bgColor = '#ffffff'
      if (selectedComponent.config?.backgroundColor) {
        const bg = selectedComponent.config.backgroundColor
        if (typeof bg === 'string') {
          bgColor = bg
        } else if (typeof bg === 'object' && bg !== null) {
          // 如果是对象格式，转换为字符串
          if (bg.metaColor && bg.metaColor.isValid) {
            const meta = bg.metaColor
            const r = Math.round(meta.r).toString(16).padStart(2, '0')
            const g = Math.round(meta.g).toString(16).padStart(2, '0')
            const b = Math.round(meta.b).toString(16).padStart(2, '0')
            bgColor = `#${r}${g}${b}`
          }
        }
      }
      
      form.setFieldsValue({
        title: selectedComponent.config?.title || '',
        backgroundColor: bgColor,
        padding: selectedComponent.config?.padding || 0,
        margin: selectedComponent.config?.margin || 0
      })

      // 如果有数据源ID，获取数据源信息
      if (selectedComponent.dataSource) {
        loadDataSource(selectedComponent.dataSource)
      } else {
        setCurrentDataSource(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedComponent?.id, selectedComponent?.dataSource])

  // 加载数据源信息
  const loadDataSource = async (dataSourceId: string) => {
    if (!selectedComponent) return
    
    try {
      const componentToDataSourceType: Record<ComponentType, DataSourceType> = {
        carousel: 'carousel',
        seckill: 'seckill',
        groupbuy: 'groupbuy',
        productList: 'productList',
        guessYouLike: 'guessYouLike'
      }
      const dataSourceType = componentToDataSourceType[selectedComponent.type]
      const dataSource = await datasourceApi.getItemById(dataSourceType, dataSourceId)
      setCurrentDataSource(dataSource)
    } catch (error: any) {
      message.error('获取数据源信息失败：' + (error.message || '未知错误'))
      setCurrentDataSource(null)
    }
  }

  // 处理样式配置变化
  const handleStyleChange = () => {
    const values = form.getFieldsValue()
    
    // 处理 backgroundColor：如果是 ColorPicker 对象，转换为十六进制字符串
    if (values.backgroundColor) {
      if (typeof values.backgroundColor === 'object' && values.backgroundColor !== null) {
        // ColorPicker 返回的对象格式，需要转换为字符串
        if (values.backgroundColor.toHexString) {
          values.backgroundColor = values.backgroundColor.toHexString()
        } else if (values.backgroundColor.metaColor) {
          // 如果是 metaColor 格式，转换为 hex
          const meta = values.backgroundColor.metaColor
          if (meta.isValid) {
            const r = Math.round(meta.r).toString(16).padStart(2, '0')
            const g = Math.round(meta.g).toString(16).padStart(2, '0')
            const b = Math.round(meta.b).toString(16).padStart(2, '0')
            values.backgroundColor = `#${r}${g}${b}`
          } else {
            values.backgroundColor = '#ffffff'
          }
        } else {
          // 其他对象格式，尝试转换为字符串
          values.backgroundColor = '#ffffff'
        }
      }
    }
    
    onUpdate({ config: values })
  }

  // 选择数据源
  const handleSelectDataSource = (dataSourceId: string) => {
    onUpdate({ dataSource: dataSourceId })
    setDataSourceSelectorVisible(false)
    loadDataSource(dataSourceId)
    message.success('数据源已配置')
  }

  // 清除数据源
  const handleClearDataSource = () => {
    onUpdate({ dataSource: undefined })
    setCurrentDataSource(null)
    message.success('已清除数据源')
  }

  if (!selectedComponent) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
        <Empty description="请选择组件进行配置" />
      </div>
    )
  }

  const config = COMPONENT_CONFIGS[selectedComponent.type]

  return (
    <div style={{ padding: '24px', height: '100%', overflow: 'auto' }}>
      <Title level={4}>{config.name} 配置</Title>
      <Divider />
      
      {/* 样式配置 */}
      <div>
        <Space style={{ marginBottom: 16 }}>
          <SettingOutlined />
          <Text strong>样式配置</Text>
        </Space>
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleStyleChange}
        >
          <Form.Item name="title" label="标题">
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item name="backgroundColor" label="背景颜色">
            <ColorPicker showText format="hex" />
          </Form.Item>
          <Form.Item name="padding" label="内边距 (px)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="margin" label="外边距 (px)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </div>

      <Divider />

      {/* 数据源配置 */}
      <div>
        <Space style={{ marginBottom: 16 }}>
          <DatabaseOutlined />
          <Text strong>数据源配置</Text>
        </Space>
        <div>
          {currentDataSource ? (
            <Card size="small" style={{ marginBottom: 12 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>已选择：</Text>
                  <Text>{currentDataSource.name}</Text>
                </div>
                <Button
                  type="link"
                  size="small"
                  onClick={() => setDataSourceSelectorVisible(true)}
                >
                  更换数据源
                </Button>
                <Button
                  type="link"
                  size="small"
                  danger
                  onClick={handleClearDataSource}
                >
                  清除数据源
                </Button>
              </Space>
            </Card>
          ) : (
            <Button
              type="dashed"
              block
              onClick={() => setDataSourceSelectorVisible(true)}
            >
              配置数据源
            </Button>
          )}
        </div>
      </div>

      {/* 数据源选择器 */}
      <DataSourceSelector
        open={dataSourceSelectorVisible}
        type={selectedComponent.type}
        currentDataSourceId={selectedComponent.dataSource}
        onSelect={handleSelectDataSource}
        onCancel={() => setDataSourceSelectorVisible(false)}
      />
    </div>
  )
}

function PageDesignerContent() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [page, setPage] = useState<Page | null>(null)
  const [components, setComponents] = useState<PageComponent[]>([])
  const [selectedComponent, setSelectedComponent] = useState<PageComponent | null>(null)
  const [loading, setLoading] = useState(false)

  // 加载页面数据
  useEffect(() => {
    if (!id) return

    const loadPage = async () => {
      try {
        setLoading(true)
        const pageData = await pageApi.getPageById(id)
        setPage(pageData)

        // 解析数据源中的组件
        if (pageData.dataSource) {
          try {
            const dataSource = JSON.parse(pageData.dataSource)
            if (dataSource.components && Array.isArray(dataSource.components)) {
              setComponents(dataSource.components)
            }
          } catch (e) {
            console.error('解析数据源失败:', e)
          }
        }
      } catch (error: any) {
        message.error('加载页面失败：' + (error.message || '未知错误'))
        navigate('/admin/operation/page')
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [id, navigate])

  // 添加组件
  const handleAddComponent = (type: ComponentType) => {
    const newComponent: PageComponent = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      type,
      config: {},
      dataSource: undefined,
      sortOrder: components.length + 1
    }
    setComponents([...components, newComponent])
    message.success(`已添加 ${COMPONENT_CONFIGS[type].name}`)
  }

  // 移动组件
  const moveComponent = (dragIndex: number, hoverIndex: number) => {
    const newComponents = [...components]
    const [removed] = newComponents.splice(dragIndex, 1)
    newComponents.splice(hoverIndex, 0, removed)
    
    // 更新排序
    newComponents.forEach((comp, index) => {
      comp.sortOrder = index + 1
    })
    
    setComponents(newComponents)
  }

  // 删除组件
  const handleDeleteComponent = (componentId: string) => {
    setComponents(components.filter(comp => comp.id !== componentId))
    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null)
    }
    message.success('已删除组件')
  }

  // 从左侧拖入组件
  const handleDropComponent = (item: { type: ComponentType }) => {
    handleAddComponent(item.type)
  }

  // 保存
  const handleSave = async () => {
    if (!id || !page) return

    try {
      setLoading(true)
      const dataSource = JSON.stringify({ components })
      await pageApi.updatePage(id, { dataSource })
      message.success('保存成功')
    } catch (error: any) {
      message.error('保存失败：' + (error.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  // 预览区域
  const [{ isOver }, drop] = useDrop({
    accept: 'component',
    drop: handleDropComponent,
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  })

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/operation/page')}
          >
            返回
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            {page?.pageType === 'homepage' ? '首页' : '分类页'}装修
          </Title>
        </Space>
        <Space style={{ float: 'right' }}>
          <Button onClick={handleSave} type="primary" icon={<SaveOutlined />} loading={loading}>
            保存
          </Button>
        </Space>
      </Header>
      <Layout>
        {/* 左侧组件列表 */}
        <Sider width={250} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
          <div style={{ padding: '16px' }}>
            <Title level={5}>组件库</Title>
            <Divider style={{ margin: '12px 0' }} />
            {Object.keys(COMPONENT_CONFIGS).map((type) => (
              <ComponentItem key={type} type={type as ComponentType} />
            ))}
          </div>
        </Sider>

        {/* 中间预览区域 */}
        <Content style={{ padding: '24px', overflow: 'auto', background: '#f5f5f5' }}>
          <Card
            ref={drop}
            title="预览区域"
            style={{
              minHeight: '600px',
              border: isOver ? '2px dashed #1890ff' : '1px solid #d9d9d9',
              backgroundColor: isOver ? '#e6f7ff' : '#fff'
            }}
          >
            {components.length === 0 ? (
              <Empty description="从左侧拖入组件开始装修" />
            ) : (
              components.map((component, index) => (
                <PreviewComponentItem
                  key={component.id}
                  component={component}
                  index={index}
                  moveComponent={moveComponent}
                  onSelect={() => setSelectedComponent(component)}
                  onDelete={() => handleDeleteComponent(component.id)}
                  isSelected={selectedComponent?.id === component.id}
                />
              ))
            )}
          </Card>
        </Content>

        {/* 右侧配置面板 */}
        <Sider width={300} style={{ background: '#fff', borderLeft: '1px solid #f0f0f0' }}>
          <ComponentConfigPanel
            selectedComponent={selectedComponent}
            onUpdate={(updates) => {
              if (selectedComponent) {
                const updatedComponent = {
                  ...selectedComponent,
                  ...(updates.config !== undefined && { config: updates.config }),
                  ...(updates.dataSource !== undefined && { dataSource: updates.dataSource })
                }
                const newComponents = components.map(comp =>
                  comp.id === selectedComponent.id
                    ? updatedComponent
                    : comp
                )
                setComponents(newComponents)
                setSelectedComponent(updatedComponent)
              }
            }}
          />
        </Sider>
      </Layout>
    </Layout>
  )
}

function PageDesigner() {
  return (
    <DndProvider backend={HTML5Backend}>
      <PageDesignerContent />
    </DndProvider>
  )
}

export default PageDesigner

