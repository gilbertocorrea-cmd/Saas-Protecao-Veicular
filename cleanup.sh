#!/bin/bash

set -euo pipefail

echo "🚀 INICIANDO LIMPEZA SEGURA..."

# =========================
# 🧹 LIMPEZA DE LIXO
# =========================

echo "🧹 Limpando node_modules..."
rm -rf node_modules

echo "🧹 Limpando build..."
rm -rf dist

echo "🧹 Limpando cache npm..."
npm cache clean --force

echo "🧹 Limpando arquivos temporários..."
find . -name "*.log" -delete
find . -name "*.tmp" -delete

# =========================
# 🔁 REINSTALAR DEPENDÊNCIAS
# =========================

echo "📦 Instalando dependências..."
npm install

# =========================
# 🧬 PRISMA RESET (SEM DROPAR DB)
# =========================

echo "🧬 Gerando Prisma Client..."
npx prisma generate

echo "🧬 Sincronizando schema..."
npx prisma db push

# =========================
# 🔐 VALIDAR ENV
# =========================

echo "🔐 Validando .env..."

if [ ! -f ".env" ]; then
  echo "❌ ERRO: .env não encontrado"
  exit 1
fi

missing=false

if ! grep -q '^DATABASE_URL=' .env; then
  echo "❌ DATABASE_URL não encontrado"
  missing=true
fi

if ! grep -q '^JWT_PRIVATE_KEY=' .env; then
  echo "❌ JWT_PRIVATE_KEY não encontrado"
  missing=true
fi

if ! grep -q '^JWT_PUBLIC_KEY=' .env; then
  echo "❌ JWT_PUBLIC_KEY não encontrado"
  missing=true
fi

if [ "$missing" = true ]; then
  exit 1
fi

# =========================
# 🔍 CHECK DE ESTRUTURA
# =========================

echo "🔍 Validando estrutura..."

[ -d "src/modules/auth" ] || { echo "❌ auth module faltando"; missing=true; }
[ -d "src/middleware" ] || { echo "❌ middleware faltando"; missing=true; }
[ -f "src/app.ts" ] || { echo "❌ app.ts faltando"; missing=true; }

if [ "$missing" = true ]; then
  echo ""
  echo "⚠️ ERROS DESTRUCTURA DETECTADOS. CORRIJA ANTES DE CONTINUAR."
  exit 1
fi

# =========================
# 🧠 ALERTAS IMPORTANTES
# =========================

echo ""
echo "⚠️ CHECK MANUAL NECESSÁRIO:"
echo "- Auth usa prisma.usuario (não user)"
echo "- RefreshToken via tabela (não User)"
echo "- NÃO mudar schema"

echo ""
echo "✅ LIMPEZA FINALIZADA"
echo "🚀 Rode: npm run dev"
