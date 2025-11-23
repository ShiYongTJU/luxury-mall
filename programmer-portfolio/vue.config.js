const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pages: {
    index: {
      entry: 'src/main.js',
      title: '全栈开发作品集 - 从设计到部署的完整解决方案'
    }
  }
})
