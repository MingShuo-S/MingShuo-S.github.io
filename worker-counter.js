// Cloudflare Worker 访问量统计脚本
// 部署到 Cloudflare Workers 后使用

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // 检查 KV 绑定是否正确配置
    if (!env.COUNTER) {
      console.error('❌ COUNTER KV namespace is not bound!');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'KV namespace not configured. Please bind COUNTER in Worker settings.' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // GET 请求：获取访问量
    if (request.method === 'GET') {
      try {
        const key = url.searchParams.get('key') || 'site_pv';
        const count = await env.COUNTER.get(key);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            count: count ? parseInt(count) : 0 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } catch (error) {
        console.error('GET error:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }
    
    // POST 请求：增加访问量
    if (request.method === 'POST') {
      try {
        const key = url.searchParams.get('key') || 'site_pv';
        const current = await env.COUNTER.get(key);
        const newValue = (current ? parseInt(current) : 0) + 1;
        
        await env.COUNTER.put(key, newValue.toString());
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            count: newValue 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } catch (error) {
        console.error('POST error:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }
    
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });
  }
};