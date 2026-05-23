import { getProtectedRouteRedirect } from '~/utils/auth-route'

export default defineNuxtRouteMiddleware(async (to) => {
  const user = await getCurrentUser()
  const redirectPath = getProtectedRouteRedirect(to.path, Boolean(user))

  if (redirectPath) {
    return navigateTo(redirectPath)
  }
})
