import { supabase } from '$lib/supabase';

export interface UploadResult {
  url: string;
  path: string;
}

export async function uploadImage(
  file: File,
  bucket: 'products' | 'atelier-styles' | 'avatars' | 'fabrics',
  folder?: string
): Promise<UploadResult> {
  const ext  = file.name.split('.').pop() ?? 'jpg';
  const path = `${folder ?? 'uploads'}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return { url: publicUrl, path: data.path };
}

export async function uploadMultiple(
  files: FileList | File[],
  bucket: 'products' | 'atelier-styles' | 'avatars' | 'fabrics',
  folder?: string
): Promise<UploadResult[]> {
  const arr = Array.from(files);
  return Promise.all(arr.map(f => uploadImage(f, bucket, folder)));
}

export function validateImageFile(file: File): string | null {
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  const MAX_MB  = 10;
  if (!ALLOWED.includes(file.type)) return 'Only JPEG, PNG, WebP, or AVIF images are allowed.';
  if (file.size > MAX_MB * 1024 * 1024) return `Image must be under ${MAX_MB}MB.`;
  return null;
}

export function createLocalPreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target!.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
