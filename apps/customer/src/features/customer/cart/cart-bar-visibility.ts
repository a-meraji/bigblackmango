/** Routes where the floating “پرداخت” bar must not appear. */
export function isFloatingCartBarHidden(pathname: string): boolean {
  if (pathname === '/checkout' || pathname === '/orders') return true;
  if (pathname.startsWith('/auth/')) return true;
  return false;
}
