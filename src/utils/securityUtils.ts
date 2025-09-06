// Security utilities for sanitizing HTML content

// Simple HTML sanitizer (in a real application, use a library like DOMPurify)
export const sanitizeHtml = (html: string): string => {
  // Basic sanitization - remove script tags and javascript: links
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/on\w+=[^>\s]*/gi, '');
};

// Validate image URLs
export const isValidImageUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

// Validate link URLs
export const isValidLinkUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'mailto:';
  } catch {
    // Allow relative URLs
    return url.startsWith('/') || url.startsWith('#');
  }
};