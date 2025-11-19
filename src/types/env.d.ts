declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      NEXT_PUBLIC_API_BASE_URL?: string;
      NEXT_PUBLIC_GATEWAY_URL?: string;
      NEXT_PUBLIC_WS_URL?: string;
      NEXTAUTH_SECRET?: string;
      NEXTAUTH_URL?: string;
    }
  }
}

export {};