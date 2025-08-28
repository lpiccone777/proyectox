import React from 'react';
import { GoogleOAuthProvider as Provider } from '@react-oauth/google';

interface GoogleOAuthProviderProps {
  children: React.ReactNode;
}

// This should be set in your environment variables
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

const GoogleOAuthProvider: React.FC<GoogleOAuthProviderProps> = ({ children }) => {
  return (
    <Provider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </Provider>
  );
};

export default GoogleOAuthProvider;