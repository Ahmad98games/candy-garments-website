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

  // 1. Safe Compression
  try {
    if (onProgress) onProgress(20);
    const compressionOptions = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1200,
      useWebWorker: false, // Set to false to avoid Android/mobile worker crashes
      fileType: 'image/webp',
      initialQuality: 0.8,
    };

    const compressedBlob = await imageCompression(file, compressionOptions);
    compressedSizeKb = Math.round(compressedBlob.size / 1024);
    fileExt = 'webp';
    mimeType = 'image/webp';
    uploadFile = compressedBlob;
  } catch (err) {
    console.warn('Compression skipped, using original file', err);
    uploadFile = file;
  }

  // 2. Upload to Supabase
  try {
    if (onProgress) onProgress(60);
    const fileName = `item-${timestamp}-${randomHash}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, uploadFile, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase Upload Detailed Error:', uploadError);
      alert(`Upload Failed: ${uploadError.message} (Bucket: ${bucket})`);
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (onProgress) onProgress(100);

    return {
      publicUrl: publicUrlData.publicUrl,
      originalSizeKb,
      compressedSizeKb,
      fileName,
    };
  } catch (fatalError: any) {
    console.error('Fatal Upload Error:', fatalError);
    throw fatalError;
  }
}
