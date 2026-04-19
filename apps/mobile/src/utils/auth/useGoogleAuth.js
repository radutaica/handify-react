import { useState, useEffect } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useAuthStore } from "./store";
import { oauthApi } from "@/api/oauth";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setAuth } = useAuthStore();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      scopes: ["openid", "profile", "email"],
      responseType: "id_token",
      redirectUri: AuthSession.makeRedirectUri({
        scheme: "handify",
      }),
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleResponse(response);
    }
  }, [response]);

  const handleGoogleResponse = async (response) => {
    setLoading(true);
    setError(null);
    try {
      const idToken =
        response.params?.id_token || response.authentication?.idToken;
      if (!idToken) {
        throw new Error("No ID token received");
      }

      // Decode basic info from ID token (JWT payload)
      const payload = JSON.parse(atob(idToken.split(".")[1]));

      const result = await oauthApi.socialSignIn("google_oauth2", idToken, {
        email: payload.email,
        first_name: payload.given_name || "",
        last_name: payload.family_name || "",
        profile_image_url: payload.picture || "",
        uid: payload.sub,
      });

      if (result.success && result.jwt) {
        setAuth({ jwt: result.jwt, user: result.user });
        return { success: true };
      } else {
        throw new Error(result.error || "Authentication failed");
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    setError(null);
    try {
      await promptAsync();
    } catch (err) {
      setError(err.message);
    }
  };

  return { signIn, loading, error, ready: !!request };
}

export default useGoogleAuth;
