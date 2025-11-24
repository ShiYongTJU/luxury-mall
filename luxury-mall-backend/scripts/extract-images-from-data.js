/**
 * 从 exported-data.json 中提取所有图片 URL 并生成 unsplash-images.json
 */

const fs = require('fs');
const path = require('path');

// 读取 exported-data.json
const dataPath = path.join(__dirname, '../data/exported-data.json');
console.log('读取文件:', dataPath);

const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// 用于存储所有唯一的图片 URL
const imageUrlSet = new Set();
const imageMap = new Map(); // 存储图片 URL 到商品信息的映射

// 分类映射
const categoryMap = {
  'bags': '手袋',
  'watches': '手表',
  'jewelry': '珠宝',
  'shoes': '鞋履',
  'perfume': '香水',
  'accessories': '配饰',
  'clothing': '服装'
};

// 从商品中提取图片
if (data.products && Array.isArray(data.products)) {
  data.products.forEach(product => {
    // 提取主图
    if (product.image) {
      imageUrlSet.add(product.image);
      if (!imageMap.has(product.image)) {
        imageMap.set(product.image, {
          url: product.image,
          category: categoryMap[product.category] || product.category || '其他',
          name: product.name || '商品图片',
          description: product.description || ''
        });
      }
    }
    
    // 提取图片列表
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(imgUrl => {
        imageUrlSet.add(imgUrl);
        if (!imageMap.has(imgUrl)) {
          imageMap.set(imgUrl, {
            url: imgUrl,
            category: categoryMap[product.category] || product.category || '其他',
            name: `${product.name || '商品'} - 详情图`,
            description: product.description || ''
          });
        }
      });
    }
  });
}

// 从首页数据中提取图片
if (data.homepage) {
  // 轮播图
  if (data.homepage.carousel && Array.isArray(data.homepage.carousel)) {
    data.homepage.carousel.forEach(item => {
      if (item.image) {
        imageUrlSet.add(item.image);
        if (!imageMap.has(item.image)) {
          imageMap.set(item.image, {
            url: item.image,
            category: '轮播图',
            name: item.title || '轮播图',
            description: item.description || ''
          });
        }
      }
    });
  }
  
  // 商品列表
  if (data.homepage.productList && Array.isArray(data.homepage.productList)) {
    data.homepage.productList.forEach(product => {
      if (product.image) {
        imageUrlSet.add(product.image);
        if (!imageMap.has(product.image)) {
          imageMap.set(product.image, {
            url: product.image,
            category: categoryMap[product.category] || product.category || '其他',
            name: product.name || '商品图片',
            description: product.description || ''
          });
        }
      }
      
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach(imgUrl => {
          imageUrlSet.add(imgUrl);
          if (!imageMap.has(imgUrl)) {
            imageMap.set(imgUrl, {
              url: imgUrl,
              category: categoryMap[product.category] || product.category || '其他',
              name: `${product.name || '商品'} - 详情图`,
              description: product.description || ''
            });
          }
        });
      }
    });
  }
}

// 从订单数据中提取图片
if (data.orders && Array.isArray(data.orders)) {
  data.orders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        if (item.image) {
          imageUrlSet.add(item.image);
          if (!imageMap.has(item.image)) {
            imageMap.set(item.image, {
              url: item.image,
              category: '订单商品',
              name: item.name || '订单商品图片',
              description: ''
            });
          }
        }
      });
    }
  });
}

console.log(`找到 ${imageUrlSet.size} 张唯一图片`);

// 转换为图片数据数组
const images = Array.from(imageUrlSet).map((url, index) => {
  const info = imageMap.get(url) || {};
  
  // 从 URL 中提取图片 ID（如果有）
  const urlMatch = url.match(/photo-([^?]+)/);
  const imageId = urlMatch ? urlMatch[1] : `image_${Date.now()}_${index}`;
  
  // 生成唯一 ID
  const id = `image_${Date.now()}_${Math.random().toString(36).substring(2, 11)}_${index}`;
  
  // 提取标签
  const tags = [
    info.category,
    info.name.split(' ')[0] // 使用名称的第一个词作为标签
  ].filter(Boolean).join(',');
  
  return {
    id: id,
    name: info.name || `图片 ${index + 1}`,
    url: url,
    description: info.description || '',
    category: info.category || '其他',
    tags: tags,
    width: 1920, // 默认值
    height: 1080, // 默认值
    size: 500000, // 估算值（约 500KB）
    format: 'jpg',
    uploadTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  };
});

// 保存到 unsplash-images.json
const outputPath = path.join(__dirname, 'unsplash-images.json');
fs.writeFileSync(outputPath, JSON.stringify(images, null, 2), 'utf-8');

console.log(`\n成功提取 ${images.length} 张图片`);
console.log(`已保存到: ${outputPath}`);

// 按分类统计
const categoryStats = {};
images.forEach(img => {
  const cat = img.category || '其他';
  categoryStats[cat] = (categoryStats[cat] || 0) + 1;
});

console.log('\n分类统计:');
Object.entries(categoryStats).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count} 张`);
});

console.log('\n完成！');

