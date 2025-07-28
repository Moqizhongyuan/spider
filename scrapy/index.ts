/**
 * ScrapyTS - TypeScript爬虫框架
 * 简单易用的网络爬虫框架，灵感来自Python的Scrapy
 */

import { ItemPipeline } from './core/pipeline';

// 导出核心组件
export { Item, WebPageItem, BlogItem } from './core/item';
export { Spider, Request, Response } from './core/spider';
export { 
  ItemPipeline, 
  ValidationPipeline, 
  JsonWriterPipeline, 
  TextWriterPipeline
} from './core/pipeline';
export { CrawlerEngine, EngineSettings } from './core/engine';

// 导出示例爬虫
export { BlogSpider } from './examples/blog-spider';

/**
 * 快速启动函数
 * 使用默认配置快速运行爬虫
 */
export async function runSpider(
  spider: any, 
  options: {
    outputDir?: string;
    outputFormat?: 'json' | 'text' | 'both';
    concurrent?: number;
    delay?: number;
  } = {}
) {
  const { CrawlerEngine } = await import('./core/engine');
  const { 
    ValidationPipeline, 
    JsonWriterPipeline, 
    TextWriterPipeline
  } = await import('./core/pipeline');

  const pipelines: ItemPipeline[] = [];
  
  // 添加验证管道
  pipelines.push(new ValidationPipeline());
  
  // 根据输出格式添加相应管道
  const outputDir = options.outputDir || 'output';
  
  if (options.outputFormat === 'json' || options.outputFormat === 'both' || !options.outputFormat) {
    pipelines.push(new JsonWriterPipeline(outputDir));
  }
  
  if (options.outputFormat === 'text' || options.outputFormat === 'both') {
    pipelines.push(new TextWriterPipeline(outputDir));
  }

  // 创建引擎并运行
  const engine = new CrawlerEngine({
    concurrentRequests: options.concurrent || 4,
    delay: options.delay || 1,
    pipelines
  });

  await engine.crawl(spider);
  return engine.getStats();
} 