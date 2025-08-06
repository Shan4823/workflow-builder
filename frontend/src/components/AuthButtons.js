import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export default function AuthButtons() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  return (
    <div>
      {!isAuthenticated && (
        <button onClick={loginWithRedirect}>Log in</button>
      )}
      {isAuthenticated && (
        <div>
          <span>Welcome, {user.name}</span>
          <button onClick={() => logout({ returnTo: window.location.origin })}>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
