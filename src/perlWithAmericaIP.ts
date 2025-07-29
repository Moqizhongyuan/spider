import axios, { AxiosResponse } from 'axios';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.local.env' });

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
      // 从环境变量获取代理配置
      const proxyHost = process.env.PROXY_HOST;
      const proxyPort = parseInt(process.env.PROXY_PORT || '8003');
      const proxyUsername = process.env.PROXY_USERNAME;
      const proxyPassword = process.env.PROXY_PASSWORD;
      const userAgent = process.env.USER_AGENT;

      // 验证必需的环境变量
      if (!proxyHost || !proxyUsername || !proxyPassword) {
        throw new Error('❌ 缺少必需的代理配置环境变量。请检查 .local.env 文件');
      }

      console.log(`🔧 代理配置: ${proxyUsername}@${proxyHost}:${proxyPort}`);

      // 配置美国代理服务器
      const proxyConfig = {
        proxy: {
          protocol: 'http',
          host: proxyHost,
          port: proxyPort,
          auth: {
            username: proxyUsername,
            password: proxyPassword
          }
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false // 对应 proxyStrictSSL: false
        }),
        headers: {
          'User-Agent': userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      };

      console.log('🌍 使用美国代理服务器连接...');
      const response: AxiosResponse<any> = await axios.get(this.url, proxyConfig);
      
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
      const fileName = `spider-result-${timestamp}.txt`;
      const filePath = path.join(process.cwd(), 'output', fileName);

      // 确保输出目录存在
      const outputDir = path.join(process.cwd(), 'output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // 准备要写入的内容
      let fileContent = '';
      fileContent += '='.repeat(50) + '\n';
      fileContent += `Spider 抓取结果（美国代理）\n`;
      fileContent += `目标URL: ${this.url}\n`;
      fileContent += `代理服务器: ${proxyHost}:${proxyPort} (美国)\n`;
      fileContent += `代理用户: ${proxyUsername}\n`;
      fileContent += `响应类型: ${responseType}\n`;
      fileContent += `抓取时间: ${new Date().toLocaleString('zh-CN')}\n`;
      fileContent += '='.repeat(50) + '\n\n';

      fileContent += `=== ${responseType} 内容预览 ===\n`;
      fileContent += content + '\n\n';

      fileContent += '=== 提取的链接 ===\n';
      links.forEach((link, index) => {
        fileContent += `${index + 1}. ${link}\n`;
      });

      fileContent += '\n' + '='.repeat(50) + '\n';
      fileContent += `总共提取到 ${links.length} 个链接\n`;

      // 写入文件
      fs.writeFileSync(filePath, fileContent, 'utf8');

      // 控制台输出
      console.log("✅ === 抓取完成 ===");
      console.log(`🎯 目标URL: ${this.url}`);
      console.log(`🌍 代理服务器: ${proxyHost}:${proxyPort} (美国)`);
      console.log(`👤 代理用户: ${proxyUsername}`);
      console.log(`📄 响应类型: ${responseType}`);
      console.log(`🔗 提取链接数量: ${links.length} 个`);
      console.log(`💾 结果已保存到: ${filePath}`);
      
      console.log("\n=== 提取的链接预览（前10个）===");
      links.slice(0, 10).forEach((link, index) => {
        console.log(`${index + 1}. ${link}`);
      });
      
      if (links.length > 10) {
        console.log(`... 还有 ${links.length - 10} 个链接，详见文件`);
      }

    } catch (error) {
      if (error instanceof Error) {
        console.error("❌ 代理请求失败：", error.message);
        
        // 提供更详细的错误信息
        if (error.message.includes('ECONNREFUSED')) {
          console.error("💡 提示：代理服务器连接被拒绝，请检查代理配置");
        } else if (error.message.includes('ETIMEDOUT')) {
          console.error("💡 提示：代理连接超时，请检查网络连接");
        } else if (error.message.includes('407')) {
          console.error("💡 提示：代理认证失败，请检查用户名和密码");
        } else if (error.message.includes('ENOTFOUND')) {
          console.error("💡 提示：无法解析代理服务器地址");
        }
      } else {
        console.error("❌ 发生未知错误：", error);
      }
    }
  }
}

// 使用爬虫
const spider = new WebSpider("https://some-service-two.vercel.app/api/onlyAmerica");
spider.run(); 
