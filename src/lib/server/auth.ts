import { error } from '@sveltejs/kit';
import { ADMIN_API_TOKEN } from '$env/static/private';

/**
 * 管理API用の認証チェック
 * X-Admin-Token ヘッダーが正しい値かどうかを確認
 */
export function requireAdminAuth(request: Request): void {
  // 開発環境では認証をスキップ（ADMIN_API_TOKENが未設定の場合）
  if (!ADMIN_API_TOKEN) {
    console.warn('ADMIN_API_TOKEN is not set - skipping auth check (development only)');
    return;
  }

  const adminToken = request.headers.get('X-Admin-Token');
  
  if (!adminToken) {
    throw error(401, 'Missing X-Admin-Token header');
  }
  
  if (adminToken !== ADMIN_API_TOKEN) {
    throw error(403, 'Invalid admin token');
  }
}

/**
 * 本番環境でのみ利用可能なAPIかどうかをチェック
 * 開発環境以外では403エラーを返す
 */
export function requireDevelopmentOnly(): void {
  // NODE_ENVまたはVERCEL_ENVが本番環境を示している場合は拒否
  const nodeEnv = process.env.NODE_ENV;
  const vercelEnv = process.env.VERCEL_ENV;
  
  if (nodeEnv === 'production' || vercelEnv === 'production') {
    throw error(403, 'This endpoint is only available in development');
  }
}