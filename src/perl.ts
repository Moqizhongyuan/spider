import axios, { AxiosResponse } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

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
      fileContent += `Spider 抓取结果\n`;
      fileContent += `目标URL: ${this.url}\n`;
      fileContent += `抓取时间: ${new Date().toLocaleString('zh-CN')}\n`;
      fileContent += '='.repeat(50) + '\n\n';

      fileContent += '=== 页面内容预览 ===\n';
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
      console.log("=== 抓取完成 ===");
      console.log(`目标URL: ${this.url}`);
      console.log(`提取链接数量: ${links.length} 个`);
      console.log(`结果已保存到: ${filePath}`);
      
      console.log("\n=== 提取的链接预览（前10个）===");
      links.slice(0, 10).forEach((link, index) => {
        console.log(`${index + 1}. ${link}`);
      });
      
      if (links.length > 10) {
        console.log(`... 还有 ${links.length - 10} 个链接，详见文件`);
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

/**
#!/usr/bin/perl
use strict;
use warnings;
use LWP::UserAgent;
use File::Path qw(make_path);
use POSIX qw(strftime);

# 目标 URL
my $url = 'https://markdown-blog-bay.vercel.app/about';

# 创建 user agent
my $ua = LWP::UserAgent->new;
$ua->timeout(10);

# 请求网页内容
my $response = $ua->get($url);

if ($response->is_success) {
    my $content = $response->decoded_content;

    # 提取链接
    my @links = ($content =~ m/href=["'](.*?)["']/g);

    # 生成文件路径
    my $timestamp = strftime("%Y-%m-%d_%H-%M-%S", localtime);
    my $output_dir = "output";
    my $file_name = "spider-result-$timestamp.txt";
    my $file_path = "$output_dir/$file_name";

    # 确保输出目录存在
    unless (-d $output_dir) {
        make_path($output_dir) or die "无法创建目录: $output_dir";
    }

    # 构建写入内容
    my $file_content = "=" x 50 . "\n";
    $file_content .= "Spider 抓取结果\n";
    $file_content .= "目标URL: $url\n";
    $file_content .= "抓取时间: " . strftime("%Y-%m-%d %H:%M:%S", localtime) . "\n";
    $file_content .= "=" x 50 . "\n\n";

    $file_content .= "=== 页面内容预览 ===\n";
    $file_content .= substr($content, 0, 500) . "\n\n";

    $file_content .= "=== 提取的链接 ===\n";
    for my $i (0 .. $#links) {
        $file_content .= ($i + 1) . ". $links[$i]\n";
    }

    $file_content .= "\n" . "=" x 50 . "\n";
    $file_content .= "总共提取到 " . scalar(@links) . " 个链接\n";

    # 写入文件
    open my $fh, '>:encoding(UTF-8)', $file_path or die "无法写入文件: $file_path";
    print $fh $file_content;
    close $fh;

    # 控制台输出
    print "=== 抓取完成 ===\n";
    print "目标URL: $url\n";
    print "提取链接数量: " . scalar(@links) . " 个\n";
    print "结果已保存到: $file_path\n";

    print "\n=== 提取的链接预览（前10个）===\n";
    for my $i (0 .. $#links < 9 ? $#links : 9) {
        print ($i + 1) . ". $links[$i]\n";
    }
    if (@links > 10) {
        print "... 还有 " . (@links - 10) . " 个链接，详见文件\n";
    }

} else {
    die "无法获取页面内容: " . $response->status_line;
}

 */