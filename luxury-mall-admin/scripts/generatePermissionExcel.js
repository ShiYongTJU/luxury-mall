import XLSX from 'xlsx';

// 权限配置数据
const permissions = [
  // 一级菜单
  { code: 'menu:operation', name: '运营中心', type: 'menu', parentCode: '', path: '/admin/operation', description: '运营中心菜单', sortOrder: 1 },
  { code: 'menu:product', name: '商品中心', type: 'menu', parentCode: '', path: '/admin/product', description: '商品中心菜单', sortOrder: 2 },
  { code: 'menu:system', name: '系统管理', type: 'menu', parentCode: '', path: '/admin/system', description: '系统管理菜单', sortOrder: 3 },
  
  // 运营中心子菜单
  { code: 'menu:operation:page', name: '页面管理', type: 'menu', parentCode: 'menu:operation', path: '/admin/operation/page', description: '页面管理菜单', sortOrder: 11 },
  { code: 'menu:operation:carousel', name: '轮播图', type: 'menu', parentCode: 'menu:operation', path: '/admin/operation/carousel', description: '轮播图菜单', sortOrder: 21 },
  { code: 'menu:operation:seckill', name: '秒杀', type: 'menu', parentCode: 'menu:operation', path: '/admin/operation/seckill', description: '秒杀菜单', sortOrder: 22 },
  { code: 'menu:operation:groupbuy', name: '团购', type: 'menu', parentCode: 'menu:operation', path: '/admin/operation/groupbuy', description: '团购菜单', sortOrder: 23 },
  { code: 'menu:operation:productList', name: '商品列表(运营)', type: 'menu', parentCode: 'menu:operation', path: '/admin/operation/productList', description: '商品列表菜单', sortOrder: 24 },
  { code: 'menu:operation:guessYouLike', name: '猜你喜欢', type: 'menu', parentCode: 'menu:operation', path: '/admin/operation/guessYouLike', description: '猜你喜欢菜单', sortOrder: 25 },
  
  // 商品中心子菜单
  { code: 'menu:product:list', name: '商品列表', type: 'menu', parentCode: 'menu:product', path: '/admin/product/list', description: '商品列表菜单', sortOrder: 31 },
  { code: 'menu:product:image:list', name: '图片列表', type: 'menu', parentCode: 'menu:product', path: '/admin/operation/image/list', description: '图片列表菜单', sortOrder: 41 },
  { code: 'menu:product:image:gallery', name: '静态资源', type: 'menu', parentCode: 'menu:product', path: '/admin/operation/image/gallery', description: '静态资源菜单', sortOrder: 42 },
  
  // 系统管理子菜单
  { code: 'menu:system:permission', name: '权限管理', type: 'menu', parentCode: 'menu:system', path: '/admin/system/permission', description: '权限管理菜单', sortOrder: 51 },
  { code: 'menu:system:role', name: '角色管理', type: 'menu', parentCode: 'menu:system', path: '/admin/system/role', description: '角色管理菜单', sortOrder: 52 },
  { code: 'menu:system:user', name: '用户管理', type: 'menu', parentCode: 'menu:system', path: '/admin/system/user', description: '用户管理菜单', sortOrder: 53 },
  
  // 商品管理按钮权限
  { code: 'button:product:add', name: '新增商品', type: 'button', parentCode: 'menu:product:list', path: 'product:add', description: '新增商品按钮', sortOrder: 1 },
  { code: 'button:product:edit', name: '编辑商品', type: 'button', parentCode: 'menu:product:list', path: 'product:edit', description: '编辑商品按钮', sortOrder: 2 },
  { code: 'button:product:delete', name: '删除商品', type: 'button', parentCode: 'menu:product:list', path: 'product:delete', description: '删除商品按钮', sortOrder: 3 },
  
  // 页面管理按钮权限
  { code: 'button:page:add', name: '新增页面', type: 'button', parentCode: 'menu:operation:page', path: 'page:add', description: '新增页面按钮', sortOrder: 11 },
  { code: 'button:page:edit', name: '编辑页面', type: 'button', parentCode: 'menu:operation:page', path: 'page:edit', description: '编辑页面按钮', sortOrder: 12 },
  { code: 'button:page:delete', name: '删除页面', type: 'button', parentCode: 'menu:operation:page', path: 'page:delete', description: '删除页面按钮', sortOrder: 13 },
  { code: 'button:page:publish', name: '发布页面', type: 'button', parentCode: 'menu:operation:page', path: 'page:publish', description: '发布页面按钮', sortOrder: 14 },
  
  // 数据源管理按钮权限（轮播图、秒杀、团购、商品列表、猜你喜欢）
  { code: 'button:carousel:add', name: '新增轮播图', type: 'button', parentCode: 'menu:operation:carousel', path: 'carousel:add', description: '新增轮播图按钮', sortOrder: 21 },
  { code: 'button:carousel:edit', name: '编辑轮播图', type: 'button', parentCode: 'menu:operation:carousel', path: 'carousel:edit', description: '编辑轮播图按钮', sortOrder: 22 },
  { code: 'button:carousel:delete', name: '删除轮播图', type: 'button', parentCode: 'menu:operation:carousel', path: 'carousel:delete', description: '删除轮播图按钮', sortOrder: 23 },
  
  { code: 'button:seckill:add', name: '新增秒杀', type: 'button', parentCode: 'menu:operation:seckill', path: 'seckill:add', description: '新增秒杀按钮', sortOrder: 31 },
  { code: 'button:seckill:edit', name: '编辑秒杀', type: 'button', parentCode: 'menu:operation:seckill', path: 'seckill:edit', description: '编辑秒杀按钮', sortOrder: 32 },
  { code: 'button:seckill:delete', name: '删除秒杀', type: 'button', parentCode: 'menu:operation:seckill', path: 'seckill:delete', description: '删除秒杀按钮', sortOrder: 33 },
  
  { code: 'button:groupbuy:add', name: '新增团购', type: 'button', parentCode: 'menu:operation:groupbuy', path: 'groupbuy:add', description: '新增团购按钮', sortOrder: 41 },
  { code: 'button:groupbuy:edit', name: '编辑团购', type: 'button', parentCode: 'menu:operation:groupbuy', path: 'groupbuy:edit', description: '编辑团购按钮', sortOrder: 42 },
  { code: 'button:groupbuy:delete', name: '删除团购', type: 'button', parentCode: 'menu:operation:groupbuy', path: 'groupbuy:delete', description: '删除团购按钮', sortOrder: 43 },
  
  { code: 'button:productList:add', name: '新增商品列表', type: 'button', parentCode: 'menu:operation:productList', path: 'productList:add', description: '新增商品列表按钮', sortOrder: 51 },
  { code: 'button:productList:edit', name: '编辑商品列表', type: 'button', parentCode: 'menu:operation:productList', path: 'productList:edit', description: '编辑商品列表按钮', sortOrder: 52 },
  { code: 'button:productList:delete', name: '删除商品列表', type: 'button', parentCode: 'menu:operation:productList', path: 'productList:delete', description: '删除商品列表按钮', sortOrder: 53 },
  
  { code: 'button:guessYouLike:add', name: '新增猜你喜欢', type: 'button', parentCode: 'menu:operation:guessYouLike', path: 'guessYouLike:add', description: '新增猜你喜欢按钮', sortOrder: 61 },
  { code: 'button:guessYouLike:edit', name: '编辑猜你喜欢', type: 'button', parentCode: 'menu:operation:guessYouLike', path: 'guessYouLike:edit', description: '编辑猜你喜欢按钮', sortOrder: 62 },
  { code: 'button:guessYouLike:delete', name: '删除猜你喜欢', type: 'button', parentCode: 'menu:operation:guessYouLike', path: 'guessYouLike:delete', description: '删除猜你喜欢按钮', sortOrder: 63 },
  
  // 图片管理按钮权限
  { code: 'button:image:add', name: '新增图片', type: 'button', parentCode: 'menu:product:image:list', path: 'image:add', description: '新增图片按钮', sortOrder: 71 },
  { code: 'button:image:edit', name: '编辑图片', type: 'button', parentCode: 'menu:product:image:list', path: 'image:edit', description: '编辑图片按钮', sortOrder: 72 },
  { code: 'button:image:delete', name: '删除图片', type: 'button', parentCode: 'menu:product:image:list', path: 'image:delete', description: '删除图片按钮', sortOrder: 73 },
  
  // 权限管理按钮权限
  { code: 'button:permission:add', name: '新增权限', type: 'button', parentCode: 'menu:system:permission', path: 'permission:add', description: '新增权限按钮', sortOrder: 81 },
  { code: 'button:permission:edit', name: '编辑权限', type: 'button', parentCode: 'menu:system:permission', path: 'permission:edit', description: '编辑权限按钮', sortOrder: 82 },
  { code: 'button:permission:delete', name: '删除权限', type: 'button', parentCode: 'menu:system:permission', path: 'permission:delete', description: '删除权限按钮', sortOrder: 83 },
  { code: 'button:permission:import', name: '导入权限', type: 'button', parentCode: 'menu:system:permission', path: 'permission:import', description: '导入权限按钮', sortOrder: 84 },
  
  // 角色管理按钮权限
  { code: 'button:role:add', name: '新增角色', type: 'button', parentCode: 'menu:system:role', path: 'role:add', description: '新增角色按钮', sortOrder: 91 },
  { code: 'button:role:edit', name: '编辑角色', type: 'button', parentCode: 'menu:system:role', path: 'role:edit', description: '编辑角色按钮', sortOrder: 92 },
  { code: 'button:role:delete', name: '删除角色', type: 'button', parentCode: 'menu:system:role', path: 'role:delete', description: '删除角色按钮', sortOrder: 93 },
  { code: 'button:role:import', name: '导入角色', type: 'button', parentCode: 'menu:system:role', path: 'role:import', description: '导入角色按钮', sortOrder: 94 },
  
  // 用户管理按钮权限
  { code: 'button:user:add', name: '新增用户', type: 'button', parentCode: 'menu:system:user', path: 'user:add', description: '新增用户按钮', sortOrder: 101 },
  { code: 'button:user:edit', name: '编辑用户', type: 'button', parentCode: 'menu:system:user', path: 'user:edit', description: '编辑用户按钮', sortOrder: 102 },
];

// 转换为Excel格式
const excelData = permissions.map(p => ({
  '权限代码': p.code,
  '权限名称': p.name,
  '权限类型': p.type === 'menu' ? '菜单' : '按钮',
  '父权限代码': p.parentCode || '',
  '路径': p.path || '',
  '描述': p.description || '',
  '排序': p.sortOrder
}));

// 创建工作簿
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(excelData);

// 设置列宽
ws['!cols'] = [
  { wch: 30 }, // 权限代码
  { wch: 20 }, // 权限名称
  { wch: 10 }, // 权限类型
  { wch: 30 }, // 父权限代码
  { wch: 30 }, // 路径
  { wch: 30 }, // 描述
  { wch: 10 }  // 排序
];

// 添加工作表
XLSX.utils.book_append_sheet(wb, ws, '权限配置');

// 写入文件
XLSX.writeFile(wb, '权限配置.xlsx');

console.log('权限配置Excel文件已生成：权限配置.xlsx');

