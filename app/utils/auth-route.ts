export function getProtectedRouteRedirect(path: string, isAuthenticated: boolean): string | null {
  if (path.startsWith('/dashboard') && !isAuthenticated) {
    return '/'
  }

  return null
}
