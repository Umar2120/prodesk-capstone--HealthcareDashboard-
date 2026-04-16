import { NextResponse } from 'next/server';

export function middleware(request) {
  // Middleware is intentionally disabled because the client-side auth guard
  // already protects /dashboard and Supabase client session storage is handled
  // on the browser side.
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
   