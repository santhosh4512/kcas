import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB, { ensureDefaultAdmin } from '@/lib/db';
import User from '@/lib/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'kcas_super_secure_jwt_secret_key_2026_tier1';

export async function GET(req) {
  try {
    await connectDB();
    await ensureDefaultAdmin();

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to access this route' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    if (user.status === 'Inactive') {
      return NextResponse.json(
        { success: false, message: 'User account is deactivated' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        designation: user.designation,
        employeeId: user.employeeId,
        mustChangePassword: Boolean(user.mustChangePassword),
        permissions: user.permissions || [],
        profilePhoto: user.profilePhoto || '',
        avatar: user.avatar || '',
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    console.error('Auth /me route error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
