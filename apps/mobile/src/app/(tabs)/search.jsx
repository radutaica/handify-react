import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  DollarSign,
} from "lucide-react-native";
import { Image } from "expo-image";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { providersApi } from "@/api";

export default function SearchPage() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const params = useLocalSearchParams();

  const [searchQuery, setSearchQuery] = useState(params?.query || "");
  const [selectedCategory, setSelectedCategory] = useState(
    params?.category || "",
  );
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    maxDistance: 10,
    priceRange: "any",
    availability: "any",
  });

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  const debounceRef = useRef(null);

  useEffect(() => {
    if (!searchQuery && !selectedCategory) {
      setProviders([]);
      return;
    }

    // Debounce API calls by 300ms
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchProviders();
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, selectedCategory]);

  const searchProviders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (selectedCategory) params.q = params.q ? `${params.q} ${selectedCategory}` : selectedCategory;

      const response = await providersApi.getProviders(params);
      const profiles = response.data || response;

      // Map API response to search card format
      const mapped = (Array.isArray(profiles) ? profiles : []).map((p) => ({
        id: p.id,
        name: p.user_name || `${p.user_first_name || ''} ${p.user_last_name || ''}`.trim(),
        category: p.categories?.[0]?.name || '',
        rating: p.avg_rating || 0,
        reviewCount: p.total_tasks_completed || 0,
        image: p.user_avatar_url,
        distance: '',
        responseTime: p.response_rate ? `${p.response_rate}% rata raspuns` : '',
        pricing: p.hourly_rate ? `${Math.round(p.hourly_rate)} lei/ora` : '',
        availability: p.is_active ? 'Disponibil' : 'Indisponibil',
        description: p.bio || '',
        verified: p.is_verified || false,
      }));

      setProviders(mapped);
    } catch (error) {
      console.error("Error searching providers:", error);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderPress = (provider) => {
    router.push(`/(tabs)/provider/${provider.id}`);
  };

  const handleSearch = () => {
    searchProviders();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setFilters({
      minRating: 0,
      maxDistance: 10,
      priceRange: "any",
      availability: "any",
    });
    searchProviders();
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
          Find Services
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
            marginBottom: 12,
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
            placeholder="Search services or providers..."
            placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>

        {/* Filter Row */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <Filter size={16} color={isDark ? "#FFFFFF" : "#000000"} />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: isDark ? "#FFFFFF" : "#000000",
                marginLeft: 8,
              }}
            >
              Filters
            </Text>
          </TouchableOpacity>

          {(searchQuery || selectedCategory) && (
            <TouchableOpacity
              onPress={clearFilters}
              style={{
                backgroundColor: "#EF4444",
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: "#FFFFFF",
                }}
              >
                Clear
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Active Filters */}
        {(searchQuery || selectedCategory) && (
          <View
            style={{ flexDirection: "row", marginTop: 12, flexWrap: "wrap" }}
          >
            {searchQuery && (
              <View
                style={{
                  backgroundColor: isDark ? "#3B82F6" : "#DBEAFE",
                  borderRadius: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: isDark ? "#FFFFFF" : "#1E40AF",
                  }}
                >
                  "{searchQuery}"
                </Text>
              </View>
            )}
            {selectedCategory && (
              <View
                style={{
                  backgroundColor: isDark ? "#10B981" : "#D1FAE5",
                  borderRadius: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: isDark ? "#FFFFFF" : "#065F46",
                  }}
                >
                  {selectedCategory}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Results Header */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: isDark ? "#FFFFFF" : "#000000",
            }}
          >
            {providers.length} Results
          </Text>

          <TouchableOpacity>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: "#3B82F6",
              }}
            >
              Sort by rating
            </Text>
          </TouchableOpacity>
        </View>

        {/* Provider Results */}
        {loading && (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#14B8A6" />
          </View>
        )}
        <View style={{ paddingHorizontal: 16 }}>
          {!loading && providers.map((provider) => (
            <TouchableOpacity
              key={provider.id}
              onPress={() => handleProviderPress(provider)}
              style={{
                backgroundColor: isDark ? "#1E1E1E" : "#F8F9FA",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}
            >
              {/* Provider Header */}
              <View style={{ flexDirection: "row", marginBottom: 12 }}>
                <Image
                  source={{ uri: provider.image }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    marginRight: 12,
                  }}
                  contentFit="cover"
                  transition={100}
                />

                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 16,
                        color: isDark ? "#FFFFFF" : "#000000",
                        flex: 1,
                      }}
                    >
                      {provider.name}
                    </Text>
                    {provider.verified && (
                      <View
                        style={{
                          backgroundColor: "#10B981",
                          borderRadius: 4,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Inter_400Regular",
                            fontSize: 10,
                            color: "#FFFFFF",
                          }}
                        >
                          VERIFIED
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: isDark ? "#B3B3B3" : "#6B7280",
                      marginBottom: 4,
                    }}
                  >
                    {provider.category}
                  </Text>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Star size={14} color="#F59E0B" />
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 12,
                        color: isDark ? "#B3B3B3" : "#6B7280",
                        marginLeft: 4,
                      }}
                    >
                      {provider.rating} ({provider.reviewCount} reviews)
                    </Text>
                  </View>
                </View>
              </View>

              {/* Provider Details */}
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: isDark ? "#B3B3B3" : "#6B7280",
                  marginBottom: 12,
                  lineHeight: 20,
                }}
              >
                {provider.description}
              </Text>

              {/* Provider Stats */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: 16,
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

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: 16,
                    marginBottom: 4,
                  }}
                >
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

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <DollarSign size={12} color="#16A34A" />
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: "#16A34A",
                      marginLeft: 4,
                    }}
                  >
                    {provider.pricing}
                  </Text>
                </View>
              </View>

              {/* Availability */}
              <View
                style={{
                  backgroundColor: provider.availability.includes("now")
                    ? "#DCFCE7"
                    : "#FEF3C7",
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  alignSelf: "flex-start",
                  marginTop: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: provider.availability.includes("now")
                      ? "#15803D"
                      : "#A16207",
                  }}
                >
                  {provider.availability}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {!loading && providers.length === 0 && (
            <View
              style={{
                alignItems: "center",
                paddingVertical: 60,
                paddingHorizontal: 20,
              }}
            >
              <Search size={64} color={isDark ? "#3D3D3D" : "#E5E5E5"} />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: isDark ? "#B3B3B3" : "#374151",
                  textAlign: "center",
                  marginTop: 24,
                  marginBottom: 8,
                }}
              >
                No results found
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: isDark ? "#8F8F8F" : "#9CA3AF",
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                Try adjusting your search terms or filters to find what you're
                looking for.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
