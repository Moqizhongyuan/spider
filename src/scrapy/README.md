# ScrapyTS 🕷️

一个简单易用的 TypeScript 网络爬虫框架，灵感来自 Python 的 Scrapy 框架。专为现代 JavaScript/TypeScript 开发者设计，提供了清晰的架构和强大的功能。

## ✨ 框架特性

- 🚀 **TypeScript 原生支持**：完整的类型定义和编译时检查
- 🕷 ️**类 Scrapy 架构**：熟悉的 Spider、Item、Pipeline 概念
- ⚡ **异步并发**：基于 Promise 的高性能异步处理
- 🔧 **可扩展管道**：灵活的数据处理管道系统
- 📊 **内置统计**：请求统计、成功率监控
- 🎯 **深度控制**：防止无限递归的智能深度管理
- 💾 **多种输出格式**：支持 JSON、TXT 等格式输出

## 🏗️ 框架架构

```
scrapy/
├── core/                 # 核心组件
│   ├── item.ts          # 数据模型定义
│   ├── spider.ts        # 爬虫基类
│   ├── pipeline.ts      # 数据处理管道
│   └── engine.ts        # 爬虫引擎
├── examples/            # 示例代码
│   ├── blog-spider.ts   # 博客爬虫示例
│   └── run-blog-spider.ts # 运行脚本
└── index.ts            # 框架入口
```

## 🚀 快速开始

### 1. 运行示例爬虫

```bash
# 运行博客爬虫示例
npx ts-node scrapy/examples/run-blog-spider.ts
```

### 2. 创建自定义爬虫

```typescript
import { Spider, Response, BlogItem } from "../scrapy";

export class MySpider extends Spider {
  constructor() {
    super("my-spider", ["https://example.com"]);
  }

  async *parse(response: Response) {
    // 提取数据
    const title = this.extractTitle(response.text);
    const content = this.extractText(response.text);
    const links = this.extractLinks(response.text);

    // 创建数据项
    yield new BlogItem({
      title,
      content,
      links,
      author: "Unknown",
    });
  }
}
```

### 3. 使用快速启动函数

```typescript
import { MySpider, runSpider } from "../scrapy";

const spider = new MySpider();
const stats = await runSpider(spider, {
  outputDir: "output",
  outputFormat: "both", // json + text
  concurrent: 4,
  delay: 1,
});
```

## 📋 核心组件详解

### Item（数据模型）

定义要抓取的数据结构：

```typescript
export class BlogItem extends Item {
  title?: string;
  author?: string;
  content?: string;
  links?: string[];
  publishDate?: Date;
  tags?: string[];

  validate(): boolean {
    return !!(this.title && this.content);
  }
}
```

### Spider（爬虫）

核心爬虫逻辑：

```typescript
export class MySpider extends Spider {
  // 起始URL
  constructor() {
    super('spider-name', ['https://example.com']);
  }

  // 解析响应
  async *parse(response: Response) {
    // 返回Item或新的Request
    yield new MyItem({ ... });
    yield { url: 'https://example.com/page2' };
  }
}
```

### Pipeline（数据管道）

处理抓取的数据：

```typescript
export class CustomPipeline extends ItemPipeline {
  async processItem(item: Item, spider: Spider): Promise<Item | null> {
    // 数据处理逻辑
    if (item.validate()) {
      // 保存到数据库、文件等
      return item;
    }
    return null; // 丢弃无效数据
  }
}
```

### Engine（引擎）

调度和管理爬虫：

```typescript
const engine = new CrawlerEngine({
  concurrentRequests: 8, // 并发数
  delay: 1, // 请求间隔(秒)
  retryTimes: 2, // 重试次数
  pipelines: [
    // 数据管道
    new ValidationPipeline(),
    new TextWriterPipeline("output"),
  ],
});

await engine.crawl(spider);
```

## 🔧 内置管道

### ValidationPipeline

验证数据完整性，过滤无效数据

### DuplicatesPipeline

去除重复 URL 的数据项

### JsonWriterPipeline

将数据保存为 JSON 格式

### TextWriterPipeline

将数据保存为可读的文本格式

## 📊 抓取统计

```
爬虫 blog-spider 完成统计:
- 发送请求: 5
- 接收响应: 5
- 抓取数据项: 5
- 丢弃数据项: 0
```

## 🎯 深度控制

框架内置深度控制，防止无限递归：

```typescript
// 在parse方法中
const currentDepth = response.request.meta?.depth || 0;
if (currentDepth < maxDepth) {
  yield {
    url: newUrl,
    meta: { depth: currentDepth + 1 }
  };
}
```

## 📁 输出示例

生成的文本文件格式：

```
============================================================
ScrapyTS 爬取结果
爬虫名称: blog-spider
开始时间: 2025/7/28 15:12:52
============================================================

--- 数据项 2025/7/28 15:12:54 ---
title: Markdown博客
author: Moqizhongyuan
content: 页面内容...
links: [
  1. https://example.com/link1
  2. https://example.com/link2
]
publishDate: Mon Jul 28 2025 15:12:54 GMT+0800
tags: [
  1. NextJS
  2. TypeScript
]
```

## 🔥 与原版 Scrapy 对比

| 特性     | ScrapyTS            | Python Scrapy |
| -------- | ------------------- | ------------- |
| 语言     | TypeScript          | Python        |
| 类型安全 | ✅ 编译时检查       | ❌ 运行时错误 |
| 异步模型 | Promise/async-await | Twisted       |
| 学习曲线 | 简单直观            | 复杂配置      |
| 前端集成 | ✅ 天然支持         | ❌ 需要桥接   |
| 包管理   | npm/pnpm            | pip           |

## 💡 最佳实践

1. **合理设置并发数**：避免对目标网站造成过大压力
2. **添加请求延迟**：模拟人类访问行为
3. **深度控制**：避免无限递归抓取
4. **数据验证**：使用 ValidationPipeline 确保数据质量
5. **错误处理**：捕获和记录抓取过程中的错误

## 🛠️ 扩展开发

创建自定义管道：

```typescript
export class DatabasePipeline extends ItemPipeline {
  async processItem(item: Item) {
    // 保存到数据库
    await this.saveToDatabase(item);
    return item;
  }

  private async saveToDatabase(item: Item) {
    // 数据库操作逻辑
  }
}
```

## 📝 开发路线图

- [ ] 支持更多输出格式（CSV、XML 等）
- [ ] 集成常用数据库连接器
- [ ] 添加 Web UI 控制面板
- [ ] 支持分布式爬取
- [ ] 集成代理池管理
- [ ] 添加反爬虫绕过机制

---

🎉 **ScrapyTS 让 TypeScript 网络爬虫开发变得简单而强大！**
