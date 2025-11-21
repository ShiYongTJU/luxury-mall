import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const apiClient = axios.create({
  baseURL: '/',
  timeout: 2000
})

const mock = new MockAdapter(apiClient, { delayResponse: 500 })

const mockProjects = [
  {
    id: 'nebula-dashboard',
    title: 'Nebula Dashboard · 云原生运维驾驶舱',
    cover:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    summary: '为 SRE 团队打造的一体化指标与告警平台，强调实时可观测性与智能告警联动。',
    description:
      '通过 Vue 3 组合式 API + ECharts 构建 40+ 数据组件，支撑千万级指标秒级刷新，并提供可拖拽仪表盘和多云资源联动视图。',
    tags: ['Vue 3', 'TypeScript', 'ECharts', 'WebSocket'],
    role: '前端负责人',
    timeline: '2024 · 企业级 SaaS',
    links: {
      demo: 'https://nebula.example.com',
      repo: 'https://github.com/example/nebula-dashboard'
    }
  },
  {
    id: 'aether-note',
    title: 'Aether Note · AI 协作知识库',
    cover:
      'https://images.unsplash.com/photo-1508830524289-0adcbe822b40?auto=format&fit=crop&w=1200&q=80',
    summary: '面向远程团队的轻量级文档协作工具，提供 AI 草稿与多端实时同步。',
    description:
      '利用 Vue 3 + Pinia + IndexedDB 实现离线优先编辑体验，并通过 Service Worker 进行智能缓存，三端一致性延迟小于 250ms。',
    tags: ['Vue 3', 'Pinia', 'IndexedDB', 'PWA'],
    role: '全栈开发',
    timeline: '2023 · 初创项目',
    links: {
      demo: 'https://aether.example.com',
      repo: 'https://github.com/example/aether-note'
    }
  },
  {
    id: 'orbit-lab',
    title: 'Orbit Lab · XR 交互式作品集',
    cover:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    summary: '强调沉浸式体验的创意作品集，支持 Web/XR 双端浏览与交互。',
    description:
      '基于 Three.js + VueUse 打造 3D 轨道交互，并引入可配置的主题系统与 SSR 级别的首屏优化， Lighthouse 评分 95+。',
    tags: ['Vue 3', 'Three.js', 'VueUse', 'Vite SSR'],
    role: '创意前端',
    timeline: '2022 · 个人实验',
    links: {
      demo: 'https://orbit.example.com',
      repo: 'https://github.com/example/orbit-lab'
    }
  }
]

mock.onGet('/api/projects').reply(200, {
  featured: mockProjects[0],
  projects: mockProjects
})

export const fetchProjects = () =>
  apiClient.get('/api/projects').then((response) => response.data)

export default {
  fetchProjects
}


