import { describe, expect, it } from 'vitest'

import { getMissingFirebaseKeys, hasFirebasePublicConfig } from '~/utils/firebase-config'

describe('firebase config helpers', () => {
  it('missing keys are returned for blank api key, blank project id, blank app id', () => {
    expect(
      getMissingFirebaseKeys({
        firebaseApiKey: '',
        firebaseAuthDomain: 'habbit-tracker.firebaseapp.com',
        firebaseProjectId: '',
        firebaseStorageBucket: 'habbit-tracker.firebasestorage.app',
        firebaseMessagingSenderId: '1234567890',
        firebaseAppId: '',
      }),
    ).toEqual(['firebaseApiKey', 'firebaseProjectId', 'firebaseAppId'])
  })

  it('returns true when all keys are present', () => {
    expect(
      hasFirebasePublicConfig({
        firebaseApiKey: 'api-key',
        firebaseAuthDomain: 'habbit-tracker.firebaseapp.com',
        firebaseProjectId: 'habbit-tracker',
        firebaseStorageBucket: 'habbit-tracker.firebasestorage.app',
        firebaseMessagingSenderId: '1234567890',
        firebaseAppId: '1:1234567890:web:abcdef',
      }),
    ).toBe(true)
  })
})
