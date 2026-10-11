import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatRelativeTime,
  isValidEmail,
  isValidPhone,
  isValidKTP,
  calculateAge,
  getInitials,
  truncateText,
  formatFileSize,
  generateId,
} from '../lib/utils';

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format number to Indonesian Rupiah', () => {
      expect(formatCurrency(1000000)).toBe('Rp 1.000.000');
      expect(formatCurrency(2500000)).toBe('Rp 2.500.000');
      expect(formatCurrency(0)).toBe('Rp 0');
    });

    it('should handle decimal values', () => {
      expect(formatCurrency(1234567.89)).toBe('Rp 1.234.568');
    });
  });

  describe('formatNumber', () => {
    it('should format large numbers with K, M, B suffix', () => {
      expect(formatNumber(1500)).toBe('2K');
      expect(formatNumber(1500000)).toBe('1.5M');
      expect(formatNumber(1500000000)).toBe('1.5B');
    });

    it('should return string for small numbers', () => {
      expect(formatNumber(999)).toBe('999');
    });
  });

  describe('formatDate', () => {
    it('should format date in short format', () => {
      const result = formatDate('2024-01-15', 'short');
      expect(result).toContain('2024');
      expect(result).toContain('15');
    });

    it('should format date in long format', () => {
      const result = formatDate('2024-01-15', 'long');
      expect(result).toContain('2024');
      expect(result).toContain('Januari');
    });
  });

  describe('formatRelativeTime', () => {
    it('should return "Baru saja" for recent times', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('Baru saja');
    });

    it('should return minutes for times less than an hour', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 menit yang lalu');
    });

    it('should return hours for times less than a day', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursAgo)).toBe('2 jam yang lalu');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.id')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate Indonesian phone numbers', () => {
      expect(isValidPhone('081234567890')).toBe(true);
      expect(isValidPhone('+6281234567890')).toBe(true);
      expect(isValidPhone('6281234567890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abcdefghijk')).toBe(false);
    });
  });

  describe('isValidKTP', () => {
    it('should validate 16 digit KTP numbers', () => {
      expect(isValidKTP('1234567890123456')).toBe(true);
    });

    it('should reject invalid KTP numbers', () => {
      expect(isValidKTP('123456789012345')).toBe(false);
      expect(isValidKTP('12345678901234567')).toBe(false);
      expect(isValidKTP('abcdefghijklmnop')).toBe(false);
    });
  });

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const today = new Date();
      const twentyYearsAgo = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
      expect(calculateAge(twentyYearsAgo)).toBe(20);
    });
  });

  describe('getInitials', () => {
    it('should get initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('Ahmad Sudirman')).toBe('AS');
    });

    it('should handle single name', () => {
      expect(getInitials('John')).toBe('J');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      expect(truncateText('This is a long text', 10)).toBe('This is a...');
    });

    it('should not truncate short text', () => {
      expect(truncateText('Short', 10)).toBe('Short');
    });
  });

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should include prefix when provided', () => {
      const id = generateId('test');
      expect(id.startsWith('test-')).toBe(true);
    });
  });
});
