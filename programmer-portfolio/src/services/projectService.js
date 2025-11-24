import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const apiClient = axios.create({
  baseURL: '/',
  timeout: 2000
})

const mock = new MockAdapter(apiClient, { delayResponse: 500 })

const mockProjects = [
  {
    id: 'luxury-mall-admin',
    title: 'Luxury Mall · 管理后台系统',
    cover:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    summary: '基于 React + TypeScript + Ant Design 构建的企业级管理后台，提供页面可视化装修、数据源管理、商品管理等核心功能。',
    description:
      '采用低代码设计理念，实现页面可视化装修功能，支持拖拽式组件配置、实时预览、样式自定义。集成 React DnD 实现拖拽排序，支持轮播图、秒杀、团购、商品列表等多种业务组件。提供完整的数据源管理系统，支持商品、图片、静态资源统一管理。采用多级菜单导航、权限控制、响应式布局，使用 PostgreSQL 数据库实现数据持久化，支持 Docker 容器化部署。',
    tags: ['React', 'TypeScript', 'Ant Design', 'React DnD', '低代码', '可视化装修', 'PostgreSQL', 'Docker'],
    role: '全栈开发',
    timeline: '2024 · 企业级后台系统',
    links: {
      demo: 'http://1.15.93.186:80',
      repo: 'https://gitee.com/shikii/luxury-mall'
    }
  },
  {
    id: 'luxury-mall-frontend',
    title: 'Luxury Mall · 奢侈品商城前端',
    cover:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    summary: '基于 React + TypeScript 构建的现代化电商前端应用，提供完整的购物流程和用户体验。',
    description:
      '采用 React Hooks、Context API 进行状态管理，实现商品浏览、购物车、订单管理、地址管理等核心功能。支持深色模式、响应式设计，使用 Vite 构建工具优化开发体验和构建性能。',
    tags: ['React', 'TypeScript', 'Vite', 'Context API', '深色模式'],
    role: '前端开发',
    timeline: '2024 · 电商项目',
    links: {
      demo: 'http://1.15.93.186:80',
      repo: 'https://gitee.com/shikii/luxury-mall'
    }
  },
  {
    id: 'luxury-mall-backend',
    title: 'Luxury Mall · 奢侈品商城后端',
    cover:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    summary: '基于 Express + TypeScript + PostgreSQL 构建的 RESTful API 服务，提供完整的电商后端功能。',
    description:
      '采用 Express 框架构建 RESTful API，使用 TypeScript 保证类型安全，PostgreSQL 存储数据。实现用户认证、商品管理、订单处理、地址管理等核心业务逻辑，支持 JWT 认证和数据库持久化。',
    tags: ['Express', 'TypeScript', 'PostgreSQL', 'JWT', 'RESTful API'],
    role: '后端开发',
    timeline: '2024 · 电商项目',
    links: {
      demo: 'http://1.15.93.186:80',
      repo: 'https://gitee.com/shikii/luxury-mall'
    }
  },
  {
    id: 'jenkins-ci-cd',
    title: 'Jenkins CI/CD · 持续集成部署系统',
    cover:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    summary: '基于 Jenkins Pipeline 构建的自动化 CI/CD 流程，实现代码构建、测试、打包和部署的完整自动化。',
    description:
      '使用 Jenkins Pipeline 编写 Groovy 脚本，实现多项目并行构建、Docker 镜像构建、自动化测试、代码质量检查等功能。支持多环境部署（开发/生产），集成 Docker Compose 进行容器编排，实现一键部署和回滚。',
    tags: ['Jenkins', 'CI/CD', 'Docker', 'Pipeline', '自动化部署'],
    role: 'DevOps 工程师',
    timeline: '2024 · 基础设施',
    links: {
      demo: 'http://1.15.93.186:8080/jenkins',
      repo: 'https://gitee.com/shikii/luxury-mall'
    }
  },
]

mock.onGet('/api/projects').reply(200, {
  featured: [mockProjects[0], mockProjects[1]], // 将前两个项目设为重点案例
  projects: mockProjects
})

export const fetchProjects = () =>
  apiClient.get('/api/projects').then((response) => response.data)

export default {
  fetchProjects
}


