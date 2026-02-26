import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAssetDocument extends Document {
  uploadedBy: mongoose.Types.ObjectId;
  type: 'image' | 'icon' | 'shape' | 'video' | 'font';
  name: string;
  url: string;
  thumbnailUrl: string | null;
  mimeType: string;
  sizeBytes: number;
  tags: string[];
  categoryId: mongoose.Types.ObjectId | null;
  isPublic: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const AssetSchema = new Schema<IAssetDocument>(
  {
    uploadedBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type:         { type: String, enum: ['image', 'icon', 'shape', 'video', 'font'], required: true },
    name:         { type: String, required: true, trim: true },
    url:          { type: String, required: true },
    thumbnailUrl: { type: String, default: null },
    mimeType:     { type: String, default: '' },
    sizeBytes:    { type: Number, default: 0 },
    tags:         [{ type: String }],
    categoryId:   { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    isPublic:     { type: Boolean, default: false },
    metadata:     { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

AssetSchema.index({ isPublic: 1, type: 1 });
AssetSchema.index({ uploadedBy: 1, type: 1 });

export const Asset: Model<IAssetDocument> =
  mongoose.models.Asset ?? mongoose.model<IAssetDocument>('Asset', AssetSchema);

// ── Category ──────────────────────────────────────────────

export interface ICategoryDocument extends Document {
  name: string;
  slug: string;
  type: 'template' | 'asset' | 'both';
  icon: string | null;
  order: number;
  isActive: boolean;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name:     { type: String, required: true, unique: true, trim: true },
    slug:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    type:     { type: String, enum: ['template', 'asset', 'both'], default: 'both' },
    icon:     { type: String, default: null },
    order:    { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Category: Model<ICategoryDocument> =
  mongoose.models.Category ?? mongoose.model<ICategoryDocument>('Category', CategorySchema);
