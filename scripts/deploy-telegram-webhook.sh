#!/usr/bin/env bash
# Helper script to deploy Telegram Edge Functions and register Telegram Webhook

set -e

echo "=== Ruwet Telegram Bot Deployment ==="

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
  echo "Error: TELEGRAM_BOT_TOKEN environment variable is not set."
  exit 1
fi

if [ -z "$SUPABASE_FUNCTION_URL" ]; then
  echo "Error: SUPABASE_FUNCTION_URL environment variable is not set (e.g. https://<project_ref>.supabase.co/functions/v1)."
  exit 1
fi

if [ -z "$TELEGRAM_WEBHOOK_SECRET" ]; then
  echo "Error: TELEGRAM_WEBHOOK_SECRET environment variable is not set."
  exit 1
fi

echo "1. Deploying telegram-webhook Edge Function..."
supabase functions deploy telegram-webhook --no-verify-jwt

echo "2. Deploying telegram-notifier Edge Function..."
supabase functions deploy telegram-notifier --no-verify-jwt

WEBHOOK_URL="${SUPABASE_FUNCTION_URL}/telegram-webhook"

echo "3. Registering webhook with Telegram API..."
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"${WEBHOOK_URL}\",
    \"secret_token\": \"${TELEGRAM_WEBHOOK_SECRET}\"
  }")

echo "Response from Telegram: $RESPONSE"
echo "✅ Deployment and webhook registration completed successfully!"
