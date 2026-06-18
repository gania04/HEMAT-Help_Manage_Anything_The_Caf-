import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Cek apakah cookie sesi ada
  const session = request.cookies.get('hemat_session')?.value;
  
  // Rute yang public (tidak perlu login)
  const isPublicPath = request.nextUrl.pathname.startsWith('/login') || 
                       request.nextUrl.pathname.startsWith('/register') ||
                       request.nextUrl.pathname.startsWith('/api/') ||
                       request.nextUrl.pathname.startsWith('/_next') || 
                       request.nextUrl.pathname.startsWith('/favicon.ico');

  // Jika tidak ada sesi dan mengakses private path, redirect ke /login
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Jika sudah login dan mencoba mengakses halaman /login, kembalikan ke dashboard
  if (session && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
