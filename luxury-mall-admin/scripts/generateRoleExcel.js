import XLSX from 'xlsx';

// 角色配置数据
const roles = [
  {
    code: 'admin',
    name: '系统管理员',
    description: '拥有所有权限的系统管理员',
    permissions: [
      // 所有菜单权限
      'menu:operation',
      'menu:product',
      'menu:system',
      'menu:operation:page',
      'menu:operation:carousel',
      'menu:operation:seckill',
      'menu:operation:groupbuy',
      'menu:operation:productList',
      'menu:operation:guessYouLike',
      'menu:product:list',
      'menu:product:image:list',
      'menu:product:image:gallery',
      'menu:system:permission',
      'menu:system:role',
      'menu:system:user',
      // 所有按钮权限
      'button:product:add',
      'button:product:edit',
      'button:product:delete',
      'button:page:add',
      'button:page:edit',
      'button:page:delete',
      'button:page:publish',
      'button:carousel:add',
      'button:carousel:edit',
      'button:carousel:delete',
      'button:seckill:add',
      'button:seckill:edit',
      'button:seckill:delete',
      'button:groupbuy:add',
      'button:groupbuy:edit',
      'button:groupbuy:delete',
      'button:productList:add',
      'button:productList:edit',
      'button:productList:delete',
      'button:guessYouLike:add',
      'button:guessYouLike:edit',
      'button:guessYouLike:delete',
      'button:image:add',
      'button:image:edit',
      'button:image:delete',
      'button:permission:add',
      'button:permission:edit',
      'button:permission:delete',
      'button:permission:import',
      'button:role:add',
      'button:role:edit',
      'button:role:delete',
      'button:role:import',
      'button:user:add',
      'button:user:edit'
    ]
  },
  {
    code: 'visitor',
    name: '游客',
    description: '可查看所有页面但不能点击任何按钮',
    permissions: [
      // 所有菜单权限（只读）
      'menu:operation',
      'menu:product',
      'menu:operation:page',
      'menu:operation:carousel',
      'menu:operation:seckill',
      'menu:operation:groupbuy',
      'menu:operation:productList',
      'menu:operation:guessYouLike',
      'menu:product:list',
      'menu:product:image:list',
      'menu:product:image:gallery'
      // 不包含任何按钮权限
    ]
  },
  {
    code: 'product_operator',
    name: '商品运营',
    description: '可查看和点击商品中心所有页面和按钮',
    permissions: [
      // 商品中心菜单权限
      'menu:product',
      'menu:product:list',
      'menu:product:image:list',
      'menu:product:image:gallery',
      // 商品中心按钮权限
      'button:product:add',
      'button:product:edit',
      'button:product:delete',
      'button:image:add',
      'button:image:edit',
      'button:image:delete'
    ]
  },
  {
    code: 'decoration_operator',
    name: '装修运营',
    description: '可访问和点击运营中心所有页面和按钮',
    permissions: [
      // 运营中心菜单权限
      'menu:operation',
      'menu:operation:page',
      'menu:operation:carousel',
      'menu:operation:seckill',
      'menu:operation:groupbuy',
      'menu:operation:productList',
      'menu:operation:guessYouLike',
      // 运营中心按钮权限
      'button:page:add',
      'button:page:edit',
      'button:page:delete',
      'button:page:publish',
      'button:carousel:add',
      'button:carousel:edit',
      'button:carousel:delete',
      'button:seckill:add',
      'button:seckill:edit',
      'button:seckill:delete',
      'button:groupbuy:add',
      'button:groupbuy:edit',
      'button:groupbuy:delete',
      'button:productList:add',
      'button:productList:edit',
      'button:productList:delete',
      'button:guessYouLike:add',
      'button:guessYouLike:edit',
      'button:guessYouLike:delete'
    ]
  }
];

// 转换为Excel格式
const excelData = roles.map(r => ({
  '角色代码': r.code,
  '角色名称': r.name,
  '描述': r.description || '',
  '权限代码列表': r.permissions.join(',')
}));

// 创建工作簿
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(excelData);

// 设置列宽
ws['!cols'] = [
  { wch: 20 }, // 角色代码
  { wch: 20 }, // 角色名称
  { wch: 50 }, // 描述
  { wch: 100 } // 权限代码列表
];

// 添加工作表
XLSX.utils.book_append_sheet(wb, ws, '角色配置');

// 写入文件
XLSX.writeFile(wb, '角色配置.xlsx');

console.log('角色配置Excel文件已生成：角色配置.xlsx');

