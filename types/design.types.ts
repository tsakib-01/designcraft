export interface DesignDimensions {
  width: number;
  height: number;
}

export interface IDesign {
  _id: string;
  ownerId: string;
  title: string;
  thumbnail: string | null;
  canvasData: Record<string, unknown> | null;
  dimensions: DesignDimensions;
  category: string | null;
  tags: string[];
  isPublic: boolean;
  version: number;
  templateId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITemplate {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  canvasData: Record<string, unknown>;
  categoryId: string | null;
  tags: string[];
  dimensions: DesignDimensions;
  isPremium: boolean;
  usageCount: number;
  createdBy: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAsset {
  _id: string;
  uploadedBy: string;
  type: AssetType;
  name: string;
  url: string;
  thumbnailUrl: string | null;
  mimeType: string;
  sizeBytes: number;
  tags: string[];
  categoryId: string | null;
  isPublic: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type AssetType = 'image' | 'icon' | 'shape' | 'video' | 'font';

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  type: 'template' | 'asset' | 'both';
  icon: string | null;
  order: number;
  isActive: boolean;
}

export type ExportFormat = 'png' | 'jpg' | 'pdf';

export interface DesignListItem {
  _id: string;
  title: string;
  thumbnail: string | null;
  dimensions: DesignDimensions;
  updatedAt: Date;
  createdAt: Date;
}
