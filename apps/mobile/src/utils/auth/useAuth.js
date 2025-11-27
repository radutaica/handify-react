import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect } from "react";
import { useAuthStore, authKey } from "./store";

/**
 * This hook provides authentication functionality.
 * It now uses native mobile auth screens instead of web views.
 */
export const useAuth = () => {
  const { isReady, auth, setAuth } = useAuthStore();

  const initiate = useCallback(() => {
    SecureStore.getItemAsync(authKey).then((auth) => {
      useAuthStore.setState({
        auth: auth ? JSON.parse(auth) : null,
        isReady: true,
      });
    });
  }, []);

  useEffect(() => {}, []);

  const signIn = useCallback(() => {
    router.push("/auth/signin");
  }, []);

  const signUp = useCallback(() => {
    router.push("/auth/signup");
  }, []);

  const signOut = useCallback(() => {
    setAuth(null);
    router.replace("/welcome");
  }, [setAuth]);

  return {
    isReady,
    isAuthenticated: isReady ? !!auth : null,
    signIn,
    signOut,
    signUp,
    auth,
    setAuth,
    initiate,
  };
};

/**
 * This hook will automatically navigate to authentication if the user is not authenticated.
 */
export const useRequireAuth = (options) => {
  const { isAuthenticated, isReady } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && isReady) {
      const mode = options?.mode || "signin";
      router.push(`/auth/${mode}`);
    }
  }, [isAuthenticated, isReady, options?.mode]);
};

export default useAuth;
