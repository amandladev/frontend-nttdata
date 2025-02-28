import { TestBed } from '@angular/core/testing';
import { EncryptService } from './encrypt.service';
import { environment } from '../../environments/environment.development';

describe('EncryptService', () => {
  let service: EncryptService;
  const testSecretKey = 'test-secret-key-123';

  beforeEach(() => {
    (environment as any).encryptPassword = testSecretKey;

    TestBed.configureTestingModule({
      providers: [EncryptService]
    });

    service = TestBed.inject(EncryptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('encryptPassword', () => {
    it('should encrypt a password', () => {
      const password = 'myPassword123';
      const encrypted = service.encryptPassword(password);

      expect(encrypted).not.toBe(password);
      expect(encrypted.length).toBeGreaterThan(0);
      expect(isBase64(encrypted)).toBeTrue();
    });

    it('should encrypt the same password to different values (due to IV)', () => {
      const password = 'myPassword123';
      const encrypted1 = service.encryptPassword(password);
      const encrypted2 = service.encryptPassword(password);

      // Verify that encrypting the same password twice gives different results
      // This is because AES uses an initialization vector (IV)
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty string', () => {
      const password = '';
      const encrypted = service.encryptPassword(password);

      expect(encrypted.length).toBeGreaterThan(0);
      expect(isBase64(encrypted)).toBeTrue();
    });

    it('should handle special characters', () => {
      const password = '!@#$%^&*()_+';
      const encrypted = service.encryptPassword(password);

      expect(encrypted.length).toBeGreaterThan(0);
      expect(isBase64(encrypted)).toBeTrue();
    });
  });

  describe('decryptPassword', () => {
    it('should decrypt an encrypted password', () => {
      const originalPassword = 'myPassword123';
      const encrypted = service.encryptPassword(originalPassword);
      const decrypted = service.decryptPassowrd(encrypted);

      expect(decrypted).toBe(originalPassword);
    });

    it('should handle empty string encryption/decryption', () => {
      const originalPassword = '';
      const encrypted = service.encryptPassword(originalPassword);
      const decrypted = service.decryptPassowrd(encrypted);

      expect(decrypted).toBe(originalPassword);
    });

    it('should handle special characters encryption/decryption', () => {
      const originalPassword = '!@#$%^&*()_+';
      const encrypted = service.encryptPassword(originalPassword);
      const decrypted = service.decryptPassowrd(encrypted);

      expect(decrypted).toBe(originalPassword);
    });

    it('should handle unicode characters encryption/decryption', () => {
      const originalPassword = '密码测试';
      const encrypted = service.encryptPassword(originalPassword);
      const decrypted = service.decryptPassowrd(encrypted);

      expect(decrypted).toBe(originalPassword);
    });
  });

  describe('encryption/decryption with different keys', () => {
    it('should not decrypt correctly with wrong key', () => {
      // First encryption
      const originalPassword = 'myPassword123';
      const encrypted = service.encryptPassword(originalPassword);

      (environment as any).encryptPassword = 'different-key';

      const decrypted = service.decryptPassowrd(encrypted);

      expect(decrypted).not.toBe(originalPassword);
    });
  });
});

// Helper function to check if a string is base64 encoded
function isBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}