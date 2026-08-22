import imageCompression from 'browser-image-compression';
import { createClient } from './supabase/client';

export interface CompressionProgressCallback {
  (progress: number): void;
}

export interface ProcessedUploadResult {
  publicUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  fileName: string;
}

export async function processAndUploadImage(
  file: File,
  bucket = 'products',
  onProgress?: CompressionProgressCallback
): Promise<string | null> {
  const result = await processAndUploadImageDetailed(file, bucket, onProgress);
  return result ? result.publicUrl : null;
}

export async function processAndUploadImageDetailed(
  file: File,
  bucket = 'products',
  onProgress?: CompressionProgressCallback
): Promise<ProcessedUploadResult | null> {
  const originalSizeKb = Math.round(file.size / 1024);

  const compressionOptions = {
    maxSizeMB: 0.12,          // Target ~80 KB – 150 KB max
    maxWidthOrHeight: 1200,   // Max dimension 1200px preserving aspect ratio
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.85,
    onProgress: onProgress ? (progress: number) => onProgress(Math.round(progress)) : undefined
  };

  try {
    // 1. Automatic WebP Conversion & Compression via Web Worker
    const compressedBlob = await imageCompression(file, compressionOptions);
    const compressedSizeKb = Math.round(compressedBlob.size / 1024);
    
    const timestamp = Date.now();
    const randomHash = Math.random().toString(36).substring(2, 9);
    const fileName = `candy-kids-${timestamp}-${randomHash}.webp`;
    
    const optimizedFile = new File([compressedBlob], fileName, {
      type: 'image/webp'
    });

    // 2. Direct Supabase Storage Upload
    const supabase = createClient();
    const filePath = `uploads/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, optimizedFile, {
        contentType: 'image/webp',
        upsert: false
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      throw error;
    }

    // 3. Return Public URL String & Compression metadata
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      publicUrl: publicUrlData.publicUrl,
      originalSizeKb,
      compressedSizeKb,
      fileName
    };
  } catch (error) {
    console.error('Image Processing/Upload Failed:', error);
    throw error;
  }
}

