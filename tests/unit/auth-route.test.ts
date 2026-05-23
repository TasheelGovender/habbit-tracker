import { describe, expect, it } from 'vitest'

import { getProtectedRouteRedirect } from '~/utils/auth-route'

describe('getProtectedRouteRedirect', () => {
  it('returns the home route for unauthenticated dashboard access', () => {
    expect(getProtectedRouteRedirect('/dashboard', false)).toBe('/')
  })

  it('allows authenticated dashboard access', () => {
    expect(getProtectedRouteRedirect('/dashboard', true)).toBeNull()
  })
})
