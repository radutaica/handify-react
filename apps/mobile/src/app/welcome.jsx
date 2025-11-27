import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/utils/auth/useAuth";
import { ArrowRight, Shield, Users, Star, Clock } from "lucide-react-native";

const { height } = Dimensions.get("window");

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
          backgroundColor: "#fff",
        }}
      >
        <Text style={{ fontSize: 18, color: "#666" }}>Loading...</Text>
      </View>
    );
  }

  const features = [
    {
      icon: <Users size={24} color="#3B82F6" />,
      title: "Trusted Professionals",
      description: "Connect with verified local service providers",
    },
    {
      icon: <Shield size={24} color="#3B82F6" />,
      title: "Secure & Safe",
      description: "All providers are background checked and insured",
    },
    {
      icon: <Star size={24} color="#3B82F6" />,
      title: "Quality Service",
      description: "Read reviews and ratings from real customers",
    },
    {
      icon: <Clock size={24} color="#3B82F6" />,
      title: "Quick Booking",
      description: "Get help when you need it, fast and reliable",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar style="dark" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
          <View style={{ alignItems: "center", marginBottom: 40 }}>
            <View
              style={{
                width: 80,
                height: 80,
                backgroundColor: "#3B82F6",
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{ color: "white", fontSize: 32, fontWeight: "bold" }}
              >
                S
              </Text>
            </View>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "bold",
                color: "#1F2937",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Welcome to ServiceHub
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#6B7280",
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              Your trusted platform for connecting with local service
              professionals
            </Text>
          </View>

          {/* Features */}
          <View style={{ marginBottom: 40 }}>
            {features.map((feature, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 24,
                  paddingHorizontal: 16,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: "#EBF4FF",
                    borderRadius: 12,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 16,
                  }}
                >
                  {feature.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#1F2937",
                      marginBottom: 4,
                    }}
                  >
                    {feature.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#6B7280",
                      lineHeight: 20,
                    }}
                  >
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Auth Buttons */}
          <View style={{ gap: 16 }}>
            <TouchableOpacity
              onPress={signUp}
              style={{
                backgroundColor: "#3B82F6",
                paddingVertical: 16,
                paddingHorizontal: 24,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "600",
                  marginRight: 8,
                }}
              >
                Get Started
              </Text>
              <ArrowRight size={20} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={signIn}
              style={{
                borderWidth: 2,
                borderColor: "#3B82F6",
                paddingVertical: 14,
                paddingHorizontal: 24,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#3B82F6",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                I Already Have an Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <Text
            style={{
              fontSize: 12,
              color: "#9CA3AF",
              textAlign: "center",
              marginTop: 32,
              lineHeight: 18,
            }}
          >
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
