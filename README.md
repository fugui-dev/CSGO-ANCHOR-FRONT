# 主播管理系统

独立的主播管理前端项目，用于主播查看推荐用户列表、消费记录、生成CDK和管理可用余额。

## 技术栈

- Vue 3
- Element Plus
- Vue Router
- Pinia
- Axios
- Vite

## 功能特性

1. **推荐用户列表**
   - 查看所有推荐用户
   - 显示用户头像、昵称、推荐时间
   - 支持查看单个用户的消费记录

2. **消费记录**
   - 查看推荐用户的开箱和对战消费记录
   - 支持按用户筛选
   - 显示消费金额、时间、类型等详细信息

3. **生成CDK**
   - 生成充值卡密
   - 支持设置面额和数量
   - 一键复制CDK卡号和密码

4. **可用余额**
   - 实时显示可用余额
   - 在首页和生成CDK时显示

## 安装和运行

```bash
# 安装依赖
npm install

# 开发环境运行
npm run dev

# 生产环境构建
npm run build

# 预览构建结果
npm run preview
```

## 项目结构

```
CSGO-ANCHOR-FRONT/
├── src/
│   ├── api/          # API接口
│   ├── assets/       # 静态资源
│   ├── components/   # 公共组件
│   ├── layout/       # 布局组件
│   ├── router/       # 路由配置
│   ├── store/        # 状态管理
│   ├── utils/        # 工具函数
│   └── views/        # 页面组件
│       ├── login/    # 登录页
│       ├── dashboard/# 首页
│       ├── users/    # 推荐用户列表
│       └── consumption/ # 消费记录
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 注意事项

1. 只有主播用户（userType === '01'）才能访问此系统
2. 需要后端提供以下接口：
   - `/api/user/promotionUsers/{page}/{size}` - 获取推荐用户列表
   - `/api/user/promotionConsumptionRecords` - 获取消费记录（需要后端实现）
   - `/api/user/availableBalance` - 获取可用余额
   - `/api/user/generateCardInfo` - 生成CDK信息
   - `/api/user/createGenerateCard` - 创建CDK

## 部署

构建后的文件在 `dist` 目录，可以部署到任何静态文件服务器。

