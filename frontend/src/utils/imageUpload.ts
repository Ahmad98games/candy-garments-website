import imageCompression from 'browser-image-compression';
import { supabase } from '../lib/supabase';

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
  const timestamp = Date.now();
  const randomHash = Math.random().toString(36).substring(2, 9);
  
  let uploadFile: File | Blob = file;
  let fileExt = file.name.split('.').pop() || 'jpg';
  let mimeType = file.type || 'image/jpeg';
  let compressedSizeKb = originalSizeKb;

  // 1. Safe Image Compression Pipeline with WebWorker Fallback
  try {
    if (onProgress) onProgress(15);

    const compressionOptions = {
      maxSizeMB: 0.25,          // ~150KB - 250KB safe high-quality range
      maxWidthOrHeight: 1200,
      useWebWorker: typeof Worker !== 'undefined', // Safe check
      fileType: 'image/webp',
      initialQuality: 0.82,
      onProgress: onProgress ? (progress: number) => onProgress(Math.min(85, Math.round(progress))) : undefined
    };

    const compressedBlob = await imageCompression(file, compressionOptions);
    compressedSizeKb = Math.round(compressedBlob.size / 1024);
    
    fileExt = 'webp';
    mimeType = 'image/webp';
    uploadFile = new File([compressedBlob], `item-${timestamp}-${randomHash}.webp`, {
      type: 'image/webp'
    });
  } catch (compressionErr) {
    console.warn('WebP compression skipped/fallback to raw image:', compressionErr);
    uploadFile = file; // Fallback to raw file if mobile browser fails worker
  }

  // 2. Direct Supabase Storage Upload
  try {
    if (onProgress) onProgress(90);

    const fileName = `item-${timestamp}-${randomHash}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, uploadFile, {
        contentType: mimeType,
        upsert: true
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      throw uploadError;
    }

    // 3. Retrieve Public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (onProgress) onProgress(100);

    return {
      publicUrl: publicUrlData.publicUrl,
      originalSizeKb,
      compressedSizeKb,
      fileName
    };
  } catch (uploadError) {
    console.error('Image Processing/Upload Fatal Error:', uploadError);
    throw uploadError;
  }
}
