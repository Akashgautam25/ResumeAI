import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthenticatedUser } from '../types/index.js';

export function signAccessToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyAccessToken(token: string): AuthenticatedUser {
  return jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser;
}

export function verifyRefreshToken(token: string): { id: string } {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };
}
