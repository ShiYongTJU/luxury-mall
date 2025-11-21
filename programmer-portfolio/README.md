# programmer-portfolio

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## 微信小程序（mock数据）

`miniprogram/` 目录包含基于微信开发者工具的智能零售小程序，具备首页概览、地址管理、订单查询、支付收银、优惠券与会员充值等功能，全部数据来自内置 mock。

1. 打开微信开发者工具，选择 “导入项目”，目录指向 `miniprogram/`。
2. appid 可使用 `touristappid` 进行本地预览。
3. 通过 tabBar 可访问首页 / 订单 / 领券 / 会员，其他功能入口位于首页快捷区或会员页。
4. Mock 服务位于 `miniprogram/utils/mock.js`，可按需扩展数据或接入真实接口。
