<template>
  <div class="app-shell">
    <header class="hero">
      <p class="eyebrow">PROGRAMMER · PORTFOLIO</p>
      <h1>以工匠精神迭代的高质项目</h1>
      <p class="subtitle">
        汇总近期交付的重点产品案例，涵盖云原生监控、AI 协作与 XR 体验。数据通过本地 Mock
        模拟接口，使用 axios 异步获取，真实还原接口交互流程。
      </p>
      <button class="ghost-btn" :disabled="loading" @click="loadProjects">
        {{ loading ? '正在刷新...' : '重新获取数据' }}
      </button>
    </header>

    <section v-if="loading" class="state-card">
      <span class="spinner" aria-hidden="true" />
      <span>努力加载作品集中...</span>
    </section>

    <section v-else-if="error" class="state-card error">
      <p>{{ error }}</p>
      <button class="solid-btn" @click="loadProjects">重试加载</button>
    </section>

    <section v-else class="content-area">
      <article v-if="featuredProject" class="feature-card">
        <div class="feature-cover">
          <img :src="featuredProject.cover" :alt="featuredProject.title" loading="lazy" />
          <span class="badge">重点案例</span>
        </div>
        <div class="feature-body">
          <p class="timeline">{{ featuredProject.timeline }}</p>
          <h2>{{ featuredProject.title }}</h2>
          <p class="summary">{{ featuredProject.summary }}</p>
          <p class="description">{{ featuredProject.description }}</p>
          <ul class="tag-list">
            <li v-for="tag in featuredProject.tags" :key="tag">{{ tag }}</li>
          </ul>
          <div class="feature-meta">
            <div>
              <p class="meta-label">角色定位</p>
              <p class="meta-value">{{ featuredProject.role }}</p>
            </div>
            <div class="feature-links">
              <a :href="featuredProject.links.demo" target="_blank" rel="noopener noreferrer">
                在线演示
              </a>
              <a :href="featuredProject.links.repo" target="_blank" rel="noopener noreferrer">
                查看代码
              </a>
            </div>
          </div>
        </div>
      </article>

      <div class="grid">
        <article v-for="project in gridProjects" :key="project.id" class="card">
          <div class="card-media">
            <img :src="project.cover" :alt="project.title" loading="lazy" />
            <span class="badge soft">作品</span>
          </div>
          <div class="card-body">
            <p class="timeline">{{ project.timeline }}</p>
            <h3>{{ project.title }}</h3>
            <p class="summary">{{ project.summary }}</p>
            <p class="description">{{ project.description }}</p>
          </div>
          <footer class="card-footer">
            <ul class="tag-list compact">
              <li v-for="tag in project.tags" :key="tag">{{ tag }}</li>
            </ul>
            <div class="feature-links">
              <a :href="project.links.demo" target="_blank" rel="noopener noreferrer">示例</a>
              <a :href="project.links.repo" target="_blank" rel="noopener noreferrer">仓库</a>
            </div>
          </footer>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchProjects } from './services/projectService'

const projects = ref([])
const featuredProject = ref(null)
const loading = ref(true)
const error = ref('')

const loadProjects = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await fetchProjects()
    projects.value = data.projects
    featuredProject.value = data.featured
  } catch (err) {
    error.value = '获取作品数据失败，请稍后重试。'
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(err)
    }
  } finally {
    loading.value = false
  }
}

const gridProjects = computed(() =>
  projects.value.filter((item) => item.id !== featuredProject.value?.id)
)

onMounted(loadProjects)
</script>

<style scoped>
:global(body) {
  margin: 0;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', system-ui, -apple-system, BlinkMacSystemFont,
    'Segoe UI', sans-serif;
  background: #0f172a;
  color: #e2e8f0;
}

.app-shell {
  min-height: 100vh;
  padding: 48px 24px 64px;
  max-width: 1080px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  margin-bottom: 48px;
}

.eyebrow {
  letter-spacing: 0.4em;
  font-size: 12px;
  color: #7dd3fc;
  margin-bottom: 12px;
}

.hero h1 {
  font-size: clamp(32px, 5vw, 48px);
  margin: 0 0 16px;
  color: #f8fafc;
}

.subtitle {
  color: #94a3b8;
  max-width: 720px;
  margin: 0 auto 24px;
  line-height: 1.8;
}

.ghost-btn,
.solid-btn {
  border: 1px solid #38bdf8;
  background: transparent;
  color: #e0f2fe;
  padding: 10px 22px;
  border-radius: 999px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ghost-btn:hover:not(:disabled),
.solid-btn:hover:not(:disabled) {
  background: rgba(56, 189, 248, 0.2);
}

.ghost-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.solid-btn {
  background: #38bdf8;
  color: #0f172a;
  border: none;
}

.state-card {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 20px;
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.state-card.error {
  border-color: rgba(248, 113, 113, 0.4);
  color: #fecaca;
  flex-direction: column;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(226, 232, 240, 0.2);
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.content-area {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.feature-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  background: linear-gradient(135deg, rgba(30, 64, 175, 0.35), rgba(8, 47, 73, 0.8));
  border-radius: 32px;
  border: 1px solid rgba(59, 130, 246, 0.4);
  padding: 32px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.6);
}

.feature-cover {
  position: relative;
  border-radius: 28px;
  overflow: hidden;
  min-height: 260px;
}

.feature-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.badge {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(56, 189, 248, 0.9);
  color: #0f172a;
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.badge.soft {
  background: rgba(15, 23, 42, 0.75);
  color: #bae6fd;
  border: 1px solid rgba(148, 163, 184, 0.4);
  position: absolute;
  top: 16px;
  left: 16px;
}

.feature-body h2 {
  margin: 8px 0 16px;
  font-size: 28px;
  color: #f8fafc;
}

.summary {
  color: #cbd5f5;
  font-size: 16px;
  line-height: 1.7;
}

.description {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.8;
  margin-top: 12px;
}

.tag-list {
  list-style: none;
  padding: 0;
  margin: 20px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-list li {
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
  font-size: 13px;
}

.tag-list.compact li {
  font-size: 12px;
}

.feature-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.meta-label {
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 12px;
  margin-bottom: 6px;
}

.meta-value {
  font-size: 18px;
  color: #f8fafc;
}

.feature-links {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.feature-links a {
  color: #38bdf8;
  text-decoration: none;
  font-weight: 600;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.card {
  background: rgba(15, 23, 42, 0.7);
  border-radius: 24px;
  border: 1px solid rgba(51, 65, 85, 0.7);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 420px;
}

.card-media {
  position: relative;
  height: 180px;
}

.card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-body {
  padding: 20px 24px 16px;
  flex: 1;
}

.card-body h3 {
  margin: 8px 0 12px;
  font-size: 20px;
}

.card-footer {
  padding: 16px 24px 24px;
  border-top: 1px solid rgba(51, 65, 85, 0.8);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline {
  color: #7dd3fc;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .app-shell {
    padding: 32px 16px 48px;
  }

  .feature-card {
    padding: 24px;
  }

  .card-footer {
    align-items: flex-start;
  }
}
</style>
