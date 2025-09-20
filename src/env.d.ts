/// <reference types="@sveltejs/kit" />

declare module '$env/static/private' {
  export const SUPABASE_URL: string;
  export const SUPABASE_SERVICE_ROLE_KEY: string;
  export const DISCORD_WEBHOOK_URL: string;
  export const ADMIN_API_TOKEN: string;
  export const ALLOWED_ORIGIN: string;
  export const EDGE_SECRET: string;
}