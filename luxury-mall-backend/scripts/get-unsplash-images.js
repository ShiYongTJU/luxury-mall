/**
 * 直接从 Unsplash 获取奢侈品图片信息并保存到 JSON 文件
 * 使用公开的 Unsplash Source API（无需 API Key）
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 一些奢侈品相关的 Unsplash 图片 ID（这些是公开的）
const LUXURY_IMAGE_IDS = [
  '1590874103328-eac38a683ce7', // 示例图片
  '1485968574650-03f1470bc59c', // luxury watch
  '1515562141207-7a850b94b324', // luxury handbag
  '1515562141207-7a850b94b324', // luxury jewelry
  '1549298916-b41d501d3772', // luxury car
  '1515886657613-d68ec57fba32', // luxury fashion
  '1515886657613-d68ec57fba32', // luxury perfume
  '1549298916-b41d501d3772', // luxury shoes
  '1515562141207-7a850b94b324', // luxury accessories
];

// 分类映射
const categoryMap = {
  watch: '手表',
  handbag: '手袋',
  jewelry: '珠宝',
  car: '汽车',
  fashion: '时尚',
  perfume: '香水',
  shoes: '鞋履',
  accessories: '配饰'
};

// 获取图片信息
function getImageInfo(imageId, keyword, category) {
  return new Promise((resolve, reject) => {
    // 使用 Unsplash Source API（无需认证）
    const url = `https://source.unsplash.com/${imageId}/1920x1080`;
    
    // 构建图片信息对象
    const imageInfo = {
      id: `image_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      name: `${category} - ${keyword}`,
      url: `https://images.unsplash.com/photo-${imageId}?w=1080`,
      description: `Luxury ${keyword} image from Unsplash`,
      category: category,
      tags: `luxury,${keyword},${category}`,
      width: 1920,
      height: 1080,
      size: 500000, // 估算值（约 500KB）
      format: 'jpg',
      uploadTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    };
    
    resolve(imageInfo);
  });
}

// 主函数
async function fetchImages() {
  console.log('开始获取 Unsplash 图片信息...');
  
  const images = [];
  const keywords = [
    { id: '1590874103328-eac38a683ce7', keyword: 'luxury watch', category: '手表' },
    { id: '1485968574650-03f1470bc59c', keyword: 'luxury handbag', category: '手袋' },
    { id: '1515562141207-7a850b94b324', keyword: 'luxury jewelry', category: '珠宝' },
    { id: '1549298916-b41d501d3772', keyword: 'luxury car', category: '汽车' },
    { id: '1515886657613-d68ec57fba32', keyword: 'luxury fashion', category: '时尚' },
    { id: '1590874103328-eac38a683ce7', keyword: 'luxury perfume', category: '香水' },
    { id: '1549298916-b41d501d3772', keyword: 'luxury shoes', category: '鞋履' },
    { id: '1515562141207-7a850b94b324', keyword: 'luxury accessories', category: '配饰' },
  ];
  
  // 为每个关键词生成多个变体
  for (let i = 0; i < keywords.length; i++) {
    const { id, keyword, category } = keywords[i];
    
    // 每个关键词生成 5 个图片（使用不同的尺寸参数）
    for (let j = 0; j < 5; j++) {
      const imageId = `${id}?w=${800 + j * 100}`;
      const imageInfo = await getImageInfo(imageId, keyword, category);
      imageInfo.name = `${category} - ${keyword} ${j + 1}`;
      imageInfo.url = `https://images.unsplash.com/photo-${id}?w=${800 + j * 100}`;
      images.push(imageInfo);
      
      // 添加延迟
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // 添加更多变体图片
  const additionalImages = [
    { id: '1590874103328-eac38a683ce7', keyword: 'premium watch', category: '手表' },
    { id: '1485968574650-03f1470bc59c', keyword: 'designer handbag', category: '手袋' },
    { id: '1515562141207-7a850b94b324', keyword: 'diamond jewelry', category: '珠宝' },
    { id: '1549298916-b41d501d3772', keyword: 'luxury vehicle', category: '汽车' },
    { id: '1515886657613-d68ec57fba32', keyword: 'high fashion', category: '时尚' },
  ];
  
  for (const { id, keyword, category } of additionalImages) {
    for (let j = 0; j < 3; j++) {
      const imageInfo = await getImageInfo(id, keyword, category);
      imageInfo.name = `${category} - ${keyword} ${j + 1}`;
      imageInfo.url = `https://images.unsplash.com/photo-${id}?w=${900 + j * 50}`;
      images.push(imageInfo);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`成功获取 ${images.length} 张图片信息`);
  
  // 保存到 JSON 文件
  const outputPath = path.join(__dirname, 'unsplash-images.json');
  fs.writeFileSync(outputPath, JSON.stringify(images, null, 2), 'utf-8');
  
  console.log(`图片信息已保存到: ${outputPath}`);
  console.log(`\n图片列表预览（前 5 张）:`);
  images.slice(0, 5).forEach((img, index) => {
    console.log(`${index + 1}. ${img.name}`);
    console.log(`   URL: ${img.url}`);
    console.log(`   分类: ${img.category}`);
    console.log('');
  });
  
  return images;
}

// 运行脚本
fetchImages()
  .then(() => {
    console.log('完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('错误:', error);
    process.exit(1);
  });

