#!/bin/bash

# Script de déploiement automatique pour Karyacool

echo "🚀 Début du déploiement..."

# 1. Récupérer le dernier code
echo "📥 Récupération du code via Git..."
git pull

# 2. Installer les dépendances
echo "📦 Installation des dépendances NPM..."
npm install

# 3. Mettre à jour Prisma
echo "🗄️ Mise à jour du schéma de la base de données..."
npx prisma generate
npx prisma db push # Synchronise le schéma sans effacer les données de prod

# 4. Construire l'application
echo "🏗️ Construction du projet (Build Next.js)..."
npm run build

# 5. Redémarrer PM2
echo "🔄 Redémarrage de l'application via PM2..."
# Remplace 'locashare' par le nom exact de ton process s'il est différent
pm2 restart all

echo "✅ Déploiement terminé avec succès ! Karyacool est à jour."
