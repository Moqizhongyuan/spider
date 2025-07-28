import * as fs from 'fs';
import * as path from 'path';
import { Item } from './item';
import { Spider } from './spider';

/**
 * 数据处理管道基类
 */
export abstract class ItemPipeline {
  /**
   * 处理数据项
   * @param item 数据项
   * @param spider 爬虫实例
   * @returns 处理后的数据项或null（丢弃该项）
   */
  abstract processItem(item: Item, spider: Spider): Promise<Item | null>;

  /**
   * 管道开启时调用
   */
  openSpider(spider: Spider): void {
    console.log(`管道 ${this.constructor.name} 已为爬虫 ${spider.name} 开启`);
  }

  /**
   * 管道关闭时调用
   */
  closeSpider(spider: Spider): void {
    console.log(`管道 ${this.constructor.name} 已为爬虫 ${spider.name} 关闭`);
  }
}

/**
 * 数据验证管道
 */
export class ValidationPipeline extends ItemPipeline {
  async processItem(item: Item, spider: Spider): Promise<Item | null> {
    if (!item.validate()) {
      console.warn(`数据验证失败，丢弃项目: ${JSON.stringify(item)}`);
      return null;
    }
    return item;
  }
}

/**
 * JSON文件输出管道
 */
export class JsonWriterPipeline extends ItemPipeline {
  private outputDir: string;
  private items: Item[] = [];

  constructor(outputDir: string = 'output') {
    super();
    this.outputDir = outputDir;
  }

  openSpider(spider: Spider): void {
    super.openSpider(spider);
    // 确保输出目录存在
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    this.items = [];
  }

  async processItem(item: Item, spider: Spider): Promise<Item | null> {
    this.items.push(item);
    return item;
  }

  closeSpider(spider: Spider): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${spider.name}-${timestamp}.json`;
    const filePath = path.join(this.outputDir, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(this.items, null, 2), 'utf8');
    console.log(`已保存 ${this.items.length} 个数据项到: ${filePath}`);
    
    super.closeSpider(spider);
  }
}

/**
 * 文本文件输出管道
 */
export class TextWriterPipeline extends ItemPipeline {
  private outputDir: string;
  private fileContent: string = '';

  constructor(outputDir: string = 'output') {
    super();
    this.outputDir = outputDir;
  }

  openSpider(spider: Spider): void {
    super.openSpider(spider);
    // 确保输出目录存在
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    // 初始化文件内容
    this.fileContent = '';
    this.fileContent += '='.repeat(60) + '\n';
    this.fileContent += `ScrapyTS 爬取结果\n`;
    this.fileContent += `爬虫名称: ${spider.name}\n`;
    this.fileContent += `开始时间: ${new Date().toLocaleString('zh-CN')}\n`;
    this.fileContent += '='.repeat(60) + '\n\n';
  }

  async processItem(item: Item, spider: Spider): Promise<Item | null> {
    // 格式化输出单个数据项
    this.fileContent += `--- 数据项 ${new Date().toLocaleString()} ---\n`;
    
    for (const [key, value] of Object.entries(item.toJSON())) {
      if (key === 'content' && typeof value === 'string' && value.length > 1000) {
        // 内容太长时只显示前500字符
        this.fileContent += `${key}: ${value.substring(0, 500)}...\n`;
      } else if (Array.isArray(value)) {
        this.fileContent += `${key}: [\n`;
        value.forEach((v, i) => {
          this.fileContent += `  ${i + 1}. ${v}\n`;
        });
        this.fileContent += `]\n`;
      } else {
        this.fileContent += `${key}: ${value}\n`;
      }
    }
    this.fileContent += '\n';

    return item;
  }

  closeSpider(spider: Spider): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${spider.name}-${timestamp}.txt`;
    const filePath = path.join(this.outputDir, fileName);
    
    this.fileContent += '='.repeat(60) + '\n';
    this.fileContent += `抓取完成时间: ${new Date().toLocaleString('zh-CN')}\n`;
    this.fileContent += '='.repeat(60) + '\n';
    
    fs.writeFileSync(filePath, this.fileContent, 'utf8');
    console.log(`抓取结果已保存到: ${filePath}`);
    
    super.closeSpider(spider);
  }
}

