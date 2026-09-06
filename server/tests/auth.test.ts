import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../src/utils/password.js';
import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from '../src/utils/jwt.js';

describe('Auth Utilities & Security Tests', () => {
  it('should hash and verify passwords with bcrypt', async () => {
    const rawPassword = 'StrongSecurePassword123!';
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toBe(rawPassword);
    expect(hash.startsWith('$2')).toBe(true);

    const isMatch = await comparePassword(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isWrong = await comparePassword('WrongPassword123!', hash);
    expect(isWrong).toBe(false);
  });

  it('should sign and verify JWT access and refresh tokens', () => {
    const testUser = {
      id: 'usr-12345',
      email: 'test@example.com',
      name: 'Test Engineer',
      role: 'USER',
    };

    const token = signAccessToken(testUser);
    expect(typeof token).toBe('string');

    const decoded = verifyAccessToken(token);
    expect(decoded.id).toBe(testUser.id);
    expect(decoded.email).toBe(testUser.email);

    const refreshToken = signRefreshToken(testUser.id);
    const decodedRefresh = verifyRefreshToken(refreshToken);
    expect(decodedRefresh.id).toBe(testUser.id);
  });
});
