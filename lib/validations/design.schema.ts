import { z } from 'zod';

export const createDesignSchema = z.object({
  title:       z.string().min(1).max(100).default('Untitled Design'),
  dimensions:  z.object({
    width:  z.number().min(100).max(10000).default(1080),
    height: z.number().min(100).max(10000).default(1080),
  }).optional(),
  templateId:  z.string().optional(),
  canvasData:  z.record(z.unknown()).optional(),
});

export const updateDesignSchema = z.object({
  title:      z.string().min(1).max(100).optional(),
  canvasData: z.record(z.unknown()).optional(),
  thumbnail:  z.string().optional(),
  tags:       z.array(z.string()).optional(),
  isPublic:   z.boolean().optional(),
  category:   z.string().optional(),
});

export const exportDesignSchema = z.object({
  format:     z.enum(['png', 'jpg', 'pdf']),
  quality:    z.number().min(0.1).max(1).default(1),
  multiplier: z.number().min(1).max(4).default(2),
});
