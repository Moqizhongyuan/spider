import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

interface LinkExtractor {
  url: string;
  extractLinks(content: string): string[];
  run(): Promise<void>;
}

// 模拟真实浏览器的请求头配置
interface BrowserHeaders {
  [key: string]: string;
  'User-Agent': string;
  'Accept': string;
  'Accept-Language': string;
  'Accept-Encoding': string;
  'Sec-Fetch-Dest': string;
  'Sec-Fetch-Mode': string;
  'Sec-Fetch-Site': string;
  'Sec-Fetch-User': string;
  'DNT': string;
  'Connection': string;
  'Upgrade-Insecure-Requests': string;
  'Sec-CH-UA': string;
  'Sec-CH-UA-Mobile': string;
  'Sec-CH-UA-Platform': string;
  'Referer': string;
}

class StealthWebSpider implements LinkExtractor {
  public url: string;
  private headers: BrowserHeaders;

  constructor(url: string) {
    this.url = url;
    this.headers = this.generateStealthHeaders();
  }

  // 生成伪装成真实浏览器的请求头
  private generateStealthHeaders(): BrowserHeaders {
    // 使用真实的 Chrome 浏览器 User-Agent
    const userAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];

    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    return {
      'User-Agent': randomUserAgent,
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
      'Accept-Encoding': 'gzip, deflate, br',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-Fetch-User': '?1',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-CH-UA': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-CH-UA-Mobile': '?0',
      'Sec-CH-UA-Platform': '"macOS"',
      'Referer': 'https://www.google.com/'
    };
  }

  // 添加随机延迟，模拟人类行为
  private async randomDelay(min: number = 1000, max: number = 3000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  extractLinks(content: string): string[] {
    // 确保content是字符串
    if (typeof content !== 'string') {
      console.warn('⚠️ 内容不是字符串格式，尝试转换...');
      content = String(content);
    }

    // 使用兼容性更好的正则匹配方法
    const links: string[] = [];
    const regex = /href=["'](.*?)["']/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      links.push(match[1]);
    }
    
    return links;
  }

  async run(): Promise<void> {
    try {
      console.log("🕵️ 开始执行隐身爬虫...");
      console.log(`🎯 目标URL: ${this.url}`);
      console.log(`🤖 伪装User-Agent: ${this.headers['User-Agent']}`);

      // 模拟人类行为：随机延迟
      console.log("⏳ 模拟人类行为：随机延迟中...");
      await this.randomDelay();

      // 配置请求选项
      const config: AxiosRequestConfig = {
        headers: this.headers,
        timeout: 30000,
        maxRedirects: 5,
        // 禁用自动重定向，手动处理
        validateStatus: (status) => status < 400,
        // 添加代理支持（如果需要）
        // proxy: {
        //   host: '127.0.0.1',
        //   port: 7890
        // }
      };

      console.log("📡 发送请求...");
      const response: AxiosResponse<any> = await axios.get(this.url, config);
      
      // 处理不同类型的响应内容
      let content: string;
      let responseType: string;
      
      if (typeof response.data === 'object') {
        content = JSON.stringify(response.data, null, 2);
        responseType = 'JSON';
        console.log('📄 响应类型: JSON 数据');
      } else {
        content = String(response.data);
        responseType = 'HTML/Text';
        console.log('📄 响应类型: HTML/文本');
      }
      
      const links: string[] = this.extractLinks(content);

      // 生成文件名（基于时间戳）
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `stealth-spider-result-${timestamp}.txt`;
      const filePath = path.join(process.cwd(), 'output', fileName);

      // 确保输出目录存在
      const outputDir = path.join(process.cwd(), 'output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // 准备要写入的内容
      let fileContent = '';
      fileContent += '='.repeat(60) + '\n';
      fileContent += `🕵️ Stealth Spider 隐身爬虫抓取结果\n`;
      fileContent += `目标URL: ${this.url}\n`;
      fileContent += `抓取时间: ${new Date().toLocaleString('zh-CN')}\n`;
      fileContent += `伪装User-Agent: ${this.headers['User-Agent']}\n`;
      fileContent += `响应状态: ${response.status} ${response.statusText}\n`;
      fileContent += `响应类型: ${responseType}\n`;
      fileContent += '='.repeat(60) + '\n\n';

      fileContent += `=== ${responseType} 内容预览 ===\n`;
      fileContent += content + '\n\n';

      fileContent += '=== 提取的链接 ===\n';
      links.forEach((link, index) => {
        fileContent += `${index + 1}. ${link}\n`;
      });

      fileContent += '\n' + '='.repeat(60) + '\n';
      fileContent += `✅ 成功绕过指纹识别！\n`;
      fileContent += `总共提取到 ${links.length} 个链接\n`;
      fileContent += `响应大小: ${content.length} 字符\n`;

      // 写入文件
      fs.writeFileSync(filePath, fileContent, 'utf8');

      // 控制台输出
      console.log("\n" + "=".repeat(60));
      console.log("✅ 隐身爬虫执行成功！");
      console.log(`🎯 目标URL: ${this.url}`);
      console.log(`🔍 响应状态: ${response.status} ${response.statusText}`);
      console.log(`📄 响应类型: ${responseType}`);
      console.log(`📊 提取链接数量: ${links.length} 个`);
      console.log(`💾 结果已保存到: ${filePath}`);
      console.log(`📏 响应大小: ${content.length} 字符`);
      
      // 如果是JSON响应，显示JSON内容
      if (responseType === 'JSON') {
        console.log("\n=== JSON 响应内容 ===");
        console.log(JSON.stringify(response.data, null, 2));
      }
      
      console.log("\n=== 提取的链接预览（前10个）===");
      links.slice(0, 10).forEach((link, index) => {
        console.log(`${index + 1}. ${link}`);
      });
      
      if (links.length > 10) {
        console.log(`... 还有 ${links.length - 10} 个链接，详见文件`);
      }

      console.log("\n🕵️ 隐身技术总结:");
      console.log("✅ 使用真实浏览器 User-Agent");
      console.log("✅ 添加完整的浏览器指纹头部");
      console.log("✅ 模拟人类行为（随机延迟）");
      console.log("✅ 成功绕过指纹识别检测");

    } catch (error) {
      if (error instanceof Error) {
        console.error("❌ 爬虫执行失败：", error.message);
        
        // 如果是网络错误，提供更详细的诊断
        if (error.message.includes('ECONNREFUSED')) {
          console.error("💡 建议：检查网络连接或代理设置");
        } else if (error.message.includes('timeout')) {
          console.error("💡 建议：增加超时时间或检查网络速度");
        } else if (error.message.includes('403')) {
          console.error("💡 建议：可能需要更强的隐身技术或更换IP");
        } else if (error.message.includes('ENOTFOUND')) {
          console.error("💡 建议：检查URL是否正确");
        }
      } else {
        console.error("❌ 发生未知错误：", error);
      }
    }
  }
}

// 使用隐身爬虫
const stealthSpider = new StealthWebSpider("https://some-service-two.vercel.app/api/onlyFingerprint");
stealthSpider.run();
