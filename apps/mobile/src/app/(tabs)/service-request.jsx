import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from "lucide-react-native";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function ServiceRequestPage() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    serviceId: "",
    locationAddress: "",
    locationCity: "",
    locationState: "",
    locationZip: "",
    scheduledDate: "",
    scheduledTime: "",
    budgetMin: "",
    budgetMax: "",
    urgency: "normal",
    customerNotes: "",
  });

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [errors, setErrors] = useState({});

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const { servicesApi } = await import("@/api");
      const data = await servicesApi.getServices();
      setServices(data.services);
    } catch (error) {
      console.error("Error loading services:", error);
      Alert.alert("Error", "Failed to load services. Please try again.");
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setFormData((prev) => ({
      ...prev,
      serviceId: service.id,
      title: service.name,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Service title is required";
    }

    if (!formData.serviceId) {
      newErrors.service = "Please select a service";
    }

    if (!formData.locationAddress.trim()) {
      newErrors.locationAddress = "Address is required";
    }

    if (!formData.locationCity.trim()) {
      newErrors.locationCity = "City is required";
    }

    if (!formData.locationState.trim()) {
      newErrors.locationState = "State is required";
    }

    if (formData.budgetMin && formData.budgetMax) {
      const min = parseFloat(formData.budgetMin);
      const max = parseFloat(formData.budgetMax);
      if (min > max) {
        newErrors.budget = "Minimum budget cannot be higher than maximum";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Mock customer ID - in real app this would come from auth context
      const customerId = "customer-123";

      const requestData = {
        customer_id: customerId,
        service_id: formData.serviceId,
        title: formData.title,
        description: formData.description || null,
        location_address: formData.locationAddress,
        location_city: formData.locationCity,
        location_state: formData.locationState,
        location_zip: formData.locationZip || null,
        scheduled_date: formData.scheduledDate || null,
        scheduled_time_start: formData.scheduledTime || null,
        budget_min: formData.budgetMin ? parseFloat(formData.budgetMin) : null,
        budget_max: formData.budgetMax ? parseFloat(formData.budgetMax) : null,
        urgency: formData.urgency,
        customer_notes: formData.customerNotes || null,
      };

      const { bookingsApi } = await import("@/api");
      const booking = await bookingsApi.createBooking(requestData);

      Alert.alert(
        "Success!",
        "Your service request has been posted. Providers in your area will be notified.",
        [
          {
            text: "View Bookings",
            onPress: () => router.push("/(tabs)/bookings"),
          },
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      console.error("Error creating service request:", error);
      Alert.alert("Error", error.message || error.data?.error || "Failed to create service request");
    } finally {
      setLoading(false);
    }
  };

  const urgencyOptions = [
    { value: "low", label: "Low Priority", icon: Clock, color: "#6B7280" },
    { value: "normal", label: "Normal", icon: CheckCircle, color: "#10B981" },
    {
      value: "high",
      label: "High Priority",
      icon: AlertCircle,
      color: "#F59E0B",
    },
    { value: "urgent", label: "Urgent", icon: AlertCircle, color: "#EF4444" },
  ];

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
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
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#2D2D2D" : "#E5E7EB",
          }}
        >
          <TouchableOpacity onPress={handleBack} style={{ marginRight: 16 }}>
            <ArrowLeft size={24} color={isDark ? "#FFFFFF" : "#000000"} />
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 20,
              color: isDark ? "#FFFFFF" : "#000000",
              flex: 1,
            }}
          >
            Request Service
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 20,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Service Selection */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 12,
              }}
            >
              Select Service *
            </Text>

            {selectedService ? (
              <TouchableOpacity
                onPress={() => setSelectedService(null)}
                style={{
                  backgroundColor: isDark ? "#1E1E1E" : "#F8F9FA",
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 2,
                  borderColor: "#10B981",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: isDark ? "#FFFFFF" : "#000000",
                    marginBottom: 4,
                  }}
                >
                  {selectedService.name}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: isDark ? "#B3B3B3" : "#6B7280",
                  }}
                >
                  {selectedService.category.name} • Tap to change
                </Text>
              </TouchableOpacity>
            ) : (
              <View>
                {services.slice(0, 5).map((service) => (
                  <TouchableOpacity
                    key={service.id}
                    onPress={() => handleServiceSelect(service)}
                    style={{
                      backgroundColor: isDark ? "#1E1E1E" : "#F8F9FA",
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 8,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 16,
                          color: isDark ? "#FFFFFF" : "#000000",
                          marginBottom: 4,
                        }}
                      >
                        {service.name}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 14,
                          color: isDark ? "#B3B3B3" : "#6B7280",
                        }}
                      >
                        {service.category.name}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        color: "#16A34A",
                      }}
                    >
                      {service.basePriceMin > 0
                        ? `$${service.basePriceMin}-${service.basePriceMax}`
                        : "Contact for quote"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {errors.service && (
              <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                {errors.service}
              </Text>
            )}
          </View>

          {/* Service Title */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 8,
              }}
            >
              Service Title *
            </Text>
            <TextInput
              style={{
                backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontFamily: "Inter_400Regular",
                fontSize: 16,
                color: isDark ? "#FFFFFF" : "#000000",
                borderWidth: errors.title ? 1 : 0,
                borderColor: "#EF4444",
              }}
              placeholder="e.g. Emergency leak repair"
              placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
              value={formData.title}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, title: text }))
              }
            />
            {errors.title && (
              <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                {errors.title}
              </Text>
            )}
          </View>

          {/* Description */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 8,
              }}
            >
              Description
            </Text>
            <TextInput
              style={{
                backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontFamily: "Inter_400Regular",
                fontSize: 16,
                color: isDark ? "#FFFFFF" : "#000000",
                textAlignVertical: "top",
              }}
              placeholder="Describe what you need help with..."
              placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
            />
          </View>

          {/* Location */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 8,
              }}
            >
              Location *
            </Text>
            <TextInput
              style={{
                backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontFamily: "Inter_400Regular",
                fontSize: 16,
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 8,
                borderWidth: errors.locationAddress ? 1 : 0,
                borderColor: "#EF4444",
              }}
              placeholder="Street address"
              placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
              value={formData.locationAddress}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, locationAddress: text }))
              }
            />

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                style={{
                  backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontFamily: "Inter_400Regular",
                  fontSize: 16,
                  color: isDark ? "#FFFFFF" : "#000000",
                  flex: 2,
                  borderWidth: errors.locationCity ? 1 : 0,
                  borderColor: "#EF4444",
                }}
                placeholder="City"
                placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
                value={formData.locationCity}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, locationCity: text }))
                }
              />
              <TextInput
                style={{
                  backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontFamily: "Inter_400Regular",
                  fontSize: 16,
                  color: isDark ? "#FFFFFF" : "#000000",
                  flex: 1,
                  borderWidth: errors.locationState ? 1 : 0,
                  borderColor: "#EF4444",
                }}
                placeholder="State"
                placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
                value={formData.locationState}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, locationState: text }))
                }
              />
              <TextInput
                style={{
                  backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontFamily: "Inter_400Regular",
                  fontSize: 16,
                  color: isDark ? "#FFFFFF" : "#000000",
                  flex: 1,
                }}
                placeholder="ZIP"
                placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
                value={formData.locationZip}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, locationZip: text }))
                }
              />
            </View>

            {(errors.locationAddress ||
              errors.locationCity ||
              errors.locationState) && (
              <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                Address, city, and state are required
              </Text>
            )}
          </View>

          {/* Budget */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 8,
              }}
            >
              Budget Range (Optional)
            </Text>
            <View
              style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
            >
              <View style={{ flex: 1 }}>
                <TextInput
                  style={{
                    backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontFamily: "Inter_400Regular",
                    fontSize: 16,
                    color: isDark ? "#FFFFFF" : "#000000",
                  }}
                  placeholder="Min ($)"
                  placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
                  keyboardType="numeric"
                  value={formData.budgetMin}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, budgetMin: text }))
                  }
                />
              </View>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 16,
                  color: isDark ? "#8F8F8F" : "#9CA3AF",
                }}
              >
                to
              </Text>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={{
                    backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontFamily: "Inter_400Regular",
                    fontSize: 16,
                    color: isDark ? "#FFFFFF" : "#000000",
                  }}
                  placeholder="Max ($)"
                  placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
                  keyboardType="numeric"
                  value={formData.budgetMax}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, budgetMax: text }))
                  }
                />
              </View>
            </View>
            {errors.budget && (
              <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                {errors.budget}
              </Text>
            )}
          </View>

          {/* Urgency */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 8,
              }}
            >
              Urgency Level
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {urgencyOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, urgency: option.value }))
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor:
                      formData.urgency === option.value
                        ? `${option.color}20`
                        : isDark
                          ? "#1E1E1E"
                          : "#F3F4F6",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderWidth: formData.urgency === option.value ? 1 : 0,
                    borderColor: option.color,
                  }}
                >
                  <option.icon size={16} color={option.color} />
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color:
                        formData.urgency === option.value
                          ? option.color
                          : isDark
                            ? "#FFFFFF"
                            : "#000000",
                      marginLeft: 6,
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Additional Notes */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 8,
              }}
            >
              Additional Notes
            </Text>
            <TextInput
              style={{
                backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontFamily: "Inter_400Regular",
                fontSize: 16,
                color: isDark ? "#FFFFFF" : "#000000",
                textAlignVertical: "top",
              }}
              placeholder="Any special instructions or requirements..."
              placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
              multiline
              numberOfLines={3}
              value={formData.customerNotes}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, customerNotes: text }))
              }
            />
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: isDark ? "#121212" : "#FFFFFF",
            paddingHorizontal: 16,
            paddingVertical: 12,
            paddingBottom: insets.bottom + 12,
            borderTopWidth: 1,
            borderTopColor: isDark ? "#2D2D2D" : "#E5E7EB",
          }}
        >
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#6B7280" : "#000000",
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: "#FFFFFF",
              }}
            >
              {loading ? "Creating Request..." : "Post Service Request"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
