import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITemplateDocument extends Document {
  title: string;
  description: string;
  thumbnail: string;
  canvasData: Record<string, unknown>;
  categoryId: mongoose.Types.ObjectId | null;
  tags: string[];
  dimensions: { width: number; height: number };
  isPremium: boolean;
  usageCount: number;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplateDocument>(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    thumbnail:   { type: String, required: true },
    canvasData:  { type: Schema.Types.Mixed, required: true },
    categoryId:  { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    tags:        [{ type: String }],
    dimensions: {
      width:  { type: Number, default: 1080 },
      height: { type: Number, default: 1080 },
    },
    isPremium:   { type: Boolean, default: false },
    usageCount:  { type: Number, default: 0 },
    createdBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

TemplateSchema.index({ categoryId: 1 });
TemplateSchema.index({ tags: 1 });
TemplateSchema.index({ isActive: 1 });

const Template: Model<ITemplateDocument> =
  mongoose.models.Template ?? mongoose.model<ITemplateDocument>('Template', TemplateSchema);

export default Template;
