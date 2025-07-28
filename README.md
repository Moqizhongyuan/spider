# Spider 🕷️

一个简单高效的网络爬虫工具，使用 TypeScript 开发，专注于网页内容抓取和链接提取。

## ✨ 功能特性

- 🌐 **网页内容抓取**：获取指定 URL 的完整 HTML 内容
- 🔗 **链接提取**：自动提取页面中的所有超链接
- 📝 **内容预览**：显示页面内容的前 5000 字符预览
- 🛠️ **TypeScript 支持**：完整的类型定义和接口设计
- 🐛 **VSCode 调试**：内置调试配置，支持断点调试
- ⚡ **异步处理**：基于 Promise 的异步网络请求

## 🏗️ 项目结构

```
spider/
├── src/
│   └── perl.ts          # 主要爬虫实现
├── .vscode/
│   └── launch.json      # VSCode调试配置
├── package.json         # 项目配置和依赖
├── tsconfig.json        # TypeScript配置
├── .gitignore          # Git忽略文件
└── README.md           # 项目说明文档
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- pnpm 或 npm

### 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 运行爬虫

```bash
# 开发模式运行
pnpm dev

# 或直接运行TypeScript文件
npx ts-node src/perl.ts

# 构建并运行
pnpm build
pnpm start
```

## 📖 使用说明

### 基础用法

爬虫的核心是 `WebSpider` 类，实现了 `LinkExtractor` 接口：

```typescript
import { WebSpider } from "./src/perl";

// 创建爬虫实例
const spider = new WebSpider("https://example.com");

// 运行爬虫
await spider.run();
```

### 自定义目标 URL

修改 `src/perl.ts` 文件中的目标 URL：

```typescript
// 默认配置
const spider = new WebSpider("https://markdown-blog-bay.vercel.app/about");

// 修改为你想爬取的网站
const spider = new WebSpider("https://your-target-website.com");
```

## 🛠️ 开发工具

### VSCode 调试

项目配置了 VSCode 调试支持：

1. 在 VSCode 中打开项目
2. 设置断点
3. 按 `F5` 启动调试
4. 选择 "调试 perl.ts" 或 "调试当前文件"

### 可用脚本

```bash
pnpm build     # 编译TypeScript到dist目录
pnpm start     # 运行编译后的代码
pnpm dev       # 开发模式运行
pnpm watch     # 监听文件变化并自动编译
```

## 📋 核心 API

### WebSpider 类

#### 构造函数

```typescript
constructor(url: string)
```

- `url`: 要爬取的目标网站 URL

#### 方法

##### `extractLinks(content: string): string[]`

从 HTML 内容中提取所有链接

- `content`: HTML 字符串
- 返回: 链接数组

##### `run(): Promise<void>`

执行爬虫任务

- 获取网页内容
- 显示内容预览
- 提取并显示所有链接

## 🎯 输出示例

```
=== 页面内容预览（前5000字符） ===
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    ...

=== 提取的链接 ===
/home
/about
/contact
https://github.com/example
mailto:contact@example.com
```

## 🔧 技术栈

- **运行时**: Node.js
- **语言**: TypeScript 5.6.0
- **HTTP 客户端**: Axios 1.11.0
- **开发工具**: ts-node 10.9.2
- **类型定义**: @types/node 22.0.0

## 🚦 错误处理

爬虫内置了完善的错误处理机制：

- ✅ 网络请求失败处理
- ✅ 类型错误捕获
- ✅ 详细的错误信息输出
- ✅ 程序异常保护

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目使用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](../../issues)
- 发送邮件至项目维护者

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
