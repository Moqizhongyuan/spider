/**
 * 数据项基类
 * 用于定义爬虫要抓取的数据结构
 */
export abstract class Item {
  [key: string]: any;

  constructor(data: Record<string, any> = {}) {
    Object.assign(this, data);
  }

  /**
   * 转换为JSON格式
   */
  toJSON(): Record<string, any> {
    return { ...this };
  }

  /**
   * 验证数据完整性
   */
  abstract validate(): boolean;
}

/**
 * 网页数据项
 */
export class WebPageItem extends Item {
  title?: string;
  url?: string;
  content?: string;
  links?: string[];
  extractTime?: Date;

  constructor(data: Record<string, any> = {}) {
    super(data);
    this.extractTime = new Date();
  }

  validate(): boolean {
    return !!(this.title && this.url && this.content);
  }
}

/**
 * 博客文章数据项
 */
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