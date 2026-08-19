import prisma from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/response';

const JWT_SECRET = process.env.JWT_SECRET || 'chips_erp_super_secret_jwt_key_2026';

export class AuthService {
  static async login(email: string, password: string) {
    const cleanEmail = email.toLowerCase().trim();
    console.log(`[AUTH] Login attempt email=${cleanEmail}`);

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      console.warn(`[AUTH] Login failed reason=USER_NOT_FOUND email=${cleanEmail}`);
      throw new ApiError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
      console.warn(`[AUTH] Login failed reason=USER_INACTIVE email=${cleanEmail}`);
      throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.warn(`[AUTH] Login failed reason=INVALID_CREDENTIALS email=${cleanEmail}`);
      throw new ApiError(401, 'Invalid email or password');
    }

    console.log(`[AUTH] Login success userId=${user.id} role=${user.role}`);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }
}
