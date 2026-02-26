import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDesignDocument extends Document {
  ownerId: mongoose.Types.ObjectId;
  title: string;
  thumbnail: string | null;
  canvasData: Record<string, unknown> | null;
  dimensions: { width: number; height: number };
  category: string | null;
  tags: string[];
  isPublic: boolean;
  version: number;
  templateId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const DesignSchema = new Schema<IDesignDocument>(
  {
    ownerId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title:      { type: String, required: true, default: 'Untitled Design', trim: true, maxlength: 100 },
    thumbnail:  { type: String, default: null },
    canvasData: { type: Schema.Types.Mixed, default: null },
    dimensions: {
      width:  { type: Number, default: 1080 },
      height: { type: Number, default: 1080 },
    },
    category:   { type: String, default: null },
    tags:       [{ type: String }],
    isPublic:   { type: Boolean, default: false },
    version:    { type: Number, default: 1 },
    templateId: { type: Schema.Types.ObjectId, ref: 'Template', default: null },
  },
  { timestamps: true }
);

DesignSchema.index({ ownerId: 1, createdAt: -1 });
DesignSchema.index({ tags: 1 });

const Design: Model<IDesignDocument> =
  mongoose.models.Design ?? mongoose.model<IDesignDocument>('Design', DesignSchema);

export default Design;
