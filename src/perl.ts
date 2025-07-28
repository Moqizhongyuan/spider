import axios, { AxiosResponse } from 'axios';

interface LinkExtractor {
  url: string;
  extractLinks(content: string): string[];
  run(): Promise<void>;
}

class WebSpider implements LinkExtractor {
  public url: string;

  constructor(url: string) {
    this.url = url;
  }

  extractLinks(content: string): string[] {
    const linkMatches = [...content.matchAll(/href=["'](.*?)["']/g)];
    return linkMatches.map((match) => match[1]);
  }

  async run(): Promise<void> {
    try {
      const response: AxiosResponse<string> = await axios.get(this.url);
      const content: string = response.data;

      console.log("=== 页面内容预览（前5000字符） ===");
      console.log(content.slice(0, 5000));

      console.log("\n=== 提取的链接 ===");
      const links: string[] = this.extractLinks(content);
      
      for (const link of links) {
        console.log(link);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("无法获取页面内容：", error.message);
      } else {
        console.error("发生未知错误：", error);
      }
    }
  }
}

// 使用爬虫
const spider = new WebSpider("https://markdown-blog-bay.vercel.app/about");
spider.run(); 