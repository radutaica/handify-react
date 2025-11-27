import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/utils/auth/useAuth";
import { User, Phone, MapPin, Check } from "lucide-react-native";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isReady } = useAuth();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    user_type: "customer",
    location_address: "",
    location_city: "",
    location_state: "",
    location_zip: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace("/welcome");
    }
  }, [isReady, isAuthenticated]);

  // Load any pending data from localStorage (from signup flow)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pendingFirstName = localStorage.getItem("pendingFirstName");
      const pendingLastName = localStorage.getItem("pendingLastName");

      if (pendingFirstName || pendingLastName) {
        setFormData((prev) => ({
          ...prev,
          first_name: pendingFirstName || "",
          last_name: pendingLastName || "",
        }));
      }
    }
  }, []);

  const handleComplete = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      Alert.alert("Required Fields", "Please enter your first and last name.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/profile/complete", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to complete profile");
      }

      const result = await response.json();

      // Clear any pending data
      if (typeof window !== "undefined") {
        localStorage.removeItem("pendingFirstName");
        localStorage.removeItem("pendingLastName");
      }

      Alert.alert("Success", "Profile completed successfully!", [
        { text: "Continue", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (error) {
      console.error("Profile completion error:", error);
      Alert.alert("Error", "Failed to complete profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <StatusBar style="dark" />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: insets.bottom + 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ marginTop: 20, marginBottom: 32 }}>
            <View
              style={{
                width: 60,
                height: 60,
                backgroundColor: "#3B82F6",
                borderRadius: 15,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 20,
                alignSelf: "center",
              }}
            >
              <User size={28} color="white" />
            </View>

            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#1F2937",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Complete Your Profile
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: "#6B7280",
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              Help us personalize your ServiceHub experience
            </Text>
          </View>

          {/* Form */}
          <View style={{ gap: 20 }}>
            {/* Name Fields */}
            <View style={{ gap: 16 }}>
              <Text
                style={{ fontSize: 18, fontWeight: "600", color: "#1F2937" }}
              >
                Personal Information
              </Text>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    First Name *
                  </Text>
                  <TextInput
                    value={formData.first_name}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, first_name: text }))
                    }
                    placeholder="John"
                    style={{
                      borderWidth: 1,
                      borderColor: "#D1D5DB",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      backgroundColor: "#F9FAFB",
                    }}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Last Name *
                  </Text>
                  <TextInput
                    value={formData.last_name}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, last_name: text }))
                    }
                    placeholder="Doe"
                    style={{
                      borderWidth: 1,
                      borderColor: "#D1D5DB",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      backgroundColor: "#F9FAFB",
                    }}
                  />
                </View>
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Phone Number
                </Text>
                <TextInput
                  value={formData.phone}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, phone: text }))
                  }
                  placeholder="(555) 123-4567"
                  keyboardType="phone-pad"
                  style={{
                    borderWidth: 1,
                    borderColor: "#D1D5DB",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    backgroundColor: "#F9FAFB",
                  }}
                />
              </View>
            </View>

            {/* User Type */}
            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#1F2937",
                  marginBottom: 16,
                }}
              >
                How will you use ServiceHub?
              </Text>

              <View style={{ gap: 12 }}>
                {[
                  {
                    value: "customer",
                    label: "I need services",
                    desc: "Find trusted professionals for your needs",
                  },
                  {
                    value: "provider",
                    label: "I provide services",
                    desc: "Offer your professional services to customers",
                  },
                  {
                    value: "both",
                    label: "Both",
                    desc: "Sometimes I need services, sometimes I provide them",
                  },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() =>
                      setFormData((prev) => ({
                        ...prev,
                        user_type: option.value,
                      }))
                    }
                    style={{
                      borderWidth: 2,
                      borderColor:
                        formData.user_type === option.value
                          ? "#3B82F6"
                          : "#E5E7EB",
                      borderRadius: 12,
                      padding: 16,
                      backgroundColor:
                        formData.user_type === option.value
                          ? "#EBF4FF"
                          : "#fff",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color:
                            formData.user_type === option.value
                              ? "#3B82F6"
                              : "#374151",
                          marginBottom: 4,
                        }}
                      >
                        {option.label}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#6B7280",
                        }}
                      >
                        {option.desc}
                      </Text>
                    </View>
                    {formData.user_type === option.value && (
                      <Check size={20} color="#3B82F6" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Location */}
            <View style={{ gap: 16 }}>
              <Text
                style={{ fontSize: 18, fontWeight: "600", color: "#1F2937" }}
              >
                Location (Optional)
              </Text>

              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Address
                </Text>
                <TextInput
                  value={formData.location_address}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, location_address: text }))
                  }
                  placeholder="123 Main Street"
                  style={{
                    borderWidth: 1,
                    borderColor: "#D1D5DB",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    backgroundColor: "#F9FAFB",
                  }}
                />
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 2 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    City
                  </Text>
                  <TextInput
                    value={formData.location_city}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, location_city: text }))
                    }
                    placeholder="New York"
                    style={{
                      borderWidth: 1,
                      borderColor: "#D1D5DB",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      backgroundColor: "#F9FAFB",
                    }}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    State
                  </Text>
                  <TextInput
                    value={formData.location_state}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, location_state: text }))
                    }
                    placeholder="NY"
                    style={{
                      borderWidth: 1,
                      borderColor: "#D1D5DB",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      backgroundColor: "#F9FAFB",
                    }}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    ZIP
                  </Text>
                  <TextInput
                    value={formData.location_zip}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, location_zip: text }))
                    }
                    placeholder="10001"
                    keyboardType="numeric"
                    style={{
                      borderWidth: 1,
                      borderColor: "#D1D5DB",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      backgroundColor: "#F9FAFB",
                    }}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Complete Button */}
          <TouchableOpacity
            onPress={handleComplete}
            disabled={loading}
            style={{
              backgroundColor: "#3B82F6",
              paddingVertical: 16,
              borderRadius: 12,
              marginTop: 32,
              alignItems: "center",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                Complete Setup
              </Text>
            )}
          </TouchableOpacity>

          {/* Skip Button */}
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            style={{ alignItems: "center", marginTop: 16 }}
          >
            <Text style={{ color: "#6B7280", fontSize: 16 }}>Skip for now</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingAnimatedView>
  );
}
