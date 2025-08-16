import { Injectable, Logger } from '@nestjs/common';
import { SecurityConfig } from '../config/security.config';
import * as crypto from 'crypto';

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  fileType: string;
  fileCategory: 'image' | 'audio' | 'video' | null;
  isSafe: boolean;
}

export interface FileSecurityInfo {
  originalName: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  checksum: string;
}

@Injectable()
export class FileSecurityService {
  private readonly logger = new Logger(FileSecurityService.name);

  /**
   * Comprehensive file validation and security check
   */
  async validateFile(file: FileSecurityInfo): Promise<FileValidationResult> {
    const errors: string[] = [];
    let fileType = '';
    let fileCategory: 'image' | 'audio' | 'video' | null = null;
    let isSafe = true;

    try {
      // 1. Basic file validation
      const basicValidation = this.validateBasicFileProperties(file);
      if (!basicValidation.isValid) {
        errors.push(...basicValidation.errors);
        isSafe = false;
      }

      // 2. File type validation
      const typeValidation = this.validateFileType(file);
      if (!typeValidation.isValid) {
        errors.push(...typeValidation.errors);
        isSafe = false;
      } else {
        fileType = typeValidation.fileType;
        fileCategory = typeValidation.fileCategory;
      }

      // 3. File size validation
      const sizeValidation = this.validateFileSize(file, fileCategory);
      if (!sizeValidation.isValid) {
        errors.push(...sizeValidation.errors);
        isSafe = false;
      }

      // 4. Content validation
      const contentValidation = await this.validateFileContent(
        file,
        fileCategory,
      );
      if (!contentValidation.isValid) {
        errors.push(...contentValidation.errors);
        isSafe = false;
      }

      // 5. Malware detection (basic heuristic)
      const malwareCheck = this.detectMaliciousPatterns(file);
      if (!malwareCheck.isSafe) {
        errors.push(...malwareCheck.errors);
        isSafe = false;
      }

      // 6. File extension vs MIME type consistency
      const extensionCheck = this.validateExtensionConsistency(file);
      if (!extensionCheck.isValid) {
        errors.push(...extensionCheck.errors);
        isSafe = false;
      }

      return {
        isValid: errors.length === 0,
        errors,
        fileType,
        fileCategory,
        isSafe,
      };
    } catch (error) {
      this.logger.error(`File validation error: ${error.message}`, error.stack);
      errors.push('File validation failed');
      return {
        isValid: false,
        errors,
        fileType: '',
        fileCategory: null,
        isSafe: false,
      };
    }
  }

