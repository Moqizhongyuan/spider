import axios, { AxiosResponse } from 'axios';
import { Item } from './item';

/**
 * 请求对象
 */
export interface Request {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  data?: any;
  meta?: Record<string, any>;
}

/**
 * 响应对象
 */
export interface Response {
  url: string;
  text: string;
  status: number;
  headers: Record<string, string>;
  request: Request;
}

/**
 * 爬虫基类
 */
export abstract class Spider {
  name: string;
  startUrls: string[];
  customSettings?: Record<string, any>;

  constructor(name: string, startUrls: string[] = []) {
    this.name = name;
    this.startUrls = startUrls;
  }

  /**
   * 生成初始请求
   */
  startRequests(): Request[] {
    return this.startUrls.map(url => ({
      url,
      method: 'GET' as const
    }));
  }

  /**
   * 发送HTTP请求
   */
  async makeRequest(request: Request): Promise<Response> {
    try {
      const axiosResponse: AxiosResponse<string> = await axios({
        method: request.method || 'GET',
        url: request.url,
        headers: {
          'User-Agent': 'ScrapyTS/1.0.0',
          ...request.headers
        },
        data: request.data
      });

      return {
        url: request.url,
        text: axiosResponse.data,
        status: axiosResponse.status,
        headers: axiosResponse.headers as Record<string, string>,
        request
      };
    } catch (error) {
      throw new Error(`请求失败: ${request.url} - ${error}`);
    }
  }

  /**
   * 解析响应（需要子类实现）
   */
  abstract parse(response: Response): AsyncGenerator<Item | Request, void, unknown>;

  /**
   * 提取链接的辅助方法
   */
  protected extractLinks(html: string, baseUrl?: string): string[] {
    const linkMatches = [...html.matchAll(/href=["'](.*?)["']/g)];
    const links = linkMatches.map(match => match[1]);
    
    if (baseUrl) {
      return links.map(link => {
        if (link.startsWith('http')) return link;
        if (link.startsWith('/')) return new URL(link, baseUrl).href;
        return new URL(link, baseUrl).href;
      });
    }
    
    return links;
  }

  /**
   * 提取文本内容的辅助方法
   */
  protected extractText(html: string): string {
    // 简单的HTML标签移除
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 提取标题的辅助方法
   */
  protected extractTitle(html: string): string {
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : '';
  }

  /**
   * 爬虫关闭时的清理工作
   */
  closed(): void {
    console.log(`爬虫 ${this.name} 已关闭`);
  }
} 