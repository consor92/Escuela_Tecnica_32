import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

const protectedRoutes = ['/dashboard', '/admin', '/profile', '/docente', '/preceptor', '/referente', '/automatricula'];
const publicRoutes = ['/login', '/'];

const roleRedirects: Record<string, Record<number, string>> = {
  '/admin': { 1: '' },
  '/docente': { 3: '' },
  '/preceptor': { 4: '' },
  '/referente': { 5: '' },
  '/dashboard': { 2: '' },
};

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = req.cookies.get('session')?.value;
  const session = cookie ? await decrypt(cookie).catch(() => null) : null;

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (isPublicRoute && session) {
    if (session.user.role_id === 1) {
      return NextResponse.redirect(new URL('/admin', req.nextUrl));
    }
    if (session.user.role_id === 3) {
      return NextResponse.redirect(new URL('/docente', req.nextUrl));
    }
    if (session.user.role_id === 4) {
      return NextResponse.redirect(new URL('/preceptor', req.nextUrl));
    }
    if (session.user.role_id === 5) {
      return NextResponse.redirect(new URL('/referente', req.nextUrl));
    }
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  if (session) {
    const roleId = session.user.role_id;

    if (path.startsWith('/admin') && roleId !== 1) {
      return NextResponse.redirect(new URL('/', req.nextUrl));
    }
    if (path.startsWith('/docente') && roleId !== 3 && roleId !== 1) {
      return NextResponse.redirect(new URL('/', req.nextUrl));
    }
    if (path.startsWith('/preceptor') && roleId !== 4 && roleId !== 1) {
      return NextResponse.redirect(new URL('/', req.nextUrl));
    }
    if (path.startsWith('/referente') && roleId !== 5 && roleId !== 1) {
      return NextResponse.redirect(new URL('/', req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