  /**
   * Validate basic file properties
   */
  private validateBasicFileProperties(file: FileSecurityInfo): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!file.buffer || file.buffer.length === 0) {
      errors.push('File buffer is empty');
    }

    if (!file.mimetype) {
      errors.push('File MIME type is missing');
    }

    if (!file.originalName) {
      errors.push('File name is missing');
    }

    if (file.size <= 0) {
      errors.push('File size is invalid');
    }

    // Check for null bytes or suspicious patterns in filename
    if (file.originalName.includes('\0') || file.originalName.includes('..')) {
      errors.push('File name contains invalid characters');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate file type and MIME type
   */
  private validateFileType(file: FileSecurityInfo): {
    isValid: boolean;
    errors: string[];
    fileType: string;
    fileCategory: 'image' | 'audio' | 'video' | null;
  } {
    const errors: string[] = [];
    let fileCategory: 'image' | 'audio' | 'video' | null = null;

    // Check against allowed MIME types
    const allowedMimeTypes = SecurityConfig.upload.allowedMimeTypes;
    if (!allowedMimeTypes.includes(file.mimetype)) {
      errors.push(`MIME type '${file.mimetype}' is not allowed`);
    }

    // Determine file category
    if (file.mimetype.startsWith('image/')) {
      fileCategory = 'image';
    } else if (file.mimetype.startsWith('audio/')) {
      fileCategory = 'audio';
    } else if (file.mimetype.startsWith('video/')) {
      fileCategory = 'video';
    } else {
      errors.push('File type could not be determined');
    }

    return {
      isValid: errors.length === 0,
      errors,
      fileType: file.mimetype,
      fileCategory,
    };
  }

  /**
   * Validate file size
   */
  private validateFileSize(
    file: FileSecurityInfo,
    fileCategory: 'image' | 'audio' | 'video' | null,
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = SecurityConfig.upload.maxFileSize;

    if (file.size > maxSize) {
      errors.push(
        `File size ${Math.round(file.size / (1024 * 1024))}MB exceeds maximum allowed size of ${Math.round(maxSize / (1024 * 1024))}MB`,
      );
    }

    // Additional category-specific size checks
    if (fileCategory === 'image' && file.size > 5 * 1024 * 1024) {
      // 5MB for images
      errors.push('Image file size exceeds 5MB limit');
    }

    if (fileCategory === 'audio' && file.size > 25 * 1024 * 1024) {
      // 25MB for audio
      errors.push('Audio file size exceeds 25MB limit');
    }

    if (fileCategory === 'video' && file.size > 50 * 1024 * 1024) {
      // 50MB for video
      errors.push('Video file size exceeds 50MB limit');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate file content (basic checks)
   */
  private async validateFileContent(
    file: FileSecurityInfo,
    fileCategory: 'image' | 'audio' | 'video' | null,
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check file magic numbers (file signatures) - optional for now
      // const isValidSignature = this.validateFileSignature(file.buffer, fileCategory);
      // if (!isValidSignature) {
      //   errors.push('File signature does not match declared MIME type');
      // }

      // Additional content validation based on file type
      if (fileCategory === 'image') {
        const imageValidation = this.validateImageContent(file.buffer);
        if (!imageValidation.isValid) {
          errors.push(...imageValidation.errors);
        }
      }

      if (fileCategory === 'audio') {
        const audioValidation = this.validateAudioContent(file.buffer);
        if (!audioValidation.isValid) {
          errors.push(...audioValidation.errors);
        }
      }

      if (fileCategory === 'video') {
        const videoValidation = this.validateVideoContent(file.buffer);
        if (!videoValidation.isValid) {
          errors.push(...videoValidation.errors);
        }
      }
    } catch (error) {
      this.logger.error(`Content validation error: ${error.message}`);
      errors.push('File content validation failed');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate file signature (magic numbers)
   */
  private validateFileSignature(
    buffer: Buffer,
    fileCategory: 'image' | 'audio' | 'video' | null,
  ): boolean {
    if (buffer.length < 4) return false;

    const header = buffer.slice(0, 4);
    const headerHex = header.toString('hex').toUpperCase();

    // Common file signatures
    const signatures: Record<string, Record<string, string[]>> = {
      image: {
        jpeg: ['FFD8FF'],
        png: ['89504E47'],
        gif: ['47494638'],
        webp: ['52494646'], // RIFF header
      },
      audio: {
        mp3: ['494433', 'FFFB', 'FFF3', 'FFF2'], // ID3 or MPEG
        wav: ['52494646'], // RIFF header
        ogg: ['4F676753'], // OggS
      },
      video: {
        mp4: ['00000020', '0000001C'], // MP4 box headers
        webm: ['1A45DFA3'], // EBML header
      },
    };

    if (!fileCategory || !signatures[fileCategory]) return false;

    const categorySignatures = signatures[fileCategory];
    return Object.values(categorySignatures)
      .flat()
      .some((sig) => headerHex.startsWith(sig));
  }

  /**
   * Validate image content
   */
  private validateImageContent(buffer: Buffer): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check for minimum image size
    if (buffer.length < 100) {
      errors.push('Image file is too small to be valid');
    }

    // Check for maximum dimensions (basic check)
    // This is a simplified check - in production you might want to actually decode the image
    if (buffer.length > 50 * 1024 * 1024) {
      // 50MB
      errors.push('Image file is suspiciously large');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate audio content
   */
  private validateAudioContent(buffer: Buffer): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check for minimum audio size
    if (buffer.length < 1000) {
      errors.push('Audio file is too small to be valid');
    }

    // Check for maximum size
    if (buffer.length > 100 * 1024 * 1024) {
      // 100MB
      errors.push('Audio file is suspiciously large');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate video content
   */
  private validateVideoContent(buffer: Buffer): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check for minimum video size
    if (buffer.length < 10000) {
      errors.push('Video file is too small to be valid');
    }

    // Check for maximum size
    if (buffer.length > 200 * 1024 * 1024) {
      // 200MB
      errors.push('Video file is suspiciously large');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Detect malicious patterns in file
   */
  private detectMaliciousPatterns(file: FileSecurityInfo): {
    isSafe: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check for executable patterns in filename
    const executableExtensions = [
      '.exe',
      '.bat',
      '.cmd',
      '.com',
      '.pif',
      '.scr',
      '.vbs',
      '.js',
      '.jar',
      '.msi',
    ];
    const fileName = file.originalName.toLowerCase();

    if (executableExtensions.some((ext) => fileName.endsWith(ext))) {
      errors.push('Executable files are not allowed');
    }

    // Check for double extensions (e.g., image.jpg.exe)
    if (fileName.split('.').length > 2) {
      const lastTwoExtensions = fileName.split('.').slice(-2).join('.');
      if (executableExtensions.some((ext) => lastTwoExtensions.endsWith(ext))) {
        errors.push('File has suspicious double extension');
      }
    }

    // Check for null bytes or control characters in content
    if (file.buffer.includes(0)) {
      errors.push('File contains null bytes');
    }

    // Check for suspicious patterns in content
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload/i,
      /onerror/i,
      /eval\s*\(/i,
    ];

    const contentString = file.buffer.toString(
      'utf8',
      0,
      Math.min(1000, file.buffer.length),
    );
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(contentString)) {
        errors.push('File contains suspicious content patterns');
        break;
      }
    }

    return { isSafe: errors.length === 0, errors };
  }

  /**
   * Validate extension consistency with MIME type
   */
  private validateExtensionConsistency(file: FileSecurityInfo): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const fileName = file.originalName.toLowerCase();
    const extension = fileName.split('.').pop();

    if (!extension) {
      errors.push('File has no extension');
      return { isValid: false, errors };
    }

    // MIME type to extension mapping
    const mimeToExtension: { [key: string]: string[] } = {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/gif': ['gif'],
      'image/webp': ['webp'],
      'audio/mpeg': ['mp3'],
      'audio/wav': ['wav'],
      'audio/ogg': ['ogg'],
      'audio/webm': ['webm'],
      'video/mp4': ['mp4'],
      'video/webm': ['webm'],
      'video/quicktime': ['mov'],
    };

    const expectedExtensions = mimeToExtension[file.mimetype];
    if (!expectedExtensions) {
      errors.push(`Unknown MIME type: ${file.mimetype}`);
      return { isValid: false, errors };
    }

    if (!expectedExtensions.includes(extension)) {
      errors.push(
        `File extension '${extension}' does not match MIME type '${file.mimetype}'`,
      );
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Generate file checksum for integrity
   */
  generateChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Log security event
   */
  logSecurityEvent(
    file: FileSecurityInfo,
    validationResult: FileValidationResult,
    ip: string,
  ): void {
    if (!validationResult.isValid || !validationResult.isSafe) {
      this.logger.warn(`[SECURITY] File upload blocked:`, {
        fileName: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
        ip,
        errors: validationResult.errors,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
