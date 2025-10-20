// lib/api/auth.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  requiresTwoFactor: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface LogoutResponse {
  message: string;
  success: boolean;
}

export interface ValidateTokenResponse {
  valid: boolean;
  user: any;
  expiresAt?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface Verify2FARequest {
  userId: string;
  code: string;
}

export interface Setup2FAResponse {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

class AuthApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

async function makeAuthRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AuthApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof AuthApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new AuthApiError(
      error instanceof Error ? error.message : 'Network error occurred'
    );
  }
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return makeAuthRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async logout(token: string): Promise<LogoutResponse> {
    return makeAuthRequest<LogoutResponse>('/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async validateToken(token: string): Promise<ValidateTokenResponse> {
    return makeAuthRequest<ValidateTokenResponse>('/auth/validate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return makeAuthRequest<RefreshTokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async verify2FA(request: Verify2FARequest): Promise<LoginResponse> {
    return makeAuthRequest<LoginResponse>('/auth/verify-2fa', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async setup2FA(token: string): Promise<Setup2FAResponse> {
    return makeAuthRequest<Setup2FAResponse>('/auth/setup-2fa', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return makeAuthRequest<ForgotPasswordResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return makeAuthRequest<ResetPasswordResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};

export { AuthApiError };