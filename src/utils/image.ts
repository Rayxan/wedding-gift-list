export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateImage(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return 'Apenas imagens JPEG e PNG são permitidas.';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'A imagem deve ter no máximo 5 MB.';
  }
  return null;
}

export function generateUniqueFileName(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() ?? 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `gift-${timestamp}-${random}.${ext}`;
}
