import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getUserModel } from './models/user';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
  userId: number;
  email: string;
  name: string;
  role: string;
}

/**
 * Middleware function to authenticate API requests
 * Extracts token from cookies or Authorization header and validates it
 */
export async function authenticateRequest(request: NextRequest): Promise<{
  user: AuthUser | null;
  error: NextResponse | null;
}> {
  // Get token from cookie or Authorization header
  const token =
    request.cookies.get('authToken')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    if (!userId) {
      console.log('No userId in token');
      return {
        user: null,
        error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }),
      };
    }

    // Query database to get current user details
    const UserModel = await getUserModel();
    const RoleModel = await import('./models/role').then((m) =>
      m.getRoleModel()
    );

    const user = await UserModel.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'User not found or deactivated' },
          { status: 401 }
        ),
      };
    }

    // Get user role
    const userRole = await RoleModel.findByPk((user as any).roleId);

    if (!userRole || userRole.name !== 'admin') {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        ),
      };
    }

    const authUser: AuthUser = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: userRole.name,
    };

    return { user: authUser, error: null };
  } catch (error) {
    console.log('Token verification error:', error);
    return {
      user: null,
      error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }),
    };
  }
}

/**
 * Higher-order function to wrap API handlers with authentication
 */
export function withAuth(
  handler: (
    request: NextRequest,
    user: AuthUser,
    params?: any
  ) => Promise<NextResponse> | NextResponse
) {
  return async (
    request: NextRequest,
    context?: { params?: any }
  ): Promise<NextResponse> => {
    const { user, error } = await authenticateRequest(request);

    if (error) {
      return error;
    }

    return handler(request, user!, context?.params);
  };
}
