# 不听听力 - 英语听力训练平台

## 🚀 快速开始

### 启动开发服务器

双击运行 `start.bat` 或在命令行中执行：

```bash
python -m http.server 3000
```

然后在浏览器访问：http://localhost:3000

### 项目结构

```
donot_listen/
├── controllers/              # 控制器层
│   ├── PlayerController.js      # 播放器控制器
│   ├── LoginController.js       # 登录控制器
│   ├── LearningRecordsController.js  # 学习记录控制器
│   ├── FavoritesController.js    # 收藏控制器
│   └── SettingsController.js     # 设置控制器
├── core/                    # 核心应用
│   └── App.js               # 主应用类
├── 公共模块
│   ├── api-service.js        # API 服务层
│   ├── state-manager.js      # 状态管理
│   ├── ui-components.js     # UI 组件
│   ├── navigation.js        # 导航配置
│   └── script.js           # 入口脚本
├── HTML 页面
│   ├── login.html           # 登录页
│   ├── index.html          # 首页（播放器）
│   ├── learning-records.html # 学习记录页
│   ├── favorites.html      # 收藏夹页
│   └── settings.html       # 设置页
├── styles.css              # 样式文件
└── start.bat              # 启动脚本
```

### 技术栈

- **前端框架**：原生 JavaScript (ES6+)
- **样式**：CSS3 + CSS Variables
- **状态管理**：自定义 Store 模式
- **API 通信**：Fetch API + Promise
- **服务器**：Python http.server（开发环境）

### 主要功能

- ✅ 用户登录/注册（支持演示模式）
- ✅ 听力播放器（支持倍速、循环、原文显示）
- ✅ 学习反馈系统（听懂/熟悉/陌生）
- ✅ 收藏管理
- ✅ 学习记录统计
- ✅ 用户设置（深色模式、播放速度等）

### 数据规范

#### localStorage.user
```json
{
  "id": "用户ID",
  "username": "用户名",
  "email": "邮箱",
  "avatar": "头像URL",
  "demo": false
}
```

#### localStorage.token
- 存储裸 token（不含 Bearer 前缀）
- 请求时由 ApiService 统一添加 Bearer

### 开发说明

#### API 服务
- 所有 API 请求通过 `api-service.js` 的 ApiService 类
- 自动添加 Authorization 头
- 支持请求缓存
- 错误处理和降级处理

#### 状态管理
- 使用自定义 Store 模式
- 支持订阅机制
- 支持中间件

#### 控制器模式
- 每个页面一个控制器
- 统一的初始化流程
- 演示模式数据降级

### 浏览器支持

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### 许可证

MIT License
