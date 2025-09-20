import { ulid } from 'ulid';

/**
 * 小文字のURLトークンを生成
 */
export function generateUrlToken(): string {
  return ulid().toLowerCase();
}