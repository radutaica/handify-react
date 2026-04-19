import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Check, ArrowRight } from "lucide-react-native";
import { Image } from "expo-image";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { categoriesApi } from "@/api";

export default function SelectCategories() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const params = useLocalSearchParams();

  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  // Parse previously selected categories from params
  useEffect(() => {
    if (params.selectedCategories) {
      try {
        const parsed = JSON.parse(params.selectedCategories);
        setSelectedCategories(parsed);
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [params.selectedCategories]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getCategories({ active: true });
      setCategories(data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
      Alert.alert("Error", "Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      }
      return [...prev, categoryId];
    });
  };

  const handleContinue = () => {
    if (selectedCategories.length === 0) {
      Alert.alert(
        "Select Categories",
        "Please select at least one service category to continue."
      );
      return;
    }

    router.push({
      pathname: "/become-tasker/details",
      params: {
        selectedCategories: JSON.stringify(selectedCategories),
      },
    });
  };

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

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 12,
              color: isDark ? "#8F8F8F" : "#6B7280",
            }}
          >
            Step 1 of 3
          </Text>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: isDark ? "#FFFFFF" : "#111827",
            }}
          >
            Select Categories
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View
        style={{
          height: 4,
          backgroundColor: isDark ? "#2D2D2D" : "#E5E7EB",
          marginHorizontal: 16,
          borderRadius: 2,
          marginBottom: 16,
        }}
      >
        <View
          style={{
            width: "33%",
            height: "100%",
            backgroundColor: "#10B981",
            borderRadius: 2,
          }}
        />
      </View>

      {/* Content */}
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 15,
            color: isDark ? "#B3B3B3" : "#6B7280",
            marginBottom: 20,
            lineHeight: 22,
          }}
        >
          Choose the service categories you want to offer. You can select
          multiple categories.
        </Text>

        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#10B981" />
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
            showsVerticalScrollIndicator={false}
          >
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => toggleCategory(category.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: isSelected
                      ? isDark
                        ? "#10B98120"
                        : "#ECFDF5"
                      : isDark
                        ? "#1E1E1E"
                        : "#F9FAFB",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 2,
                    borderColor: isSelected ? "#10B981" : "transparent",
                  }}
                >
                  {category.image_url ? (
                    <Image
                      source={{ uri: category.image_url }}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 12,
                        marginRight: 16,
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 12,
                        backgroundColor: isDark ? "#2D2D2D" : "#E5E7EB",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 16,
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>
                        {category.icon || "🔧"}
                      </Text>
                    </View>
                  )}

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 16,
                        color: isDark ? "#FFFFFF" : "#111827",
                        marginBottom: 4,
                      }}
                    >
                      {category.name}
                    </Text>
                    {category.description && (
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 13,
                          color: isDark ? "#8F8F8F" : "#6B7280",
                          lineHeight: 18,
                        }}
                        numberOfLines={2}
                      >
                        {category.description}
                      </Text>
                    )}
                  </View>

                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: isSelected
                        ? "#10B981"
                        : isDark
                          ? "#2D2D2D"
                          : "#E5E7EB",
                      justifyContent: "center",
                      alignItems: "center",
                      marginLeft: 12,
                    }}
                  >
                    {isSelected && <Check size={16} color="white" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: isDark ? "#B3B3B3" : "#6B7280",
            }}
          >
            {selectedCategories.length} selected
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleContinue}
          disabled={selectedCategories.length === 0}
          style={{
            backgroundColor:
              selectedCategories.length > 0 ? "#10B981" : "#9CA3AF",
            borderRadius: 12,
            paddingVertical: 16,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            opacity: selectedCategories.length > 0 ? 1 : 0.6,
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
            Continue
          </Text>
          <ArrowRight size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
