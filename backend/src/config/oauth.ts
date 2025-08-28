export const oauthConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/v1/auth/google/callback'
  },
  apple: {
    clientId: process.env.APPLE_CLIENT_ID || 'YOUR_APPLE_CLIENT_ID',
    teamId: process.env.APPLE_TEAM_ID || 'YOUR_APPLE_TEAM_ID',
    keyId: process.env.APPLE_KEY_ID || 'YOUR_APPLE_KEY_ID',
    privateKey: process.env.APPLE_PRIVATE_KEY || 'YOUR_APPLE_PRIVATE_KEY',
    callbackURL: process.env.APPLE_CALLBACK_URL || 'http://localhost:5001/api/v1/auth/apple/callback'
  }
};