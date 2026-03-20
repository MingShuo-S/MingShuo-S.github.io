# Cloudflare Workers 访问量统计部署指南

## 📋 功能说明

这是一个基于 Cloudflare Workers 的轻量级访问量统计服务，用于替代无法访问的 Busuanzi。

**特点：**
- ✅ 完全免费（Cloudflare 每日 10 万次请求）
- ✅ 全球 CDN 加速，无地域限制
- ✅ 数据持久化存储（KV 存储）
- ✅ CORS 支持，可直接从前端调用
- ✅ 隐私友好，不收集用户信息

## 🚀 部署步骤

### 第一步：创建 Cloudflare 账号

1. 访问 [Cloudflare](https://dash.cloudflare.com/sign-up)
2. 注册免费账号
3. 验证邮箱

### 第二步：创建 KV 命名空间

1. 登录 Cloudflare Dashboard
2. 进入 **Workers & Pages** → **KV**
3. 点击 **Create a namespace**
4. 命名为 `COUNTER`（或其他你喜欢的名字）
5. 记下这个名称，后面会用到

### 第三步：创建 Worker

1. 进入 **Workers & Pages** → **Overview**
2. 点击 **Create application**
3. 选择 **Create Worker**
4. 输入 Worker 名称：`site-counter`（或自定义）
5. 点击 **Deploy**

### 第四步：配置 KV 绑定

1. 在刚创建的 Worker 页面，进入 **Settings** → **Variables**
2. 找到 **KV namespace bindings**
3. 点击 **Add binding**
   - Variable name: `COUNTER`
   - KV namespace: 选择之前创建的 `COUNTER`
4. 点击 **Save and deploy**

### 第五步：部署代码

#### 方法 A：在线编辑（推荐新手）

1. 进入 Worker 的 **Quick edit** 页面
2. 复制 `worker-counter.js` 的全部内容
3. 粘贴到代码编辑器中
4. 点击 **Save and deploy**

#### 方法 B：使用 Wrangler CLI（推荐高级用户）

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 初始化项目
wrangler init site-counter
cd site-counter

# 修改 wrangler.toml 配置
# 添加 KV 绑定
[[kv_namespaces]]
binding = "COUNTER"
id = "你的 KV namespace ID"

# 替换 worker-counter.js 内容
# 部署
wrangler deploy
```

### 第六步：获取 Worker URL

部署成功后，你会得到一个类似这样的 URL：
```
https://site-counter.yourusername.workers.dev
```

这就是你的访问量统计 API 地址！

## 🔧 集成到网站

### 修改主页模板

编辑 `src/templates/index.html`，找到 Busuanzi 相关部分，替换为：

```html
<!-- 访问量统计 -->
<div class="stat-card site-stat-card">
    <div class="stat-number">
        <span id="site-pv"><i class="fas fa-spinner fa-spin"></i></span>
    </div>
    <div class="stat-label">
        <i class="fas fa-chart-line"></i> 总访问量
    </div>
</div>
<div class="stat-card site-stat-card">
    <div class="stat-number">
        <span id="site-uv"><i class="fas fa-spinner fa-spin"></i></span>
    </div>
    <div class="stat-label">
        <i class="fas fa-user"></i> 访客数量
    </div>
</div>

<!-- 访问量统计脚本 -->
<script>
(function() {
    // 替换为你的 Worker URL
    const COUNTER_API = 'https://site-counter.yourusername.workers.dev';
    
    // 增加访问量并获取最新数据
    async function updateCounter() {
        try {
            // POST 增加 PV
            await fetch(COUNTER_API + '?key=site_pv', { method: 'POST' });
            
            // GET 获取最新数据
            const res = await fetch(COUNTER_API + '?key=site_pv');
            const data = await res.json();
            
            if (data.success) {
                document.getElementById('site-pv').textContent = data.count.toLocaleString();
            } else {
                document.getElementById('site-pv').textContent = '—';
            }
        } catch (error) {
            console.error('Counter error:', error);
            document.getElementById('site-pv').textContent = '—';
        }
        
        // UV 暂时用 PV 代替（简化实现）
        // 如需精确 UV，需要实现 Cookie/LocalStorage 去重逻辑
        document.getElementById('site-uv').textContent = document.getElementById('site-pv').textContent;
    }
    
    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateCounter);
    } else {
        updateCounter();
    }
})();
</script>
```

### 移除 Busuanzi 代码

删除以下代码：
```html
<!-- Busuanzi 访问量统计 -->
<script async src="https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"></script>
```

## 📊 查看统计数据

### 方法 1：直接访问 API

```
https://site-counter.yourusername.workers.dev?key=site_pv
```

返回 JSON：
```json
{
  "success": true,
  "count": 1234
}
```

### 方法 2：Cloudflare Dashboard

1. 进入 Worker 页面
2. 查看 **Analytics** 标签
3. 可以看到请求次数等数据

## 🔒 进阶功能

### 1. 实现 UV 统计（基于 localStorage）

修改 Worker 代码，添加 UV 去重逻辑：

```javascript
// 在 Worker 中添加
if (request.method === 'POST') {
  const key = url.searchParams.get('key') || 'site_pv';
  const uvKey = 'site_uv_' + new Date().toDateString(); // 按天去重
  
  let isNewVisitor = false;
  
  // 检查是否是独立访客（简化实现）
  if (key === 'site_uv') {
    const hasVisited = await env.COUNTER.get(uvKey);
    if (!hasVisited) {
      isNewVisitor = true;
      await env.COUNTER.put(uvKey, '1');
    }
  }
  
  // ... 原有逻辑
}
```

### 2. 添加访问日志

```javascript
// 记录每次访问的详细信息
const log = {
  timestamp: new Date().toISOString(),
  ip: request.headers.get('CF-Connecting-IP'),
  country: request.cf.country,
  userAgent: request.headers.get('User-Agent')
};

await env.COUNTER.put(`log:${Date.now()}`, JSON.stringify(log));
```

### 3. 防止刷量

```javascript
// 简单的频率限制
const rateLimitKey = `rate:${request.headers.get('CF-Connecting-IP')}`;
const rateLimit = await env.COUNTER.get(rateLimitKey);

if (rateLimit && parseInt(rateLimit) > 100) {
  return new Response('Too many requests', { 
    status: 429,
    headers: corsHeaders 
  });
}

await env.COUNTER.put(rateLimitKey, (parseInt(rateLimit || '0') + 1).toString());
await env.COUNTER.put(rateLimitKey + ':expire', '1', { expirationTtl: 3600 });
```

## 💰 费用说明

Cloudflare Workers 免费额度：
- ✅ 每日 10 万次请求
- ✅ 每月 10ms CPU 时间累计 30 秒
- ✅ 100KB KV 存储

对于个人博客完全够用，基本不会超出免费额度。

## 🐛 常见问题

### Q: 为什么不用 Busuanzi？
A: Busuanzi 的国内 CDN 在国外部署的网站可能无法访问，DNS 解析失败。

### Q: 数据会丢失吗？
A: Cloudflare KV 是持久化存储，除非手动删除，否则数据永久保存。

### Q: 可以迁移到其他平台吗？
A: 可以，代码逻辑简单，可轻松迁移到 Vercel、Netlify 等平台。

### Q: 如何备份数据？
A: 可以通过 Worker API 定期导出数据，或使用 Cloudflare 的导出功能。

## 📝 下一步

1. 按照上述步骤部署 Worker
2. 修改网站代码集成统计
3. 重新构建并部署网站
4. 验证统计数据是否正常

有任何问题欢迎随时询问！