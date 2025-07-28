#!/usr/bin/env npx ts-node

/**
 * 运行博客爬虫示例
 * 抓取 https://markdown-blog-bay.vercel.app/about 页面
 */

import { BlogSpider } from './blog-spider';
import { runSpider } from '../index';

async function main() {
  console.log('🕷️  开始运行ScrapyTS博客爬虫...\n');

  try {
    // 创建爬虫实例
    const spider = new BlogSpider();

    // 运行爬虫，输出为文本格式到output目录
    const stats = await runSpider(spider, {
      outputDir: 'output',
      outputFormat: 'text', // 只输出文本格式
      concurrent: 2,        // 并发数为2
      delay: 1             // 请求间隔1秒
    });

    console.log('\n✅ 爬虫运行完成！');
    console.log(`📊 统计信息:`);
    console.log(`   - 发送请求: ${stats.requestsSent}`);
    console.log(`   - 接收响应: ${stats.responsesReceived}`);
    console.log(`   - 抓取数据项: ${stats.itemsScraped}`);
    console.log(`   - 丢弃数据项: ${stats.itemsDropped}`);
    console.log(`\n📁 结果文件已保存到 output/ 目录`);

  } catch (error) {
    console.error('❌ 爬虫运行失败:', error);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

export { main }; 