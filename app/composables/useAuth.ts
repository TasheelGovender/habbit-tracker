import { GoogleAuthProvider, signInWithPopup, signOut, type User } from 'firebase/auth'

export function useAuth() {
  const auth = useFirebaseAuth()
  const currentUser = useCurrentUser()
  const isSigningIn = useState('auth:isSigningIn', () => false)
  const authError = useState<string | null>('auth:error', () => null)

  async function signInWithGoogle(): Promise<User> {
    if (!auth) {
      const message = 'Firebase Auth is not available.'
      authError.value = message
      throw new Error(message)
    }

    isSigningIn.value = true
    authError.value = null

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      return result.user
    }
    catch (error) {
      authError.value = error instanceof Error ? error.message : 'Unable to sign in with Google.'
      throw error
    }
    finally {
      isSigningIn.value = false
    }
  }

  async function signOutUser() {
    if (!auth) {
      return
    }

    await signOut(auth)
  }

  return {
    auth,
    currentUser,
    isSigningIn,
    authError,
    signInWithGoogle,
    signOutUser,
  }
}
