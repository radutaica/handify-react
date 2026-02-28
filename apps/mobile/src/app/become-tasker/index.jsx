import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import {
  Briefcase,
  DollarSign,
  Calendar,
  Star,
  ChevronLeft,
  ArrowRight,
} from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

const benefits = [
  {
    icon: DollarSign,
    title: "Set Your Own Rates",
    description: "You decide how much to charge for your services",
  },
  {
    icon: Calendar,
    title: "Flexible Schedule",
    description: "Work when you want, accept jobs that fit your availability",
  },
  {
    icon: Star,
    title: "Build Your Reputation",
    description: "Earn reviews and grow your client base over time",
  },
];

export default function BecomeTaskerWelcome() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#121212" : "#FFFFFF",
        paddingTop: insets.top,
      }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: isDark ? "#2D2D2D" : "#F3F4F6",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ChevronLeft size={24} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={{ alignItems: "center", marginTop: 20, marginBottom: 40 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 24,
              backgroundColor: "#10B981",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Briefcase size={48} color="white" />
          </View>

          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 28,
              color: isDark ? "#FFFFFF" : "#111827",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Become a Service Provider
          </Text>

          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 16,
              color: isDark ? "#B3B3B3" : "#6B7280",
              textAlign: "center",
              lineHeight: 24,
            }}
          >
            Join our community of skilled professionals and start earning by
            offering your services to customers in your area.
          </Text>
        </View>

        {/* Benefits */}
        <View style={{ marginBottom: 40 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: isDark ? "#FFFFFF" : "#111827",
              marginBottom: 20,
            }}
          >
            Why become a provider?
          </Text>

          {benefits.map((benefit, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                backgroundColor: isDark ? "#1E1E1E" : "#F9FAFB",
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: isDark ? "#10B98120" : "#D1FAE5",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 16,
                }}
              >
                <benefit.icon size={24} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: isDark ? "#FFFFFF" : "#111827",
                    marginBottom: 4,
                  }}
                >
                  {benefit.title}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: isDark ? "#B3B3B3" : "#6B7280",
                    lineHeight: 20,
                  }}
                >
                  {benefit.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Steps Preview */}
        <View
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#F9FAFB",
            borderRadius: 16,
            padding: 20,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              color: isDark ? "#FFFFFF" : "#111827",
              marginBottom: 16,
            }}
          >
            Getting started is easy
          </Text>

          {[
            "Select your service categories",
            "Add your profile details",
            "Review and submit",
          ].map((step, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: index < 2 ? 12 : 0,
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: "#10B981",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 14,
                    color: "white",
                  }}
                >
                  {index + 1}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: isDark ? "#B3B3B3" : "#4B5563",
                }}
              >
                {step}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: isDark ? "#121212" : "#FFFFFF",
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
          borderTopWidth: 1,
          borderTopColor: isDark ? "#2D2D2D" : "#E5E7EB",
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/become-tasker/categories")}
          style={{
            backgroundColor: "#10B981",
            borderRadius: 12,
            paddingVertical: 16,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              color: "white",
              marginRight: 8,
            }}
          >
            Get Started
          </Text>
          <ArrowRight size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
