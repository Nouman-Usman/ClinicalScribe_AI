export function sanitizeText(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function validateMimeType(file: File, allowed: string[]): boolean {
  return allowed.includes(file.type);
}

export function sanitizeSVG(svgString: string): string {
  const div = document.createElement('div');
  div.innerHTML = svgString;
  
  const scripts = div.querySelectorAll('script, iframe, object, embed, form');
  scripts.forEach(el => el.remove());
  
  const onEventAttrs = Array.from(div.querySelectorAll('*')).forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });
  });
  
  return div.innerHTML;
}

export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const maxSize = 50 * 1024 * 1024;
  
  return validTypes.includes(file.type) && file.size <= maxSize;
}

export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function hashSensitiveData(data: string): string {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(data)).then(buf =>
    Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('')
  );
}
