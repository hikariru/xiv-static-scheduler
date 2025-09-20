import { dev } from '$app/environment';
import type { Handle } from '@sveltejs/kit';

// レート制限用のメモリストレージ（本番では Redis 等を推奨）
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// レート制限のクリーンアップ（古いエントリを削除）
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // 1分ごとにクリーンアップ

function getClientIP(request: Request): string {
  // Vercelの場合はx-forwarded-forヘッダーを使用
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // フォールバック
  return request.headers.get('x-real-ip') || 'unknown';
}

function checkRateLimit(ip: string, maxRequests: number = 30, windowMs: number = 60000): boolean {
  const now = Date.now();
  const resetTime = now + windowMs;
  
  const current = rateLimitMap.get(ip);
  
  if (!current || now > current.resetTime) {
    // 新しい時間窓または期限切れ
    rateLimitMap.set(ip, { count: 1, resetTime });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false; // レート制限に引っかかった
  }
  
  current.count++;
  return true;
}

export const handle: Handle = async ({ event, resolve }) => {
  const { request } = event;
  const ip = getClientIP(request);
  
  // POSTリクエストに対してレート制限を適用
  if (request.method === 'POST') {
    if (!checkRateLimit(ip, 30, 60000)) { // 1分間に30リクエストまで
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60'
          }
        }
      );
    }
  }
  
  const response = await resolve(event);
  
  // セキュリティヘッダーを追加
  if (!dev) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.supabase.co https://*.supabase.co; frame-ancestors 'none';"
    );
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }
  
  return response;
};