import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

export interface UserContext {
  userId: string;
  email?: string;
  isAuthenticated: boolean;
}

export interface AuthError {
  code: 'MISSING_AUTH' | 'INVALID_TOKEN' | 'EXPIRED_TOKEN' | 'UNAUTHORIZED';
  message: string;
}

/**
 * Extract user context from request headers or authentication tokens
 */
export async function extractUserContext(request: NextRequest): Promise<UserContext | AuthError> {
  try {
    // Check for Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return {
        code: 'MISSING_AUTH',
        message: 'Authorization header is required'
      };
    }

    // Extract token from Bearer format
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return {
        code: 'INVALID_TOKEN',
        message: 'Invalid authorization token format'
      };
    }

    // For now, we'll use a simple user ID extraction
    // In a real implementation, this would validate JWT tokens
    // and extract user information from the token payload
    const userId = extractUserIdFromToken(token);
    
    if (!userId) {
      return {
        code: 'INVALID_TOKEN',
        message: 'Unable to extract user ID from token'
      };
    }

    return {
      userId,
      isAuthenticated: true
    };
  } catch (error) {
    return {
      code: 'UNAUTHORIZED',
      message: 'Authentication failed'
    };
  }
}

/**
 * Extract user ID from JWT authentication token
 */
function extractUserIdFromToken(token: string): string | null {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.uid || decoded.userId || decoded.sub || null;
  } catch (error) {
    return null;
  }
}

/**
 * Validate user authentication and return user context
 */
export async function requireAuthentication(request: NextRequest): Promise<UserContext> {
  const result = await extractUserContext(request);
  
  if ('code' in result) {
    throw new Error(`Authentication failed: ${result.message}`);
  }
  
  return result;
}

/**
 * Check if the result is an authentication error
 */
export function isAuthError(result: UserContext | AuthError): result is AuthError {
  return 'code' in result;
}

/**
 * Create authentication error response
 */
export function createAuthErrorResponse(error: AuthError) {
  const statusCode = error.code === 'MISSING_AUTH' ? 401 : 403;
  
  return new Response(
    JSON.stringify({
      error: 'Authentication Error',
      message: error.message,
      code: error.code
    }),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}