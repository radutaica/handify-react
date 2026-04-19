import { useState } from "react";
import { Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useAuthStore } from "./store";
import { oauthApi } from "@/api/oauth";

export function useAppleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setAuth } = useAuthStore();

  const isAvailable = Platform.OS === "ios";

  const signIn = async () => {
    if (!isAvailable) {
      setError("Apple Sign In is only available on iOS");
      return { success: false, error: "Not available on this platform" };
    }

    setLoading(true);
    setError(null);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const identityToken = credential.identityToken;
      if (!identityToken) {
        throw new Error("No identity token received");
      }

      const result = await oauthApi.socialSignIn("apple", identityToken, {
        email: credential.email || "",
        first_name: credential.fullName?.givenName || "",
        last_name: credential.fullName?.familyName || "",
        uid: credential.user,
      });

      if (result.success && result.jwt) {
        setAuth({ jwt: result.jwt, user: result.user });
        return { success: true };
      } else {
        throw new Error(result.error || "Authentication failed");
      }
    } catch (err) {
      if (err.code === "ERR_REQUEST_CANCELED") {
        // User cancelled - not an error
        return { success: false, cancelled: true };
      }
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { signIn, loading, error, isAvailable };
}

export default useAppleAuth;
