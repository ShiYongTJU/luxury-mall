import { Product, CarouselItem, HomePageData } from '@/types/product'

// Mock商品数据
export const mockProducts: Product[] = [
  {
    id: '1',
    name: '经典款手提包',
    description: '意大利手工制作，精选优质皮革',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400',
    price: 12800,
    originalPrice: 15800,
    tag: '热销',
    category: 'bags',
    subCategory: '新品',
    brand: 'Aurelia Atelier',
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800'
    ],
    detailDescription: 'Aurelia经典托特包沿袭意式匠心工艺，采用整张头层小牛皮搭配手工缝线，让都市女性在通勤与旅行间切换自如。',
    highlights: ['甄选头层小牛皮，触感柔软', 'V型结构肩带稳固承重', '配备可拆卸收纳袋'],
    specs: [
      {
        id: 'color',
        name: '颜色',
        options: [
          { id: 'classic-brown', label: '经典棕' },
          { id: 'obsidian-black', label: '曜石黑' }
        ]
      },
      {
        id: 'size',
        name: '尺寸',
        options: [
          { id: 'medium', label: '中号 32cm' },
          { id: 'large', label: '大号 36cm' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r1-1',
        user: 'Celine',
        avatar: 'https://i.pravatar.cc/80?img=12',
        rating: 5,
        comment: '皮质细腻又耐磨，搭配任何风格都不违和。',
        date: '2024-05-12',
        specSummary: '曜石黑 / 中号'
      },
      {
        id: 'r1-2',
        user: 'Isabella',
        avatar: 'https://i.pravatar.cc/80?img=36',
        rating: 4,
        comment: '容量比想象大，唯一缺点是太热门需要预订。',
        date: '2024-06-03',
        specSummary: '经典棕 / 大号'
      }
    ],
    services: ['正品保障', '七天无理由退货', '终身保养咨询'],
    shippingInfo: '上海保税仓48小时内发货，顺丰包邮',
    stock: 35
  },
  {
    id: '2',
    name: '优雅女士手表',
    description: '瑞士机芯，18K金表壳',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    price: 25800,
    originalPrice: 29800,
    tag: '新品',
    category: 'watches',
    subCategory: '新品',
    brand: 'Valon Genève',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=640&h=800&fit=crop',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800'
    ],
    detailDescription: 'Valon Héritage腕表延续瑞士制表传统，采用18K玫瑰金表壳与珍珠贝母表盘，镶嵌八颗天然钻石，承载优雅与精准。',
    highlights: ['瑞士自动上链机芯', '抗刮蓝宝石镜面', '50米生活防水'],
    specs: [
      {
        id: 'strap',
        name: '表带',
        options: [
          { id: 'strap-leather', label: '鳄鱼纹皮革' },
          { id: 'strap-milanese', label: '米兰尼斯钢带' }
        ]
      },
      {
        id: 'size',
        name: '表径',
        options: [
          { id: 'size-32', label: '32mm' },
          { id: 'size-36', label: '36mm' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r2-1',
        user: 'Aurora',
        avatar: 'https://i.pravatar.cc/80?img=21',
        rating: 5,
        comment: '表盘细节非常高级，走时精准。',
        date: '2024-04-28',
        specSummary: '鳄鱼纹皮革 / 32mm'
      },
      {
        id: 'r2-2',
        user: 'Naomi',
        avatar: 'https://i.pravatar.cc/80?img=8',
        rating: 4,
        comment: '皮带很舒适，建议搭配额外钢带更百搭。',
        date: '2024-06-10',
        specSummary: '米兰尼斯钢带 / 36mm'
      }
    ],
    services: ['全球联保两年', '顺丰保价配送', '专属养护指导'],
    shippingInfo: '瑞士原厂直发，预计3-5个工作日送达',
    stock: 18
  },
  {
    id: '3',
    name: '真丝围巾',
    description: '100%桑蚕丝，手工印花',
    image: 'https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=400',
    price: 3200,
    originalPrice: 3800,
    tag: '限时',
    category: 'accessories',
    subCategory: '配件周边',
    brand: 'Serica Atelier',
    images: [
      'https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=800',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800'
    ],
    detailDescription: '灵感来自托斯卡纳花园的渐变印花，精选6A级桑蚕丝，经由法国里昂工坊手工卷边，呈现柔润光泽。',
    highlights: ['6A级桑蚕丝', '法国手工卷边', '100cm见方大尺寸'],
    specs: [
      {
        id: 'color',
        name: '配色',
        options: [
          { id: 'color-rose', label: '晨曦粉' },
          { id: 'color-ocean', label: '海雾蓝' },
          { id: 'color-amber', label: '琥珀橙' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r3-1',
        user: 'Vivian',
        avatar: 'https://i.pravatar.cc/80?img=32',
        rating: 5,
        comment: '颜色层次丰富，作为披肩也很好看。',
        date: '2024-03-16',
        specSummary: '晨曦粉'
      }
    ],
    services: ['真丝专业养护指导', '支持包装贺卡', '七天无理由退货'],
    shippingInfo: '杭州仓24小时内发出，顺丰包邮',
    stock: 62
  },
  {
    id: '4',
    name: '羊绒大衣',
    description: '100%羊绒，意大利进口面料',
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400',
    price: 18800,
    originalPrice: 22800,
    tag: '热销',
    category: 'clothing',
    subCategory: '新品',
    brand: 'Casa Firenze',
    images: [
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800',
      'https://images.unsplash.com/photo-1495121605193-b116b5b09c1b?w=800',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800'
    ],
    detailDescription: '选用意大利Loro Piana 100%羊绒面料，双面手缝工艺，轻盈却保暖，线条立体优雅。',
    highlights: ['双面手缝 32小时工时', '隐藏式腰带结构', '经典H版型'],
    specs: [
      {
        id: 'color',
        name: '颜色',
        options: [
          { id: 'color-sand', label: '沙色' },
          { id: 'color-ivory', label: '象牙白' }
        ]
      },
      {
        id: 'size',
        name: '尺码',
        options: [
          { id: 'size-s', label: 'S' },
          { id: 'size-m', label: 'M' },
          { id: 'size-l', label: 'L' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r4-1',
        user: 'Maggie',
        avatar: 'https://i.pravatar.cc/80?img=18',
        rating: 5,
        comment: '版型很显瘦，料子也很轻盈。',
        date: '2024-02-02',
        specSummary: '沙色 / M'
      }
    ],
    services: ['专属尺码顾问', '终身熨烫养护', '顺丰即日达（部分城市）'],
    shippingInfo: '米兰直邮或上海现货，提供试穿退换服务',
    stock: 27
  },
  {
    id: '5',
    name: '钻石项链',
    description: '1克拉主钻，18K白金',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    price: 58800,
    originalPrice: 68800,
    tag: '新品',
    category: 'jewelry',
    subCategory: '新品',
    brand: 'Éclat Joaillerie',
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
      'https://images.unsplash.com/photo-1518544889280-37f4ca38e4e0?w=800',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800'
    ],
    detailDescription: '以光晕为灵感的Halo钻石项链，采用GH色VS1净度主钻，辅钻环绕，搭配18K白金链，闪耀不凡。',
    highlights: ['GIA认证主钻', '18K金可调节链长', '巴黎工坊镶嵌'],
    specs: [
      {
        id: 'carat',
        name: '主钻尺寸',
        options: [
          { id: 'carat-1', label: '1.00ct' },
          { id: 'carat-12', label: '1.20ct' }
        ]
      },
      {
        id: 'chain',
        name: '链长',
        options: [
          { id: 'chain-42', label: '42cm' },
          { id: 'chain-45', label: '45cm' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r5-1',
        user: 'Helena',
        avatar: 'https://i.pravatar.cc/80?img=45',
        rating: 5,
        comment: '火彩很漂亮，日常和礼服都能驾驭。',
        date: '2024-06-18',
        specSummary: '1ct / 42cm'
      },
      {
        id: 'r5-2',
        user: 'Sofia',
        avatar: 'https://i.pravatar.cc/80?img=51',
        rating: 4,
        comment: '链条稍细，但整体很闪耀。',
        date: '2024-07-05',
        specSummary: '1.2ct / 45cm'
      }
    ],
    services: ['GIA证书', '终身清洗保养', '专人保价配送'],
    shippingInfo: '上海旗舰店现货，支持到店自提或保价快递',
    stock: 12
  },
  {
    id: '6',
    name: '男士商务皮鞋',
    description: '意大利手工制作，小牛皮',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
    price: 6800,
    originalPrice: 8800,
    tag: '限时',
    category: 'shoes',
    subCategory: '打印机',
    brand: 'Gentaro Milano',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'
    ],
    detailDescription: '经典牛津雕花鞋，采用法式Goodyear沿条工艺，鞋底可翻新，兼具挺拔线条与舒适脚感。',
    highlights: ['Goodyear沿条工艺', '小牛皮鞋面', '意大利牛皮内里'],
    specs: [
      {
        id: 'color',
        name: '颜色',
        options: [
          { id: 'color-mahogany', label: '红木棕' },
          { id: 'color-ink', label: '墨黑' }
        ]
      },
      {
        id: 'size',
        name: '尺码',
        options: [
          { id: 'size-40', label: '40' },
          { id: 'size-41', label: '41' },
          { id: 'size-42', label: '42' },
          { id: 'size-43', label: '43' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r6-1',
        user: 'Leon',
        avatar: 'https://i.pravatar.cc/80?img=15',
        rating: 5,
        comment: '皮质有光泽，穿久也不累脚。',
        date: '2024-03-30',
        specSummary: '墨黑 / 42'
      }
    ],
    services: ['免费拉伸调校', '终身保养教程', '顺丰保价快递'],
    shippingInfo: '广州仓现货，支持到店试穿',
    stock: 44
  },
  {
    id: '7',
    name: '女士高跟鞋',
    description: '真皮材质，舒适内里',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
    price: 4800,
    originalPrice: 5800,
    category: 'shoes',
    subCategory: '显示器',
    brand: 'Serenity Studio',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800'
    ],
    detailDescription: '经典尖头高跟鞋，内置乳胶脚垫与防滑鞋底，8.5cm鞋跟比例拉长腿部线条，优雅又耐穿。',
    highlights: ['软牛皮鞋面', '8.5cm细跟', '防滑耐磨鞋底'],
    specs: [
      {
        id: 'color',
        name: '颜色',
        options: [
          { id: 'color-nude', label: '裸肤色' },
          { id: 'color-rose', label: '玫瑰金' },
          { id: 'color-black', label: '曜石黑' }
        ]
      },
      {
        id: 'size',
        name: '尺码',
        options: [
          { id: 'size-35', label: '35' },
          { id: 'size-36', label: '36' },
          { id: 'size-37', label: '37' },
          { id: 'size-38', label: '38' },
          { id: 'size-39', label: '39' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r7-1',
        user: 'Lena',
        avatar: 'https://i.pravatar.cc/80?img=28',
        rating: 5,
        comment: '婚礼穿了一整天也很稳。',
        date: '2024-05-01',
        specSummary: '玫瑰金 / 36'
      }
    ],
    services: ['鞋跟保养计划', '一次免费换底', '七天无理由退换'],
    shippingInfo: '深圳仓当日16:00前下单极速发出',
    stock: 58
  },
  {
    id: '8',
    name: '太阳镜',
    description: 'UV400防护，意大利设计',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400',
    price: 3200,
    originalPrice: 4200,
    category: 'accessories',
    subCategory: '配件周边',
    brand: 'Lume Roma',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800'
    ],
    detailDescription: '复古猫眼轮廓搭配钛金属镜臂，轻盈抗过敏，德国产蔡司镜片带来清晰视野与UV400防护。',
    highlights: ['蔡司定制镜片', '钛金属镜腿', 'UV400全波段防护'],
    specs: [
      {
        id: 'frame',
        name: '镜框颜色',
        options: [
          { id: 'frame-black', label: '亮黑' },
          { id: 'frame-tortoise', label: '乌木玳瑁' }
        ]
      },
      {
        id: 'lens',
        name: '镜片色',
        options: [
          { id: 'lens-grey', label: '渐变灰' },
          { id: 'lens-brown', label: '琥珀茶' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r8-1',
        user: 'Emily',
        avatar: 'https://i.pravatar.cc/80?img=17',
        rating: 4,
        comment: '镜架很轻不压鼻梁，拍照显脸小。',
        date: '2024-07-11',
        specSummary: '乌木玳瑁 / 琥珀茶'
      }
    ],
    services: ['终身免费调校', '防撞旅行盒', '顺丰包邮'],
    shippingInfo: '北京 & 上海双仓发货，预计1-2天送达',
    stock: 73
  },
  {
    id: '9',
    name: '激光打印机 Pro',
    description: '高速打印，无线连接',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400',
    price: 2800,
    originalPrice: 3200,
    tag: '热销',
    category: 'electronics',
    subCategory: '打印机',
    brand: 'TechPrint',
    images: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'
    ],
    detailDescription: '高速激光打印机，支持双面打印，无线WiFi连接，适合家庭和办公使用。',
    highlights: ['每分钟30页打印速度', '双面自动打印', '无线WiFi连接'],
    specs: [
      {
        id: 'color',
        name: '颜色',
        options: [
          { id: 'color-white', label: '白色' },
          { id: 'color-black', label: '黑色' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r9-1',
        user: 'David',
        avatar: 'https://i.pravatar.cc/80?img=33',
        rating: 5,
        comment: '打印速度快，质量很好，无线连接很方便。',
        date: '2024-06-15',
        specSummary: '白色'
      }
    ],
    services: ['一年质保', '免费上门安装', '顺丰包邮'],
    shippingInfo: '全国发货，预计2-3天送达',
    stock: 25
  },
  {
    id: '10',
    name: '喷墨打印机 家用版',
    description: '彩色打印，照片级质量',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
    price: 1200,
    originalPrice: 1500,
    tag: '限时',
    category: 'electronics',
    subCategory: '打印机',
    brand: 'PrintMaster',
    images: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'
    ],
    detailDescription: '家用喷墨打印机，支持彩色打印，照片级打印质量，适合打印照片和文档。',
    highlights: ['彩色打印', '照片级质量', '经济实惠'],
    specs: [
      {
        id: 'model',
        name: '型号',
        options: [
          { id: 'model-basic', label: '基础版' },
          { id: 'model-pro', label: '专业版' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r10-1',
        user: 'Sarah',
        avatar: 'https://i.pravatar.cc/80?img=47',
        rating: 4,
        comment: '打印照片效果不错，性价比高。',
        date: '2024-07-20',
        specSummary: '基础版'
      }
    ],
    services: ['一年质保', '免费技术支持', '顺丰包邮'],
    shippingInfo: '全国发货，预计2-3天送达',
    stock: 42
  },
  {
    id: '11',
    name: '4K超清显示器 27寸',
    description: '4K分辨率，HDR显示',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
    price: 3200,
    originalPrice: 3800,
    tag: '新品',
    category: 'electronics',
    subCategory: '显示器',
    brand: 'DisplayPro',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'
    ],
    detailDescription: '27寸4K超清显示器，支持HDR显示，色彩准确，适合专业设计和游戏使用。',
    highlights: ['4K超清分辨率', 'HDR显示', '色彩准确'],
    specs: [
      {
        id: 'size',
        name: '尺寸',
        options: [
          { id: 'size-27', label: '27寸' },
          { id: 'size-32', label: '32寸' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r11-1',
        user: 'Mike',
        avatar: 'https://i.pravatar.cc/80?img=13',
        rating: 5,
        comment: '显示效果非常棒，色彩很准确，玩游戏很爽。',
        date: '2024-07-10',
        specSummary: '27寸'
      }
    ],
    services: ['三年质保', '免费上门安装', '顺丰包邮'],
    shippingInfo: '全国发货，预计2-3天送达',
    stock: 18
  },
  {
    id: '12',
    name: '曲面显示器 34寸',
    description: '超宽曲面屏，沉浸式体验',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    price: 4500,
    originalPrice: 5200,
    tag: '热销',
    category: 'electronics',
    subCategory: '显示器',
    brand: 'CurveDisplay',
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800'
    ],
    detailDescription: '34寸超宽曲面显示器，21:9比例，沉浸式视觉体验，适合办公和娱乐。',
    highlights: ['34寸超宽屏', '曲面设计', '21:9比例'],
    specs: [
      {
        id: 'resolution',
        name: '分辨率',
        options: [
          { id: 'res-2k', label: '2K' },
          { id: 'res-4k', label: '4K' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r12-1',
        user: 'Alex',
        avatar: 'https://i.pravatar.cc/80?img=20',
        rating: 5,
        comment: '曲面屏效果很棒，办公效率提升很多。',
        date: '2024-06-25',
        specSummary: '2K'
      }
    ],
    services: ['三年质保', '免费上门安装', '顺丰包邮'],
    shippingInfo: '全国发货，预计2-3天送达',
    stock: 15
  },
  {
    id: '13',
    name: '无线鼠标 静音版',
    description: '静音设计，人体工学',
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
    price: 180,
    originalPrice: 250,
    category: 'electronics',
    subCategory: '配件周边',
    brand: 'MouseTech',
    images: [
      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
      'https://images.unsplash.com/photo-1551866442-64af75f69704?w=800'
    ],
    detailDescription: '无线静音鼠标，人体工学设计，长时间使用不累手，适合办公和游戏。',
    highlights: ['静音设计', '人体工学', '无线连接'],
    specs: [
      {
        id: 'color',
        name: '颜色',
        options: [
          { id: 'color-black', label: '黑色' },
          { id: 'color-white', label: '白色' },
          { id: 'color-pink', label: '粉色' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r13-1',
        user: 'Lisa',
        avatar: 'https://i.pravatar.cc/80?img=25',
        rating: 5,
        comment: '静音效果很好，不会打扰同事，手感也很舒适。',
        date: '2024-07-05',
        specSummary: '黑色'
      }
    ],
    services: ['一年质保', '七天无理由退货', '顺丰包邮'],
    shippingInfo: '全国发货，预计1-2天送达',
    stock: 68
  },
  {
    id: '14',
    name: '机械键盘 RGB',
    description: 'RGB背光，青轴机械',
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
    price: 680,
    originalPrice: 880,
    tag: '新品',
    category: 'electronics',
    subCategory: '配件周边',
    brand: 'KeyBoardPro',
    images: [
      'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800',
      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800'
    ],
    detailDescription: 'RGB背光机械键盘，青轴手感，适合游戏和打字，支持自定义灯光效果。',
    highlights: ['RGB背光', '青轴机械', '自定义灯光'],
    specs: [
      {
        id: 'switch',
        name: '轴体',
        options: [
          { id: 'switch-blue', label: '青轴' },
          { id: 'switch-red', label: '红轴' },
          { id: 'switch-brown', label: '茶轴' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r14-1',
        user: 'Tom',
        avatar: 'https://i.pravatar.cc/80?img=16',
        rating: 5,
        comment: '手感很棒，RGB灯光效果很酷，游戏体验提升明显。',
        date: '2024-07-12',
        specSummary: '青轴'
      }
    ],
    services: ['一年质保', '七天无理由退货', '顺丰包邮'],
    shippingInfo: '全国发货，预计1-2天送达',
    stock: 35
  },
  {
    id: '15',
    name: 'USB-C扩展坞',
    description: '多接口扩展，支持4K输出',
    image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400',
    price: 320,
    originalPrice: 420,
    category: 'electronics',
    subCategory: '配件周边',
    brand: 'DockTech',
    images: [
      'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'
    ],
    detailDescription: 'USB-C扩展坞，支持HDMI 4K输出，USB 3.0接口，PD快充，适合笔记本扩展使用。',
    highlights: ['HDMI 4K输出', 'USB 3.0接口', 'PD快充'],
    specs: [
      {
        id: 'ports',
        name: '接口数量',
        options: [
          { id: 'ports-7', label: '7合1' },
          { id: 'ports-9', label: '9合1' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r15-1',
        user: 'Emma',
        avatar: 'https://i.pravatar.cc/80?img=29',
        rating: 4,
        comment: '接口很全，4K输出清晰，使用方便。',
        date: '2024-07-08',
        specSummary: '7合1'
      }
    ],
    services: ['一年质保', '七天无理由退货', '顺丰包邮'],
    shippingInfo: '全国发货，预计1-2天送达',
    stock: 52
  },
  {
    id: '16',
    name: '2025春季新款手袋',
    description: '时尚简约设计，轻便实用',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400',
    price: 15800,
    originalPrice: 18800,
    tag: '新品',
    category: 'bags',
    subCategory: '新品',
    brand: 'Spring Collection',
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800'
    ],
    detailDescription: '2025春季全新设计，采用环保再生皮革，时尚简约风格，适合日常通勤和休闲场合。',
    highlights: ['环保再生皮革', '轻便实用', '多口袋设计'],
    specs: [
      {
        id: 'color',
        name: '颜色',
        options: [
          { id: 'color-beige', label: '米白色' },
          { id: 'color-navy', label: '海军蓝' },
          { id: 'color-pink', label: '樱花粉' }
        ]
      },
      {
        id: 'size',
        name: '尺寸',
        options: [
          { id: 'size-small', label: '小号 28cm' },
          { id: 'size-medium', label: '中号 32cm' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r16-1',
        user: 'Sophia',
        avatar: 'https://i.pravatar.cc/80?img=24',
        rating: 5,
        comment: '颜色很温柔，设计也很实用，非常喜欢！',
        date: '2024-08-01',
        specSummary: '樱花粉 / 中号'
      }
    ],
    services: ['正品保障', '七天无理由退货', '终身保养咨询'],
    shippingInfo: '上海保税仓48小时内发货，顺丰包邮',
    stock: 28
  },
  {
    id: '17',
    name: '设计师联名手袋',
    description: '限量版联名设计，独特风格',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    price: 22800,
    originalPrice: 26800,
    tag: '新品',
    category: 'bags',
    subCategory: '新品',
    brand: 'Designer Collab',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800'
    ],
    detailDescription: '与国际知名设计师联名推出的限量版手袋，独特的设计风格，彰显个性与品味。',
    highlights: ['限量版设计', '独特风格', '手工制作'],
    specs: [
      {
        id: 'color',
        name: '颜色',
        options: [
          { id: 'color-red', label: '经典红' },
          { id: 'color-green', label: '森林绿' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r17-1',
        user: 'Olivia',
        avatar: 'https://i.pravatar.cc/80?img=40',
        rating: 5,
        comment: '设计非常独特，回头率超高！',
        date: '2024-08-05',
        specSummary: '经典红'
      }
    ],
    services: ['正品保障', '七天无理由退货', '终身保养咨询'],
    shippingInfo: '上海保税仓48小时内发货，顺丰包邮',
    stock: 15
  },
  {
    id: '18',
    name: '2025春季新款真丝围巾',
    description: '春季限定配色，轻盈飘逸',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
    price: 3800,
    originalPrice: 4500,
    tag: '新品',
    category: 'accessories',
    subCategory: '新品',
    brand: 'Spring Silk',
    images: [
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800',
      'https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=800',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800'
    ],
    detailDescription: '2025春季限定配色，采用顶级6A级桑蚕丝，轻盈飘逸，适合春夏季节搭配。',
    highlights: ['春季限定配色', '6A级桑蚕丝', '轻盈飘逸'],
    specs: [
      {
        id: 'color',
        name: '配色',
        options: [
          { id: 'color-lavender', label: '薰衣草紫' },
          { id: 'color-mint', label: '薄荷绿' },
          { id: 'color-peach', label: '蜜桃粉' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r18-1',
        user: 'Grace',
        avatar: 'https://i.pravatar.cc/80?img=22',
        rating: 5,
        comment: '颜色非常春天，质地也很柔软，很喜欢！',
        date: '2024-08-03',
        specSummary: '薰衣草紫'
      }
    ],
    services: ['真丝专业养护指导', '支持包装贺卡', '七天无理由退货'],
    shippingInfo: '杭州仓24小时内发出，顺丰包邮',
    stock: 45
  },
  {
    id: '19',
    name: '2025新款太阳镜',
    description: '时尚潮流设计，UV400防护',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400',
    price: 2800,
    originalPrice: 3500,
    tag: '新品',
    category: 'accessories',
    subCategory: '新品',
    brand: 'SunStyle 2025',
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800'
    ],
    detailDescription: '2025年全新设计，采用最新材质和工艺，时尚潮流，UV400全波段防护。',
    highlights: ['2025新款设计', 'UV400全波段防护', '时尚潮流'],
    specs: [
      {
        id: 'frame',
        name: '镜框颜色',
        options: [
          { id: 'frame-gold', label: '香槟金' },
          { id: 'frame-silver', label: '银灰色' },
          { id: 'frame-rose', label: '玫瑰金' }
        ]
      },
      {
        id: 'lens',
        name: '镜片色',
        options: [
          { id: 'lens-blue', label: '渐变蓝' },
          { id: 'lens-green', label: '渐变绿' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r19-1',
        user: 'Mia',
        avatar: 'https://i.pravatar.cc/80?img=19',
        rating: 5,
        comment: '设计很时尚，戴着很舒服，防护效果也很好。',
        date: '2024-08-08',
        specSummary: '香槟金 / 渐变蓝'
      }
    ],
    services: ['终身免费调校', '防撞旅行盒', '顺丰包邮'],
    shippingInfo: '北京 & 上海双仓发货，预计1-2天送达',
    stock: 38
  },
  {
    id: '20',
    name: '时尚链条包',
    description: '精致链条设计，优雅时尚',
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400',
    price: 9800,
    originalPrice: 12800,
    tag: '新品',
    category: 'bags',
    subCategory: '新品',
    brand: 'Chain Elegance',
    images: [
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'
    ],
    detailDescription: '精致链条设计，优雅时尚，适合各种场合，是时尚女性的必备单品。',
    highlights: ['精致链条设计', '优雅时尚', '多场合适用'],
    specs: [
      {
        id: 'color',
        name: '颜色',
        options: [
          { id: 'color-black', label: '经典黑' },
          { id: 'color-white', label: '珍珠白' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r20-1',
        user: 'Emma',
        avatar: 'https://i.pravatar.cc/80?img=14',
        rating: 5,
        comment: '链条设计很精致，整体很优雅，非常满意！',
        date: '2024-08-10',
        specSummary: '经典黑'
      }
    ],
    services: ['正品保障', '七天无理由退货', '终身保养咨询'],
    shippingInfo: '上海保税仓48小时内发货，顺丰包邮',
    stock: 32
  },
  {
    id: '21',
    name: '珍珠项链配饰',
    description: '天然珍珠，优雅经典',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    price: 4200,
    originalPrice: 5200,
    tag: '新品',
    category: 'accessories',
    subCategory: '新品',
    brand: 'Pearl Classic',
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800'
    ],
    detailDescription: '采用天然海水珍珠，优雅经典的设计，适合正式场合和日常搭配。',
    highlights: ['天然海水珍珠', '优雅经典', '多场合适用'],
    specs: [
      {
        id: 'length',
        name: '链长',
        options: [
          { id: 'length-40', label: '40cm' },
          { id: 'length-45', label: '45cm' },
          { id: 'length-50', label: '50cm' }
        ]
      },
      {
        id: 'pearl',
        name: '珍珠大小',
        options: [
          { id: 'pearl-6', label: '6mm' },
          { id: 'pearl-8', label: '8mm' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r21-1',
        user: 'Charlotte',
        avatar: 'https://i.pravatar.cc/80?img=26',
        rating: 5,
        comment: '珍珠光泽很好，设计也很经典，很满意！',
        date: '2024-08-12',
        specSummary: '45cm / 8mm'
      }
    ],
    services: ['正品保障', '终身清洗保养', '顺丰包邮'],
    shippingInfo: '全国发货，预计2-3天送达',
    stock: 25
  },
  {
    id: '22',
    name: '2025春季新款连衣裙',
    description: '轻盈飘逸，优雅时尚',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
    price: 12800,
    originalPrice: 15800,
    tag: '新品',
    category: 'clothing',
    subCategory: '新品',
    brand: 'Spring Fashion',
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800',
      'https://images.unsplash.com/photo-1566479179817-278d95e5b7d9?w=800',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'
    ],
    detailDescription: '2025春季全新设计，采用轻盈飘逸的面料，优雅时尚的剪裁，适合春夏季节穿着。',
    highlights: ['轻盈飘逸面料', '优雅时尚剪裁', '春夏季节适用'],
    specs: [
      {
        id: 'color',
        name: '颜色',
        options: [
          { id: 'color-white', label: '纯白色' },
          { id: 'color-blue', label: '天空蓝' },
          { id: 'color-pink', label: '樱花粉' }
        ]
      },
      {
        id: 'size',
        name: '尺码',
        options: [
          { id: 'size-s', label: 'S' },
          { id: 'size-m', label: 'M' },
          { id: 'size-l', label: 'L' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r22-1',
        user: 'Amanda',
        avatar: 'https://i.pravatar.cc/80?img=30',
        rating: 5,
        comment: '面料很轻盈，穿着很舒服，设计也很时尚！',
        date: '2024-08-15',
        specSummary: '天空蓝 / M'
      }
    ],
    services: ['专属尺码顾问', '终身熨烫养护', '顺丰包邮'],
    shippingInfo: '上海仓24小时内发出，顺丰包邮',
    stock: 38
  },
  {
    id: '23',
    name: '2025春季新款休闲西装',
    description: '商务休闲，精致剪裁',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
    price: 15800,
    originalPrice: 19800,
    tag: '新品',
    category: 'clothing',
    subCategory: '新品',
    brand: 'Business Casual',
    images: [
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
      'https://images.unsplash.com/photo-1495121605193-b116b5b09c1b?w=800',
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800'
    ],
    detailDescription: '2025春季新款休闲西装，采用精致剪裁，商务休闲两相宜，适合职场和日常穿着。',
    highlights: ['精致剪裁', '商务休闲', '多场合适用'],
    specs: [
      {
        id: 'color',
        name: '颜色',
        options: [
          { id: 'color-navy', label: '海军蓝' },
          { id: 'color-gray', label: '经典灰' },
          { id: 'color-black', label: '经典黑' }
        ]
      },
      {
        id: 'size',
        name: '尺码',
        options: [
          { id: 'size-s', label: 'S' },
          { id: 'size-m', label: 'M' },
          { id: 'size-l', label: 'L' },
          { id: 'size-xl', label: 'XL' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r23-1',
        user: 'Robert',
        avatar: 'https://i.pravatar.cc/80?img=11',
        rating: 5,
        comment: '剪裁很精致，穿着很合身，商务休闲都很适合！',
        date: '2024-08-18',
        specSummary: '海军蓝 / M'
      }
    ],
    services: ['专属尺码顾问', '终身熨烫养护', '顺丰包邮'],
    shippingInfo: '北京仓24小时内发出，顺丰包邮',
    stock: 28
  },
  {
    id: '24',
    name: '2025春季新款运动鞋',
    description: '舒适透气，时尚百搭',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    price: 880,
    originalPrice: 1280,
    tag: '新品',
    category: 'shoes',
    subCategory: '新品',
    brand: 'SportStyle',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800'
    ],
    detailDescription: '2025春季新款运动鞋，采用舒适透气的材质，时尚百搭的设计，适合运动和日常穿着。',
    highlights: ['舒适透气', '时尚百搭', '运动日常两用'],
    specs: [
      {
        id: 'color',
        name: '颜色',
        options: [
          { id: 'color-white', label: '纯白色' },
          { id: 'color-black', label: '经典黑' },
          { id: 'color-gray', label: '灰色' }
        ]
      },
      {
        id: 'size',
        name: '尺码',
        options: [
          { id: 'size-38', label: '38' },
          { id: 'size-39', label: '39' },
          { id: 'size-40', label: '40' },
          { id: 'size-41', label: '41' },
          { id: 'size-42', label: '42' },
          { id: 'size-43', label: '43' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r24-1',
        user: 'Jack',
        avatar: 'https://i.pravatar.cc/80?img=9',
        rating: 5,
        comment: '很舒适，透气性很好，运动时穿着很舒服！',
        date: '2024-08-20',
        specSummary: '纯白色 / 42'
      }
    ],
    services: ['一年质保', '七天无理由退货', '顺丰包邮'],
    shippingInfo: '全国发货，预计1-2天送达',
    stock: 65
  },
  {
    id: '25',
    name: '2025春季新款平底鞋',
    description: '舒适优雅，通勤必备',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400',
    price: 1280,
    originalPrice: 1680,
    tag: '新品',
    category: 'shoes',
    subCategory: '新品',
    brand: 'Comfort Walk',
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800'
    ],
    detailDescription: '2025春季新款平底鞋，舒适优雅的设计，通勤必备单品，适合长时间穿着。',
    highlights: ['舒适优雅', '通勤必备', '长时间穿着不累'],
    specs: [
      {
        id: 'color',
        name: '颜色',
        options: [
          { id: 'color-beige', label: '米色' },
          { id: 'color-black', label: '黑色' },
          { id: 'color-red', label: '红色' }
        ]
      },
      {
        id: 'size',
        name: '尺码',
        options: [
          { id: 'size-35', label: '35' },
          { id: 'size-36', label: '36' },
          { id: 'size-37', label: '37' },
          { id: 'size-38', label: '38' },
          { id: 'size-39', label: '39' }
        ]
      }
    ],
    reviews: [
      {
        id: 'r25-1',
        user: 'Lucy',
        avatar: 'https://i.pravatar.cc/80?img=23',
        rating: 5,
        comment: '很舒适，通勤穿一整天也不累，设计也很优雅！',
        date: '2024-08-22',
        specSummary: '米色 / 37'
      }
    ],
    services: ['一年质保', '七天无理由退货', '顺丰包邮'],
    shippingInfo: '全国发货，预计1-2天送达',
    stock: 52
  }
]

// Mock轮播图数据
export const mockCarouselItems: CarouselItem[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    title: '春季新品上市',
    link: '/category?season=spring'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
    title: '限时特惠活动',
    link: '/category?promo=true'
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800',
    title: '会员专享折扣',
    link: '/profile'
  }
]

// Mock首页配置数据
export const mockHomePageData: HomePageData = {
  components: [
    {
      type: 'carousel',
      id: 'carousel-1',
      config: {
        height: '200px',
        autoplay: true,
        interval: 3000
      },
      data: mockCarouselItems
    },
    {
      type: 'seckill',
      id: 'seckill-1',
      config: {
        title: '限时秒杀'
      },
      data: {
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        products: mockProducts.slice(0, 4)
      }
    },
    {
      type: 'productList',
      id: 'productList-1',
      config: {
        title: '精选推荐',
        columns: 2
      },
      data: mockProducts.slice(0, 4)
    },
    {
      type: 'groupbuy',
      id: 'groupbuy-1',
      config: {
        title: '热门团购'
      },
      data: mockProducts.slice(4, 8)
    },
    {
      type: 'guessYouLike',
      id: 'guessYouLike-1',
      config: {
        title: '猜你喜欢'
      },
      data: mockProducts
    }
  ]
}

// Mock分类数据 - 支持二级分类
import { Category } from '@/types/product'

export const mockCategories: Category[] = [
  {
    id: 'new',
    name: '新品',
    icon: '✨',
    subCategories: [
      {
        id: 'new-bags',
        name: '手袋新品',
        products: mockProducts.filter(p => p.category === 'bags' && p.tag === '新品')
      },
      {
        id: 'new-watches',
        name: '手表新品',
        products: mockProducts.filter(p => p.category === 'watches' && p.tag === '新品')
      },
      {
        id: 'new-accessories',
        name: '配饰新品',
        products: mockProducts.filter(p => p.category === 'accessories' && p.tag === '新品')
      },
      {
        id: 'new-clothing',
        name: '服装新品',
        products: mockProducts.filter(p => p.category === 'clothing' && p.tag === '新品')
      },
      {
        id: 'new-jewelry',
        name: '珠宝新品',
        products: mockProducts.filter(p => p.category === 'jewelry' && p.tag === '新品')
      },
      {
        id: 'new-shoes',
        name: '鞋履新品',
        products: mockProducts.filter(p => p.category === 'shoes' && p.tag === '新品')
      }
    ]
  },
  {
    id: 'bags',
    name: '手袋',
    icon: '👜',
    subCategories: [
      {
        id: 'bags-2025',
        name: '2025新款系列手袋',
        products: mockProducts.filter(p => p.category === 'bags').slice(0, 1)
      },
      {
        id: 'bags-2024',
        name: '2024经典款手袋',
        products: mockProducts.filter(p => p.category === 'bags')
      },
      {
        id: 'bags-designer',
        name: '设计师联名手袋',
        products: mockProducts.filter(p => p.category === 'bags')
      }
    ]
  },
  {
    id: 'watches',
    name: '手表',
    icon: '⌚',
    subCategories: [
      {
        id: 'watches-swiss',
        name: '瑞士系列手表',
        products: mockProducts.filter(p => p.category === 'watches')
      },
      {
        id: 'watches-smart',
        name: '智能系列手表',
        products: mockProducts.filter(p => p.category === 'watches')
      },
      {
        id: 'watches-classic',
        name: '经典系列手表',
        products: mockProducts.filter(p => p.category === 'watches')
      }
    ]
  },
  {
    id: 'accessories',
    name: '配饰',
    icon: '💍',
    subCategories: [
      {
        id: 'accessories-scarf',
        name: '真丝围巾系列',
        products: mockProducts.filter(p => p.category === 'accessories' && p.id === '3')
      },
      {
        id: 'accessories-sunglasses',
        name: '太阳镜系列',
        products: mockProducts.filter(p => p.category === 'accessories' && p.id === '8')
      },
      {
        id: 'accessories-other',
        name: '其他配饰',
        products: mockProducts.filter(p => p.category === 'accessories')
      }
    ]
  },
  {
    id: 'clothing',
    name: '服装',
    icon: '👗',
    subCategories: [
      {
        id: 'clothing-2025',
        name: '2025新款系列',
        products: mockProducts.filter(p => p.category === 'clothing')
      },
      {
        id: 'clothing-2024',
        name: '2024经典款',
        products: mockProducts.filter(p => p.category === 'clothing')
      },
      {
        id: 'clothing-designer',
        name: '设计师联名',
        products: mockProducts.filter(p => p.category === 'clothing')
      }
    ]
  },
  {
    id: 'jewelry',
    name: '珠宝',
    icon: '💎',
    subCategories: [
      {
        id: 'jewelry-diamond',
        name: '钻石系列',
        products: mockProducts.filter(p => p.category === 'jewelry')
      },
      {
        id: 'jewelry-pearl',
        name: '珍珠系列',
        products: mockProducts.filter(p => p.category === 'jewelry')
      },
      {
        id: 'jewelry-other',
        name: '其他珠宝',
        products: mockProducts.filter(p => p.category === 'jewelry')
      }
    ]
  },
  {
    id: 'shoes',
    name: '鞋履',
    icon: '👠',
    subCategories: [
      {
        id: 'shoes-2025',
        name: '2025新款系列',
        products: mockProducts.filter(p => p.category === 'shoes').slice(1, 2)
      },
      {
        id: 'shoes-2024',
        name: '2024经典款',
        products: mockProducts.filter(p => p.category === 'shoes').slice(0, 1)
      },
      {
        id: 'shoes-designer',
        name: '设计师联名',
        products: mockProducts.filter(p => p.category === 'shoes')
      }
    ]
  }
]

