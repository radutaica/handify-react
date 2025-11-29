import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import {
  Search,
  Wrench,
  Car,
  Scissors,
  Home,
  Zap,
  PaintBucket,
  Star,
  MapPin,
  Clock,
} from "lucide-react-native";
import { Image } from "expo-image";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function HomePage() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [searchQuery, setSearchQuery] = useState("");
  const [recentProviders, setRecentProviders] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    // Load data
    loadServiceCategories();
    loadRecentProviders();
    loadPopularServices();
  }, []);

  const loadServiceCategories = async () => {
    try {
      const { categoriesApi } = await import("@/api");
      const categories = await categoriesApi.getCategories();

      // Transform the categories data to match our component format
      const iconMap = {
        Wrench: Wrench,
        Car: Car,
        Scissors: Scissors,
        Home: Home,
        Zap: Zap,
        PaintBucket: PaintBucket,
      };

      const transformedCategories = categories.map((category) => ({
        icon: iconMap[category.iconName] || Wrench,
        name: category.name,
        color: category.color || "#3B82F6",
        id: category.id,
      }));

      setServiceCategories(transformedCategories);
    } catch (error) {
      console.error("Error loading service categories:", error);
      // Fallback to hardcoded categories on error
      const fallbackCategories = [
        { icon: Wrench, name: "Plumbing", color: "#3B82F6" },
        { icon: Car, name: "Car Repair", color: "#EF4444" },
        { icon: Scissors, name: "Hair Salon", color: "#8B5CF6" },
        { icon: Home, name: "Cleaning", color: "#10B981" },
        { icon: Zap, name: "Electrical", color: "#F59E0B" },
        { icon: PaintBucket, name: "Painting", color: "#EC4899" },
      ];
      setServiceCategories(fallbackCategories);
    }
  };

  const loadRecentProviders = async () => {
    try {
      // This would ideally fetch recent providers based on user's booking history
      // For now, we'll get a sample of providers from the services API
      const { categoriesApi } = await import("@/api");
      const categories = await categoriesApi.getCategories({ withServices: true });

      // Extract some sample providers from the services data
      const mockProviders = [
        {
          id: "1",
          name: "Mike's Plumbing",
          category: "Plumbing",
          rating: 4.8,
          image: "https://via.placeholder.com/60",
          distance: "0.5 miles",
          responseTime: "< 1 hour",
        },
        {
          id: "2",
          name: "Elite Auto Repair",
          category: "Car Repair",
          rating: 4.9,
          image: "https://via.placeholder.com/60",
          distance: "1.2 miles",
          responseTime: "< 30 mins",
        },
        {
          id: "3",
          name: "Bella Hair Studio",
          category: "Hair Salon",
          rating: 4.7,
          image: "https://via.placeholder.com/60",
          distance: "0.8 miles",
          responseTime: "< 2 hours",
        },
      ];
      setRecentProviders(mockProviders);
    } catch (error) {
      console.error("Error loading recent providers:", error);
      // Fallback to mock data on error
      setRecentProviders([]);
    }
  };

  const loadPopularServices = async () => {
    try {
      const { servicesApi } = await import("@/api");
      const data = await servicesApi.getServices({ limit: 10 });

      // Transform the services data to match our component format
      const transformedServices = data.services.slice(0, 3).map((service) => ({
        id: service.id,
        name: service.name,
        category: service.category.name,
        requests: Math.floor(Math.random() * 100) + 20, // Mock requests count
        avgPrice:
          service.basePriceMin > 0
            ? `$${Math.round((service.basePriceMin + service.basePriceMax) / 2)}`
            : "Contact for quote",
      }));

      setPopularServices(transformedServices);
    } catch (error) {
      console.error("Error loading popular services:", error);
      // Fallback to mock data on error
      const mockServices = [
        {
          id: "1",
          name: "Emergency Plumbing",
          category: "Plumbing",
          requests: 45,
          avgPrice: "$150",
        },
        {
          id: "2",
          name: "Oil Change",
          category: "Car Repair",
          requests: 67,
          avgPrice: "$50",
        },
        {
          id: "3",
          name: "Haircut & Style",
          category: "Hair Salon",
          requests: 89,
          avgPrice: "$65",
        },
      ];
      setPopularServices(mockServices);
    }
  };

  const handleSearch = () => {
    router.push({
      pathname: "/(tabs)/search",
      params: { query: searchQuery },
    });
  };

  const handleCategoryPress = (category) => {
    router.push({
      pathname: "/(tabs)/search",
      params: { category: category.name },
    });
  };

  const handleProviderPress = (provider) => {
    router.push(`/(tabs)/provider/${provider.id}`);
  };

  const handleServiceRequest = () => {
    router.push("/(tabs)/service-request");
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
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#2D2D2D" : "#E5E7EB",
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 28,
            color: isDark ? "#FFFFFF" : "#000000",
            marginBottom: 16,
          }}
        >
          Find Local Services
        </Text>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginBottom: 16,
          }}
        >
          <Search size={20} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 12,
              fontFamily: "Inter_400Regular",
              fontSize: 16,
              color: isDark ? "#FFFFFF" : "#000000",
            }}
            placeholder="What service do you need?"
            placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>

        {/* Quick Service Request Button */}
        <TouchableOpacity
          onPress={handleServiceRequest}
          style={{
            backgroundColor: "#000000",
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
            Post a Service Request
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Service Categories */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 20 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: isDark ? "#FFFFFF" : "#000000",
              marginBottom: 16,
            }}
          >
            Service Categories
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {serviceCategories.map((category, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleCategoryPress(category)}
                style={{
                  width: "48%",
                  backgroundColor: isDark ? "#1E1E1E" : "#F8F9FA",
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: category.color,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <category.icon size={24} color="#FFFFFF" />
                </View>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 14,
                    color: isDark ? "#FFFFFF" : "#000000",
                    textAlign: "center",
                  }}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Providers */}
        {recentProviders.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 16,
              }}
            >
              Recent Providers
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recentProviders.map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  onPress={() => handleProviderPress(provider)}
                  style={{
                    width: 200,
                    backgroundColor: isDark ? "#1E1E1E" : "#F8F9FA",
                    borderRadius: 12,
                    padding: 16,
                    marginRight: 12,
                  }}
                >
                  <Image
                    source={{ uri: provider.image }}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      marginBottom: 12,
                    }}
                    contentFit="cover"
                    transition={100}
                  />
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 16,
                      color: isDark ? "#FFFFFF" : "#000000",
                      marginBottom: 4,
                    }}
                  >
                    {provider.name}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: isDark ? "#B3B3B3" : "#6B7280",
                      marginBottom: 8,
                    }}
                  >
                    {provider.category}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <Star size={14} color="#F59E0B" />
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 12,
                        color: isDark ? "#B3B3B3" : "#6B7280",
                        marginLeft: 4,
                      }}
                    >
                      {provider.rating}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <MapPin size={12} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 12,
                        color: isDark ? "#8F8F8F" : "#9CA3AF",
                        marginLeft: 4,
                      }}
                    >
                      {provider.distance}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Clock size={12} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 12,
                        color: isDark ? "#8F8F8F" : "#9CA3AF",
                        marginLeft: 4,
                      }}
                    >
                      {provider.responseTime}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Popular Services */}
        {popularServices.length > 0 && (
          <View style={{ paddingHorizontal: 16 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 16,
              }}
            >
              Popular Services
            </Text>

            {popularServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={{
                  backgroundColor: isDark ? "#1E1E1E" : "#F8F9FA",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
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
                      marginBottom: 4,
                    }}
                  >
                    {service.category}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: isDark ? "#8F8F8F" : "#9CA3AF",
                    }}
                  >
                    {service.requests} recent requests
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: "#16A34A",
                  }}
                >
                  {service.avgPrice}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
