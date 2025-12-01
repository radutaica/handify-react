import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuth } from "@/utils/auth/useAuth";
import { ArrowRight } from "lucide-react-native";
import { colors } from "@/theme/colors";
import AppIcon from "@/components/AppIcon";


export default function WelcomeScreen() {
  const router = useRouter();
  const { signIn, signUp, isAuthenticated, isReady } = useAuth();

  // If user is already authenticated, redirect to main app
  React.useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isReady, isAuthenticated]);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background.tertiary,
        }}
      >
        <Text style={{ fontSize: 18, color: colors.text.secondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        {/* App Icon */}
        <View style={styles.iconWrapper}>
          <AppIcon size={100} iconSize={40} />
        </View>

        {/* App Name */}
        <Text style={styles.appName}>ServiceHub</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>
          Connect with trusted service providers in your area or offer your
          professional skills
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {/* Get Started Button */}
          <TouchableOpacity
            onPress={signUp}
            style={styles.getStartedButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={colors.primary.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.getStartedGradient}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
              <ArrowRight size={20} color={colors.ui.white} style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={signIn}
            style={styles.signInButton}
            activeOpacity={0.8}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
  },
  iconWrapper: {
    marginBottom: 32,
  },
  appName: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: "center",
  },
  tagline: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 60,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
    marginTop: "auto",
  },
  getStartedButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: colors.primary.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  getStartedText: {
    color: colors.ui.white,
    fontSize: 16,
    fontWeight: "600",
  },
  signInButton: {
    backgroundColor: colors.ui.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  signInText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});
