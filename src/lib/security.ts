// Security utilities for the experiment platform

// Sanitize text to prevent XSS (removes dangerous tags but preserves readable text)
export function sanitizeText(text: string): string {
  if (!text) return '';
  // First decode any existing HTML entities to get the real characters
  const decoded = decodeHtmlEntities(text);
  // Then remove any dangerous HTML tags while preserving safe content
  return decoded
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^>]*>/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<(?!\/?(?:p|br|h[1-6]|ul|ol|li|strong|em|b|i|u|span|div|hr)\b)[^>]+>/gi, '');
}

// Decode HTML entities to display readable text
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
    '&apos;': "'",
    '&#39;': "'",
    '&#47;': '/',
    '&nbsp;': ' ',
    '&ndash;': '\u2013',
    '&mdash;': '\u2014',
    '&lsquo;': '\u2018',
    '&rsquo;': '\u2019',
    '&ldquo;': '\u201C',
    '&rdquo;': '\u201D',
    '&hellip;': '\u2026',
    '&copy;': '\u00A9',
    '&reg;': '\u00AE',
    '&trade;': '\u2122',
    '&deg;': '\u00B0',
    '&ordm;': '\u00BA',
    '&ordf;': '\u00AA',
  };
  
  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, 'g'), char);
  }
  // Handle numeric entities like &#47; or &#x2F;
  result = result.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
  return result;
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
