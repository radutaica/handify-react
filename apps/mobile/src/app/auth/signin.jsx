import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Phone } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/utils/auth/store";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { colors } from "@/theme/colors";
import AppIcon from "@/components/AppIcon";

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth } = useAuthStore();

  const focusedPadding = 12;
  const paddingAnimation = useRef(
    new Animated.Value(insets.bottom + focusedPadding),
  ).current;

  const animateTo = (value) => {
    Animated.timing(paddingAnimation, {
      toValue: value,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleInputFocus = () => {
    if (Platform.OS === "web") return;
    animateTo(focusedPadding);
  };

  const handleInputBlur = () => {
    if (Platform.OS === "web") return;
    animateTo(insets.bottom + focusedPadding);
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { authApi } = await import("@/api");
      const data = await authApi.signIn(email, password);

      if (data.success && data.jwt) {
        // Extract JWT token from Authorization header and store it
        // The user is now authenticated and can use the token for authenticated requests
        setAuth({
          jwt: data.jwt,
          user: data.user,
        });
        router.replace("/(tabs)");
      } else {
        Alert.alert("Sign In Failed", data.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      Alert.alert("Sign In Failed", error.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingAnimatedView style={styles.container} behavior="padding">
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.content, { paddingTop: insets.top + 20 }]}>
          {/* Header with App Icon */}
          <View style={styles.header}>
            <View style={styles.iconWrapper}>
              <AppIcon size={80} iconSize={32} borderRadius={20} />
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to your account to continue
            </Text>
          </View>

          {/* Sign In Form */}
          <View style={styles.form}>
            {/* Email or Phone Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email or phone</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter your email or phone"
                  placeholderTextColor={colors.text.tertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  style={styles.input}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor={colors.text.tertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  style={styles.input}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.text.tertiary} />
                  ) : (
                    <Eye size={20} color={colors.text.tertiary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity
                onPress={() => router.push("/auth/forgot-password")}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={loading}
              style={styles.signInButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading ? [colors.gray[400], colors.gray[400]] : colors.primary.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signInGradient}
              >
                {loading ? (
                  <View style={styles.buttonContent}>
                    <ActivityIndicator size="small" color={colors.ui.white} />
                    <Text style={styles.signInButtonText}>Signing In...</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.signInButtonText}>Sign in</Text>
                    <ArrowRight size={20} color={colors.ui.white} style={{ marginLeft: 8 }} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Sign In Buttons */}
            <View style={styles.socialButtons}>
              {/* Google Button */}
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <View style={styles.googleIcon}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              {/* Apple Button */}
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <View style={styles.appleIcon}>
                  <Text style={styles.appleIconText}>🍎</Text>
                </View>
                <Text style={styles.socialButtonText}>Continue with Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>
                Don't have an account?{" "}
                <Text
                  style={styles.signUpLink}
                  onPress={() => router.push("/auth/signup")}
                >
                  Sign up
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Animated.View
        style={{
          paddingBottom: paddingAnimation,
        }}
      />
    </KeyboardAvoidingAnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  iconWrapper: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  eyeIcon: {
    marginLeft: 12,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary.teal,
    fontWeight: "500",
  },
  signInButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: colors.primary.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signInGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  signInButtonText: {
    color: colors.ui.white,
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerText: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginHorizontal: 16,
    fontWeight: "500",
  },
  socialButtons: {
    gap: 12,
    marginBottom: 32,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  googleIconText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  appleIcon: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  appleIconText: {
    fontSize: 18,
  },
  socialButtonText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "500",
  },
  signUpContainer: {
    alignItems: "center",
  },
  signUpText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  signUpLink: {
    color: colors.primary.teal,
    fontWeight: "500",
  },
});
