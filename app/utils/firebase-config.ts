export interface FirebasePublicConfig {
  firebaseApiKey: string
  firebaseAuthDomain: string
  firebaseProjectId: string
  firebaseStorageBucket: string
  firebaseMessagingSenderId: string
  firebaseAppId: string
}

export const FIREBASE_CONFIG_KEYS: (keyof FirebasePublicConfig)[] = [
  'firebaseApiKey',
  'firebaseAuthDomain',
  'firebaseProjectId',
  'firebaseStorageBucket',
  'firebaseMessagingSenderId',
  'firebaseAppId',
]

export function getMissingFirebaseKeys(config: FirebasePublicConfig) {
  return FIREBASE_CONFIG_KEYS.filter((key) => !config[key].trim())
}

export function hasFirebasePublicConfig(config: FirebasePublicConfig) {
  return getMissingFirebaseKeys(config).length === 0
}
