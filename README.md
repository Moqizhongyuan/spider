# Spider with US Proxy

这是一个使用美国代理服务器的网页爬虫项目。

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.local.env.example` 到 `.local.env` 并填入你的代理配置：

```bash
# 代理服务器配置
PROXY_HOST=dc.oxylabs.io
PROXY_PORT=8003
PROXY_USERNAME=your-username
PROXY_PASSWORD=your-password

# 其他配置
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
```

### 3. 运行爬虫

```bash
# 使用美国代理爬虫
pnpm run spider:us

# 或直接运行
npx ts-node src/perlWithAmericaIp.ts
```

## 📁 项目结构

```
spider/
├── src/
│   ├── perlWithAmericaIp.ts     # 美国代理爬虫
│   └── perl.ts                  # 普通爬虫
├── output/                      # 爬取结果输出目录
├── .local.env                   # 环境变量配置 (不提交到git)
├── .gitignore                   # Git忽略文件
└── README.md                    # 项目说明
```

## 🔒 安全说明

- `.local.env` 文件包含敏感信息，已被添加到 `.gitignore`
- 不要将代理认证信息提交到版本控制系统
- 定期更换代理密码以确保安全

## 🌍 支持的功能

- ✅ 美国代理服务器支持
- ✅ 环境变量配置
- ✅ JSON/HTML 响应处理
- ✅ 链接提取
- ✅ 详细的错误处理
- ✅ 结果文件自动保存

## 📝 输出格式

爬虫会生成带时间戳的结果文件，包含：

- 代理服务器信息
- 响应内容
- 提取的链接列表
- 详细的抓取统计

## ⚙️ 环境变量说明

| 变量名           | 说明           | 必需 |
| ---------------- | -------------- | ---- |
| `PROXY_HOST`     | 代理服务器地址 | ✅   |
| `PROXY_PORT`     | 代理服务器端口 | ✅   |
| `PROXY_USERNAME` | 代理用户名     | ✅   |
| `PROXY_PASSWORD` | 代理密码       | ✅   |
| `USER_AGENT`     | 浏览器标识     | ❌   |

## 🔧 故障排除

### 代理认证失败 (407 错误)

- 检查用户名和密码是否正确
- 确认 `.local.env` 文件存在且格式正确

### 连接超时

- 检查网络连接
- 确认代理服务器地址和端口

### 环境变量未加载

- 确保 `.local.env` 文件在项目根目录
- 检查文件编码为 UTF-8
