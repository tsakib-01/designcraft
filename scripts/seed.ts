/**
 * Seed script: creates admin user and sample templates
 * Usage: npx tsx scripts/seed.ts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/canva-clone';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@designcraft.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin@123456';

// ── Inline schemas (avoid TS path alias issues in script context) ──
const UserSchema = new mongoose.Schema({
  email: String, username: String, passwordHash: String,
  role: { type: String, default: 'user' },
  avatar: { type: String, default: null },
  plan: { type: String, default: 'free' },
  designCount: { type: Number, default: 0 },
  storageUsed:  { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const CategorySchema = new mongoose.Schema({
  name: String, slug: String, type: String,
  icon: String, order: Number, isActive: { type: Boolean, default: true },
}, { timestamps: true });

const TemplateSchema = new mongoose.Schema({
  title: String, description: String, thumbnail: String,
  canvasData: mongoose.Schema.Types.Mixed,
  categoryId: mongoose.Schema.Types.ObjectId,
  tags: [String], dimensions: { width: Number, height: Number },
  isPremium: Boolean, usageCount: { type: Number, default: 0 },
  createdBy: mongoose.Schema.Types.ObjectId, isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User     = mongoose.models.User     ?? mongoose.model('User',     UserSchema);
const Category = mongoose.models.Category ?? mongoose.model('Category', CategorySchema);
const Template = mongoose.models.Template ?? mongoose.model('Template', TemplateSchema);

const CATEGORIES = [
  { name: 'Social Media',   slug: 'social-media',   type: 'template', icon: '📱', order: 1 },
  { name: 'Presentations',  slug: 'presentations',  type: 'template', icon: '📊', order: 2 },
  { name: 'Marketing',      slug: 'marketing',      type: 'template', icon: '📣', order: 3 },
  { name: 'Documents',      slug: 'documents',      type: 'template', icon: '📄', order: 4 },
  { name: 'Icons',          slug: 'icons',          type: 'asset',    icon: '🎨', order: 5 },
];

const SAMPLE_CANVAS_DATA = (bg: string) => ({
  version: '5.3.0',
  objects: [
    {
      type: 'rect',
      left: 0, top: 0, width: 1080, height: 1080,
      fill: bg, selectable: false, evented: false,
    },
    {
      type: 'i-text',
      text: 'Your Title Here',
      left: 100, top: 400, fontSize: 72, fontWeight: 'bold',
      fill: '#ffffff', fontFamily: 'Georgia, serif',
    },
    {
      type: 'i-text',
      text: 'Add your subtitle or description text here',
      left: 100, top: 510, fontSize: 28, fill: 'rgba(255,255,255,0.7)',
      fontFamily: 'Arial, sans-serif',
    },
  ],
  background: bg,
});

const TEMPLATES: Array<{
  title: string; description: string; tags: string[]; dimensions: { width: number; height: number };
  bg: string; categorySlug: string; isPremium: boolean;
}> = [
  { title: 'Instagram Post',     description: 'Modern 1:1 post',      tags: ['instagram','social'],  dimensions: { width: 1080, height: 1080 }, bg: '#6366f1', categorySlug: 'social-media',  isPremium: false },
  { title: 'Story Template',     description: 'Vertical story format', tags: ['story','instagram'],   dimensions: { width: 1080, height: 1920 }, bg: '#ec4899', categorySlug: 'social-media',  isPremium: false },
  { title: 'YouTube Thumbnail',  description: '16:9 video thumbnail',  tags: ['youtube','thumbnail'], dimensions: { width: 1280, height: 720  }, bg: '#ef4444', categorySlug: 'marketing',     isPremium: false },
  { title: 'Business Slide',     description: 'Clean presentation',    tags: ['slide','business'],    dimensions: { width: 1280, height: 960  }, bg: '#0f172a', categorySlug: 'presentations', isPremium: false },
  { title: 'Event Poster',       description: 'Eye-catching poster',   tags: ['event','poster'],      dimensions: { width: 794,  height: 1123 }, bg: '#7c3aed', categorySlug: 'marketing',     isPremium: true  },
  { title: 'Twitter/X Banner',   description: 'Profile header banner', tags: ['twitter','banner'],    dimensions: { width: 1500, height: 500  }, bg: '#1da1f2', categorySlug: 'social-media',  isPremium: false },
];

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected');

  // Admin user
  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
  let adminUser;
  if (existingAdmin) {
    adminUser = existingAdmin;
    console.log(`ℹ️  Admin already exists: ${ADMIN_EMAIL}`);
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    adminUser = await User.create({
      email: ADMIN_EMAIL, username: 'admin',
      passwordHash, role: 'admin',
    });
    console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);
  }

  // Categories
  const categoryMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const cat of CATEGORIES) {
    const existing = await Category.findOne({ slug: cat.slug });
    if (existing) {
      categoryMap[cat.slug] = existing._id;
    } else {
      const created = await Category.create(cat);
      categoryMap[cat.slug] = created._id;
      console.log(`✅ Category: ${cat.name}`);
    }
  }

  // Templates
  for (const tmpl of TEMPLATES) {
    const existing = await Template.findOne({ title: tmpl.title });
    if (existing) {
      console.log(`ℹ️  Template exists: ${tmpl.title}`);
      continue;
    }

    const thumbColor = tmpl.bg.replace('#', '');
    await Template.create({
      title:       tmpl.title,
      description: tmpl.description,
      thumbnail:   `https://placehold.co/${tmpl.dimensions.width}x${tmpl.dimensions.height}/${thumbColor}/ffffff?text=${encodeURIComponent(tmpl.title)}`,
      canvasData:  SAMPLE_CANVAS_DATA(tmpl.bg),
      categoryId:  categoryMap[tmpl.categorySlug],
      tags:        tmpl.tags,
      dimensions:  tmpl.dimensions,
      isPremium:   tmpl.isPremium,
      createdBy:   adminUser._id,
      isActive:    true,
    });
    console.log(`✅ Template: ${tmpl.title}`);
  }

  console.log('\n🎉 Seed complete!');
  console.log(`\n📝 Admin credentials:\n   Email:    ${ADMIN_EMAIL}\n   Password: ${ADMIN_PASSWORD}`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
