// Security utilities for the experiment platform

// Sanitize text to prevent XSS
export function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Validate file type for uploads
export function validateFileType(
  file: File,
  allowedTypes: string[]
): { valid: boolean; error?: string } {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeType = file.type.toLowerCase();

  // Check extension
  if (!extension || !allowedTypes.some(type => type.toLowerCase() === extension)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Use: ${allowedTypes.join(', ')}`,
    };
  }

  // Validate MIME type
  const mimeMap: Record<string, string[]> = {
    png: ['image/png'],
    jpg: ['image/jpeg'],
    jpeg: ['image/jpeg'],
    pdf: ['application/pdf'],
    docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  };

  const allowedMimes = mimeMap[extension] || [];
  if (!allowedMimes.includes(mimeType)) {
    return {
      valid: false,
      error: 'O tipo MIME do arquivo não corresponde à extensão.',
    };
  }

  return { valid: true };
}

// Validate file size (default 5MB)
export function validateFileSize(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo: ${maxSizeMB}MB`,
    };
  }
  return { valid: true };
}

// Combined file validation
export function validateFile(
  file: File,
  allowedTypes: string[],
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  const typeCheck = validateFileType(file, allowedTypes);
  if (!typeCheck.valid) return typeCheck;

  const sizeCheck = validateFileSize(file, maxSizeMB);
  if (!sizeCheck.valid) return sizeCheck;

  return { valid: true };
}

// Check if admin is authenticated (JWT token stored in session)
export function isAdminAuthenticated(): boolean {
  // Checks for JWT token presence - actual verification happens server-side
  const token = sessionStorage.getItem('admin_token');
  const auth = sessionStorage.getItem('admin_authenticated');
  return auth === 'true' && !!token;
}

// Generate secure session token (for future use)
export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
