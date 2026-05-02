/**
 * SETUP SCRIPT
 * Run once to generate hashed password for .env
 * Usage: node src/setup.js
 */
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ADMIN_EMAIL = 'admin@geidostudio.com';
const ADMIN_PASSWORD = 'GeidoStudio.789!';
const SALT_ROUNDS = 12; // High cost factor for security

async function setup() {
  console.log('\n🔧 Geido Studio Backend Setup\n');

  // Generate JWT secret
  const jwtSecret = crypto.randomBytes(64).toString('hex');

  // Hash password
  console.log('⏳ Hashing admin password (this may take a moment)...');
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

  // Write .env file
  const envContent = `# Geido Studio Backend - Environment Variables
# ⚠️  NEVER share this file or commit it to git!

# JWT Secret (auto-generated)
JWT_SECRET=${jwtSecret}

# Admin Credentials
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD_HASH=${passwordHash}

# Frontend URL for CORS (update with your Netlify URL)
FRONTEND_URL=https://geidostudio.netlify.app

# Server Port
PORT=3001

# Environment
NODE_ENV=production
`;

  const envPath = path.join(__dirname, '..', '.env');
  fs.writeFileSync(envPath, envContent);

  // Create initial data files
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const cmsPath = path.join(dataDir, 'cms.json');
  if (!fs.existsSync(cmsPath)) {
    const defaultCms = {
      heroImages: [],
      heroTitle: 'Hayalinizdeki Dijital Dünyayı İnşa Ediyoruz',
      heroSubtitle: 'Modern, estetik ve işlevsel web çözümleri ile markanızı geleceğe taşıyın. Profesyonel tasarım ve yazılım ajansı.',
      aboutTitle: 'Hakkımızda',
      aboutText: 'Geido Studio, dijital dünyada markalarınızın potansiyelini en üst düzeye çıkarmak için yenilikçi, modern ve etkili çözümler sunar.',
      aboutImage: '',
      contactEmail: 'hello@geidostudio.com',
      contactPhone: '+90 (555) 123 45 67',
      contactAddress: 'Levent, Büyükdere Cd., 34330 Beşiktaş/İstanbul',
    };
    fs.writeFileSync(cmsPath, JSON.stringify(defaultCms, null, 2));
  }

  const messagesPath = path.join(dataDir, 'messages.json');
  if (!fs.existsSync(messagesPath)) {
    fs.writeFileSync(messagesPath, JSON.stringify([], null, 2));
  }

  console.log('\n✅ Setup complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Admin Email:    ', ADMIN_EMAIL);
  console.log('🔑 Password hash created and stored in .env');
  console.log('🔐 JWT Secret:     auto-generated (128 chars)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n⚠️  Important:');
  console.log('   1. Update FRONTEND_URL in .env with your Netlify domain');
  console.log('   2. NEVER commit .env to git');
  console.log('   3. The original password is NOT stored anywhere\n');
}

setup().catch(console.error);
