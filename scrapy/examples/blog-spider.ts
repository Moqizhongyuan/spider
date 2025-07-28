import { Spider, Response, Request } from '../core/spider';
import { BlogItem } from '../core/item';

/**
 * 博客爬虫示例
 * 用于抓取 https://markdown-blog-bay.vercel.app/about 页面
 */
export class BlogSpider extends Spider {
  constructor() {
    super('blog-spider', ['https://markdown-blog-bay.vercel.app/about']);
  }

  /**
   * 解析博客页面
   */
  async *parse(response: Response): AsyncGenerator<BlogItem | Request, void, unknown> {
    console.log(`解析页面: ${response.url}`);

    // 提取页面标题
    const title = this.extractTitle(response.text);
    
    // 提取纯文本内容
    const textContent = this.extractText(response.text);
    
    // 提取所有链接
    const links = this.extractLinks(response.text, response.url);
    
    // 提取作者信息（从页面内容中提取）
    const author = this.extractAuthor(response.text);

    // 创建博客数据项
    const blogItem = new BlogItem({
      title: title,
      author: author,
      content: textContent,
      links: links,
      publishDate: new Date(),
      tags: ['NextJS', 'Markdown', 'Blog', 'TypeScript']
    });

    yield blogItem;

    // 提取并跟踪所有导航链接，由引擎层处理去重
    console.log(`开始抓取页面中的导航链接...`);
    const navigationLinks = this.extractNavigationLinks(response.text);
    for (const link of navigationLinks) {
      if (this.isValidUrl(link)) {
        yield {
          url: link,
          method: 'GET' as const
        };
      }
    }
  }

  /**
   * 提取作者信息
   */
  private extractAuthor(html: string): string {
    // 从HTML中提取作者信息
    const authorMatch = html.match(/我是\s*([\w\u4e00-\u9fa5]+)/);
    if (authorMatch) {
      return authorMatch[1];
    }

    // 从GitHub链接中提取
    const githubMatch = html.match(/@([A-Za-z0-9_-]+)/);
    if (githubMatch) {
      return githubMatch[1];
    }

    return 'Unknown';
  }

  /**
   * 提取博客特征信息
   */
  private extractBlogInfo(html: string): { [key: string]: any } {
    const info: { [key: string]: any } = {};

    // 提取技术栈信息
    if (html.includes('NextJS')) {
      info.framework = 'NextJS';
    }
    if (html.includes('Tailwind')) {
      info.styling = 'Tailwind CSS';
    }
    if (html.includes('Markdown')) {
      info.contentFormat = 'Markdown';
    }

    // 提取页面特点
    const features: string[] = [];
    if (html.includes('简洁的设计')) features.push('简洁设计');
    if (html.includes('SEO友好')) features.push('SEO优化');
    if (html.includes('完全静态')) features.push('静态部署');
    
    info.features = features;

    return info;
  }

  /**
   * 提取导航链接
   */
  private extractNavigationLinks(html: string): string[] {
    const navLinks: string[] = [];
    
    // 提取导航菜单中的链接
    const navMatches = html.matchAll(/href=["'](\/[^"']*?)["']/g);
    for (const match of navMatches) {
      const link = match[1];
      if (this.isNavigationLink(link)) {
        navLinks.push(`https://markdown-blog-bay.vercel.app${link}`);
      }
    }

    return [...new Set(navLinks)]; // 去重
  }

  /**
   * 判断是否为导航链接
   */
  private isNavigationLink(path: string): boolean {
    const navigationPaths = ['/frontEnd', '/codeEngineering', '/codeLife', '/about'];
    return navigationPaths.includes(path) || path === '/';
  }

  /**
   * 验证URL是否有效且应当被跟踪
   */
  private isValidUrl(url: string): boolean {
    // 只跟踪同域名下的页面
    if (!url.includes('markdown-blog-bay.vercel.app')) {
      return false;
    }

    // 避免查询参数和锚点链接
    if (url.includes('#') || url.includes('?')) {
      return false;
    }

    // 避免非HTML页面（图片、CSS、JS等）
    const invalidExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.css', '.js', '.ico', '.svg'];
    if (invalidExtensions.some(ext => url.toLowerCase().includes(ext))) {
      return false;
    }

    return true;
  }

  /**
   * 自定义文本提取，保留更多结构化信息
   */
  protected extractText(html: string): string {
    // 移除script和style标签
    let text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // 保留一些重要的HTML结构
    text = text
      .replace(/<h[1-6][^>]*>/gi, '\n## ')
      .replace(/<\/h[1-6]>/gi, '\n')
      .replace(/<p[^>]*>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<br[^>]*>/gi, '\n')
      .replace(/<li[^>]*>/gi, '\n- ')
      .replace(/<\/li>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .trim();

    return text;
  }
} 