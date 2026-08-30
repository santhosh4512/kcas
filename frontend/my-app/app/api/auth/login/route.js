import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB, { ensureDefaultAdmin } from '@/lib/db';
import User from '@/lib/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'kcas_super_secure_jwt_secret_key_2026_tier1';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

export async function POST(req) {
  try {
    await connectDB();
    await ensureDefaultAdmin();

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide both email and password.' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials. Please verify your email and password.' },
        { status: 401 }
      );
    }

    if (user.status === 'Inactive') {
      return NextResponse.json(
        { success: false, message: 'This account has been deactivated by the Administrator.' },
        { status: 403 }
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials. Please verify your email and password.' },
        { status: 401 }
      );
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
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
    console.error('Login route error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}
