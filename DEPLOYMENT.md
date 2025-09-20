# デプロイメントガイド

## Edge Functions のデプロイ

### 1. 環境変数の設定

Supabase CLIを使用して、以下の環境変数を設定してください：

```bash
# Supabase URL（プロジェクト設定 > API から取得）
supabase secrets set SUPABASE_URL https://your-project-ref.supabase.co

# Service Role Key（プロジェクト設定 > API から取得、秘密情報）
supabase secrets set SUPABASE_SERVICE_ROLE_KEY your-service-role-key

# Discord Webhook URL（Discordサーバー設定から取得、秘密情報）
supabase secrets set DISCORD_WEBHOOK_URL https://discord.com/api/webhooks/your-webhook-url
```

### 2. Edge Functionのデプロイとスケジューリング

毎週金曜日 7:00 AM JST（木曜日 22:00 UTC）に実行するようにスケジュール設定：

```bash
# デプロイ＆スケジュール設定（cron: "0 22 * * 4" = 毎週木曜日 22:00 UTC）
supabase functions deploy create-weekly-schedule --schedule "0 22 * * 4"
```

### 3. テスト

#### ローカルテスト

```bash
# Supabase ローカル開発環境の起動
supabase start

# Edge Function の手動実行
supabase functions invoke create-weekly-schedule --no-verify-jwt
```

#### 本番環境テスト

```bash
# 本番環境での手動実行
supabase functions invoke create-weekly-schedule --no-verify-jwt
```

## Vercel へのデプロイ

### 1. 環境変数の設定

Vercel ダッシュボードまたはCLIで以下を設定：

```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add DISCORD_WEBHOOK_URL
```

### 2. デプロイ

```bash
# Vercel にデプロイ
vercel --prod
```

## 注意事項

- Service Role Key は非常に強力な権限を持ちます。取り扱いには十分注意してください
- Discord Webhook URL も秘密情報として扱ってください
- 本番環境では必ず環境変数を使用し、コードに直接秘密情報を書かないでください

## トラブルシューティング

### Edge Function が実行されない場合

1. 環境変数が正しく設定されているか確認
2. Supabase の関数ログを確認
3. cron式が正しいか確認（JST = UTC+9）

### Discord 通知が送信されない場合

1. Webhook URL が正しいか確認
2. Discord サーバーの権限を確認
3. Edge Function のログでエラー内容を確認