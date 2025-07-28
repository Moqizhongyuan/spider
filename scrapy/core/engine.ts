import { Spider, Request, Response } from './spider';
import { Item } from './item';
import { ItemPipeline } from './pipeline';

/**
 * 爬虫引擎配置
 */
export interface EngineSettings {
  concurrentRequests?: number;
  delay?: number;
  randomizeDelay?: number;
  retryTimes?: number;
  pipelines?: ItemPipeline[];
}

/**
 * 爬虫引擎
 * 负责调度请求、处理响应、管理管道
 */
export class CrawlerEngine {
  private settings: EngineSettings;
  private requestQueue: Request[] = [];
  private runningRequests = new Set<Promise<void>>();
  private isRunning = false;
  private stats = {
    requestsSent: 0,
    responsesReceived: 0,
    itemsScraped: 0,
    itemsDropped: 0
  };

  constructor(settings: EngineSettings = {}) {
    this.settings = {
      concurrentRequests: 8,
      delay: 0,
      randomizeDelay: 0.5,
      retryTimes: 2,
      pipelines: [],
      ...settings
    };
  }

  /**
   * 运行爬虫
   */
  async crawl(spider: Spider): Promise<void> {
    console.log(`开始运行爬虫: ${spider.name}`);
    
    this.isRunning = true;
    this.stats = { requestsSent: 0, responsesReceived: 0, itemsScraped: 0, itemsDropped: 0 };

    // 初始化管道
    this.settings.pipelines?.forEach(pipeline => {
      pipeline.openSpider(spider);
    });

    try {
      // 添加初始请求到队列
      const startRequests = spider.startRequests();
      this.requestQueue.push(...startRequests);

      // 开始处理请求队列
      await this.processQueue(spider);

      // 等待所有运行中的请求完成
      await Promise.all(this.runningRequests);

    } finally {
      // 关闭管道
      this.settings.pipelines?.forEach(pipeline => {
        pipeline.closeSpider(spider);
      });

      spider.closed();
      this.isRunning = false;
      
      console.log(`爬虫 ${spider.name} 完成统计:`);
      console.log(`- 发送请求: ${this.stats.requestsSent}`);
      console.log(`- 接收响应: ${this.stats.responsesReceived}`);
      console.log(`- 抓取数据项: ${this.stats.itemsScraped}`);
      console.log(`- 丢弃数据项: ${this.stats.itemsDropped}`);
    }
  }

  /**
   * 处理请求队列
   */
  private async processQueue(spider: Spider): Promise<void> {
    while (this.isRunning && (this.requestQueue.length > 0 || this.runningRequests.size > 0)) {
      // 控制并发数量
      while (this.runningRequests.size < (this.settings.concurrentRequests || 8) && this.requestQueue.length > 0) {
        const request = this.requestQueue.shift()!;
        const requestPromise = this.processRequest(spider, request);
        this.runningRequests.add(requestPromise);
        
        // 清理完成的请求
        requestPromise.finally(() => {
          this.runningRequests.delete(requestPromise);
        });
      }

      // 如果没有运行中的请求，退出循环
      if (this.runningRequests.size === 0) {
        break;
      }

      // 等待至少一个请求完成
      await Promise.race(this.runningRequests);
    }
  }

  /**
   * 处理单个请求
   */
  private async processRequest(spider: Spider, request: Request, retryCount = 0): Promise<void> {
    try {
      // 添加延迟
      if (this.settings.delay! > 0) {
        const delay = this.settings.delay! + 
          (Math.random() * (this.settings.randomizeDelay || 0) * this.settings.delay!);
        await this.sleep(delay * 1000);
      }

      console.log(`处理请求: ${request.url}`);
      this.stats.requestsSent++;

      // 发送请求
      const response = await spider.makeRequest(request);
      this.stats.responsesReceived++;

      // 解析响应
      const parser = spider.parse(response);
      
      for await (const result of parser) {
        if (this.isItem(result)) {
          // 处理数据项
          await this.processItem(result, spider);
        } else {
          // 添加新请求到队列
          this.requestQueue.push(result);
        }
      }

    } catch (error) {
      console.error(`请求失败: ${request.url} - ${error}`);
      
      // 重试逻辑
      if (retryCount < (this.settings.retryTimes || 2)) {
        console.log(`重试请求 (${retryCount + 1}/${this.settings.retryTimes}): ${request.url}`);
        await this.processRequest(spider, request, retryCount + 1);
      } else {
        console.error(`请求最终失败: ${request.url}`);
      }
    }
  }

  /**
   * 处理数据项，通过管道
   */
  private async processItem(item: Item, spider: Spider): Promise<void> {
    let currentItem: Item | null = item;

    for (const pipeline of this.settings.pipelines || []) {
      if (currentItem) {
        currentItem = await pipeline.processItem(currentItem, spider);
      }
    }

    if (currentItem) {
      this.stats.itemsScraped++;
    } else {
      this.stats.itemsDropped++;
    }
  }

  /**
   * 判断是否为数据项
   */
  private isItem(obj: any): obj is Item {
    return obj && typeof obj === 'object' && typeof obj.validate === 'function';
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 停止爬虫
   */
  stop(): void {
    console.log('正在停止爬虫...');
    this.isRunning = false;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return { ...this.stats };
  }
} 