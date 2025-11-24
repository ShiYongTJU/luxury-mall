import { useState, useEffect } from 'react'
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
  Divider
} from 'antd'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  DeleteOutlined,
  DragOutlined
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { pageApi } from '../../api/page'
import { Page } from '../../types/page'

const { Header, Content, Sider } = Layout
const { Title, Text } = Typography

// 组件类型定义
type ComponentType = 'carousel' | 'seckill' | 'groupbuy' | 'productList' | 'guessYouLike'

interface PageComponent {
  id: string
  type: ComponentType
  config: any
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

// 组件配置面板
function ComponentConfigPanel({
  selectedComponent,
  onUpdate
}: {
  selectedComponent: PageComponent | null
  onUpdate: (config: any) => void
}) {
  if (!selectedComponent) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
        <Empty description="请选择组件进行配置" />
      </div>
    )
  }

  const config = COMPONENT_CONFIGS[selectedComponent.type]

  return (
    <div style={{ padding: '24px' }}>
      <Title level={4}>{config.name} 配置</Title>
      <Divider />
      <div>
        <Text type="secondary">组件类型: {selectedComponent.type}</Text>
        <br />
        <Text type="secondary">组件ID: {selectedComponent.id}</Text>
        <br />
        <Text type="secondary">排序: {selectedComponent.sortOrder}</Text>
      </div>
      <Divider />
      <div>
        <Text>配置项开发中...</Text>
        <br />
        <Text type="secondary">这里将显示 {config.name} 的具体配置选项</Text>
      </div>
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
            onUpdate={(config) => {
              if (selectedComponent) {
                const newComponents = components.map(comp =>
                  comp.id === selectedComponent.id
                    ? { ...comp, config }
                    : comp
                )
                setComponents(newComponents)
                setSelectedComponent({ ...selectedComponent, config })
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

