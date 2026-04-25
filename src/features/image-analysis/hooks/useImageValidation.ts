import { useCallback } from 'react';

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationOptions {
  maxFileSize?: number; // in bytes, default 50MB
  supportedFormats?: string[];
  minDimensions?: { width: number; height: number };
  maxDimensions?: { width: number; height: number };
}

const DEFAULT_OPTIONS: ValidationOptions = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  supportedFormats: ['image/jpeg', 'image/png', 'image/jpg'],
  minDimensions: { width: 256, height: 256 },
  maxDimensions: { width: 4096, height: 4096 }
};

export function useImageValidation(options: ValidationOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  const validateFile = useCallback(
    (file: File, fieldName: string = 'Image'): ValidationError[] => {
      const errors: ValidationError[] = [];

      // Check file type
      if (!config.supportedFormats!.includes(file.type)) {
        errors.push({
          field: fieldName,
          message: `Invalid format. Supported: ${config.supportedFormats!.join(', ')}`
        });
      }

      // Check file size
      if (file.size > config.maxFileSize!) {
        const sizeMB = (config.maxFileSize! / 1024 / 1024).toFixed(0);
        errors.push({
          field: fieldName,
          message: `File exceeds ${sizeMB}MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`
        });
      }

      return errors;
    },
    [config]
  );

  const validateImageDimensions = useCallback(
    async (file: File, fieldName: string = 'Image'): Promise<ValidationError[]> => {
      return new Promise((resolve) => {
        const img = new Image();
        const errors: ValidationError[] = [];

        img.onload = () => {
          const { width, height } = img;

          if (config.minDimensions && (width < config.minDimensions.width || height < config.minDimensions.height)) {
            errors.push({
              field: fieldName,
              message: `Image too small. Minimum: ${config.minDimensions.width}x${config.minDimensions.height}px`
            });
          }

          if (config.maxDimensions && (width > config.maxDimensions.width || height > config.maxDimensions.height)) {
            errors.push({
              field: fieldName,
              message: `Image too large. Maximum: ${config.maxDimensions.width}x${config.maxDimensions.height}px`
            });
          }

          resolve(errors);
        };

        img.onerror = () => {
          errors.push({
            field: fieldName,
            message: 'Could not read image dimensions'
          });
          resolve(errors);
        };

        img.src = URL.createObjectURL(file);
      });
    },
    [config]
  );

  const validateBoth = useCallback(
    async (file: File, fieldName: string = 'Image'): Promise<ValidationError[]> => {
      const fileErrors = validateFile(file, fieldName);
      if (fileErrors.length > 0) return fileErrors;

      return validateImageDimensions(file, fieldName);
    },
    [validateFile, validateImageDimensions]
  );

  return {
    validateFile,
    validateImageDimensions,
    validateBoth
  };
}
