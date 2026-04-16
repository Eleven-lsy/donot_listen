# 不听听力 - 英语四六级听力训练平台

## 项目简介

这是一个英语四六级听力训练平台，支持：

- 🎧 听力材料播放与字幕同步
- 📝 学习记录统计
- ⭐ 收藏管理
- 🤖 AI 智能讲解
- 💰 打赏支持

## 技术栈

### 后端
- Spring Boot 3.2.5
- Spring Security + JWT
- Spring Data JPA
- MyBatis
- MySQL 8.0

### 前端
- 原生 JavaScript (ES6+)
- HTML5 / CSS3
- Vite (构建工具)

## 快速开始

### 环境要求

- JDK 17+
- Node.js 16+
- MySQL 8.0+
- Maven 3.8+

### 1. 克隆项目

```bash
git clone <repository-url>
cd donot_listen
```

### 2. 配置数据库

创建 MySQL 数据库：

```sql
CREATE DATABASE donot_listen CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

复制环境变量配置：

```bash
cp .env.example .env
# 编辑 .env 填入数据库密码等信息
```

### 3. 启动后端

```bash
cd dl
mvn spring-boot:run
```

或者打包运行：

```bash
mvn package -DskipTests
java -jar target/dl-0.0.1-SNAPSHOT.jar
```

### 4. 启动前端（开发模式）

```bash
cd qianduan
npm install
npm run dev
```

### 5. 使用 Docker 部署

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 项目结构

```
donot_listen/
├── dl/                          # Spring Boot 后端
│   ├── src/main/java/           # Java 源代码
│   ├── src/main/resources/      # 配置文件
│   └── pom.xml                 # Maven 配置
│
├── qianduan/                   # 前端资源
│   ├── controllers/            # 页面控制器
│   ├── core/                  # 核心应用逻辑
│   ├── audio/                 # 音频文件
│   └── image/                 # 图片资源
│
├── nginx/                      # Nginx 配置
├── docker-compose.yml          # Docker 编排
├── Dockerfile                  # 后端镜像构建
└── .env.example               # 环境变量示例
```

## API 文档

### 认证接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/logout | 用户登出 |

### 听力接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/listening/list | 获取听力列表 |
| GET | /api/listening/detail/{id} | 获取听力详情 |
| GET | /api/listening/transcript/{id} | 获取原文 |
| GET | /api/listening/set | 获取整套听力 |

### 用户接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/user/profile | 获取用户信息 |
| GET | /api/user/collections | 获取收藏列表 |
| POST | /api/user/collections | 添加收藏 |
| DELETE | /api/user/collections/{id} | 删除收藏 |

## 配置说明

### 开发环境

使用 `application-dev.properties`：

```properties
spring.profiles.active=dev
```

### 生产环境

使用 `application-prod.properties`：

```properties
spring.profiles.active=prod
DB_HOST=your-production-db-host
JWT_SECRET=your-production-secret
```

## 构建发布

### 前端构建

```bash
cd qianduan
npm run build
```

### 后端构建

```bash
cd dl
mvn package -DskipTests
```

### Docker 镜像构建

```bash
docker build -t donot-listen .
```

## 许可证

MIT License
