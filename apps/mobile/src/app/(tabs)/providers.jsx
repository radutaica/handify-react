import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Filter, X, Check, Star, MapPin, Clock, Map, List } from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { colors } from "@/theme/colors";
import SearchBar from "@/components/home/SearchBar";
import ProfessionalCard from "@/components/home/ProfessionalCard";
import { providersApi } from "@/api";
import { mapProviderToCard } from "@/utils/mapProviderData";
import { getCurrentPosition, requestLocationPermission } from "@/utils/location";

export default function ProvidersPage() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(params?.category || "");
  const [categoryId, setCategoryId] = useState(params?.categoryId || "");
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("rating");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    maxDistance: 10,
    availability: [],
    priceRange: [],
  });
  const [userLocation, setUserLocation] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" or "map"
  const mapRef = useRef(null);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    if (params?.category) {
      setSelectedCategory(params.category);
    }
    if (params?.categoryId) {
      setCategoryId(params.categoryId);
    }
  }, [params?.category, params?.categoryId]);

  // Get user location on mount
  useEffect(() => {
    (async () => {
      try {
        const position = await getCurrentPosition();
        setUserLocation(position);
      } catch (err) {
        // Location not available, distance filtering won't be active
      }
    })();
  }, []);

  useEffect(() => {
    loadProviders();
  }, [sortBy, categoryId, filters.minRating, filters.priceRange, filters.maxDistance, userLocation]);

  // Client-side filters (distance, availability) applied after fetch
  useEffect(() => {
    applyClientFilters();
  }, [providers, searchQuery, filters.maxDistance, filters.availability]);

  const loadProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiParams = {
        sort: sortBy === "name" ? "rating" : sortBy,
        activeOnly: true,
      };

      if (categoryId) apiParams.categoryId = categoryId;
      if (filters.minRating > 0) apiParams.minRating = filters.minRating;

      // Pass location params for distance-based filtering
      if (userLocation && filters.maxDistance < 10) {
        apiParams.lat = userLocation.latitude;
        apiParams.lng = userLocation.longitude;
        apiParams.radius = filters.maxDistance;
      }

      // Map price range filter chips to API params
      if (filters.priceRange.length > 0) {
        const rates = filters.priceRange;
        if (rates.includes("low") && !rates.includes("medium") && !rates.includes("high")) {
          apiParams.maxRate = 70;
        } else if (rates.includes("high") && !rates.includes("low") && !rates.includes("medium")) {
          apiParams.minRate = 100;
        } else if (rates.includes("medium") && !rates.includes("low") && !rates.includes("high")) {
          apiParams.minRate = 70;
          apiParams.maxRate = 100;
        }
      }

      const response = await providersApi.getProviders(apiParams);
      const profiles = response.data || response;
      const mapped = (Array.isArray(profiles) ? profiles : []).map(mapProviderToCard);
      setProviders(mapped);
    } catch (err) {
      console.error("Error loading providers:", err);
      setError("Nu s-au putut incarca providerii. Incearca din nou.");
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const applyClientFilters = () => {
    let filtered = [...providers];

    // Client-side search filter (supplements server-side search)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (provider) =>
          provider.name.toLowerCase().includes(query) ||
          provider.profession.toLowerCase().includes(query)
      );
    }

    // Client-side distance filter as fallback when backend doesn't handle it.
    // Backend filtering via lat/lng/radius params is preferred (see loadProviders),
    // but this ensures filtering still works when distance_km is returned.
    if (filters.maxDistance < 10 && userLocation) {
      filtered = filtered.filter((provider) => {
        if (provider.distanceKm == null) return true; // keep providers without distance data
        return provider.distanceKm <= filters.maxDistance;
      });
    }

    // Client-side availability filter as fallback when backend doesn't support it.
    // Backend filtering is preferred but not yet available for this field.
    if (filters.availability.length > 0) {
      filtered = filtered.filter((provider) => {
        if (provider.isOnline == null) return true; // keep providers without availability data
        if (filters.availability.includes("online") && !filters.availability.includes("offline")) {
          return provider.isOnline === true;
        }
        if (filters.availability.includes("offline") && !filters.availability.includes("online")) {
          return provider.isOnline === false;
        }
        return true; // both selected = show all
      });
    }

    // Client-side name sort
    if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProviders(filtered);
  };

  const handleProviderPress = (provider) => {
    router.push(`/(tabs)/provider/${provider.id}`);
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleSortChange = () => {
    const sortOptions = ["rating", "distance", "name"];
    const currentIndex = sortOptions.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    setSortBy(sortOptions[nextIndex]);
  };

  const clearCategoryFilter = () => {
    setSelectedCategory("");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.minRating > 0) count++;
    if (filters.maxDistance < 10) count++;
    if (filters.availability.length > 0) count++;
    if (filters.priceRange.length > 0) count++;
    return count;
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      if (filterType === "availability" || filterType === "priceRange") {
        const currentArray = prev[filterType];
        const index = currentArray.indexOf(value);
        if (index > -1) {
          return {
            ...prev,
            [filterType]: currentArray.filter((item) => item !== value),
          };
        } else {
          return {
            ...prev,
            [filterType]: [...currentArray, value],
          };
        }
      } else {
        return {
          ...prev,
          [filterType]: value,
        };
      }
    });
  };

  const clearAllFilters = () => {
    setFilters({
      minRating: 0,
      maxDistance: 10,
      availability: [],
      priceRange: [],
    });
  };

  const applyFilters = () => {
    setShowFilterModal(false);
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case "rating":
        return "Rating";
      case "distance":
        return "Distanta";
      case "name":
        return "Nume";
      default:
        return "Sortare";
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provideri</Text>
        <TouchableOpacity
          onPress={() => setViewMode(viewMode === "list" ? "map" : "list")}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          {viewMode === "list" ? (
            <Map size={22} color={colors.primary.teal} />
          ) : (
            <List size={22} color={colors.primary.teal} />
          )}
        </TouchableOpacity>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Cauta un provider..."
        />
      </View>

      {/* Active Category Filter */}
      {selectedCategory && (
        <View style={styles.categoryFilterContainer}>
          <View style={styles.categoryFilterBadge}>
            <Text style={styles.categoryFilterText}>{selectedCategory}</Text>
            <TouchableOpacity
              onPress={clearCategoryFilter}
              style={styles.categoryFilterClose}
              activeOpacity={0.7}
            >
              <X size={14} color={colors.primary.teal} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Sort and Filter Bar */}
      <View style={styles.filterBar}>
        <Text style={styles.resultsText}>
          {filteredProviders.length} {filteredProviders.length === 1 ? "provider" : "provideri"}
        </Text>
        <View style={styles.filterButtonsRow}>
          <TouchableOpacity
            onPress={handleSortChange}
            style={styles.sortButton}
            activeOpacity={0.7}
          >
            <Text style={styles.sortButtonText}>{getSortLabel()}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            style={[
              styles.filterButton,
              getActiveFiltersCount() > 0 && styles.filterButtonActive,
            ]}
            activeOpacity={0.7}
          >
            <Filter size={16} color={getActiveFiltersCount() > 0 ? colors.ui.white : colors.primary.teal} />
            <Text
              style={[
                styles.filterButtonText,
                getActiveFiltersCount() > 0 && styles.filterButtonTextActive,
              ]}
            >
              Filtre
            </Text>
            {getActiveFiltersCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Providers List / Map */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.teal} />
        </View>
      ) : viewMode === "map" ? (
        <View style={{ flex: 1 }}>
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: userLocation?.latitude || 44.4268,
              longitude: userLocation?.longitude || 26.1025,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            showsUserLocation
          >
            {filteredProviders.map((provider) => {
              // Use real provider coordinates when available, fall back to small random
              // offset around user location only when no real coordinates exist
              const lat = provider.latitude || provider.addressLatitude || (userLocation?.latitude + (Math.random() - 0.5) * 0.02);
              const lng = provider.longitude || provider.addressLongitude || (userLocation?.longitude + (Math.random() - 0.5) * 0.02);
              if (!lat || !lng) return null;
              return (
                <Marker
                  key={provider.id}
                  coordinate={{
                    latitude: lat,
                    longitude: lng,
                  }}
                  title={provider.name}
                  description={`${provider.profession} - ${provider.rating} ★`}
                  onCalloutPress={() => handleProviderPress(provider)}
                />
              );
            })}
          </MapView>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {filteredProviders.length > 0 ? (
            filteredProviders.map((provider) => (
              <ProfessionalCard
                key={provider.id}
                {...provider}
                variant="list"
                onPress={() => handleProviderPress(provider)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>👤</Text>
              <Text style={styles.emptyStateTitle}>Nu s-au gasit provideri</Text>
              <Text style={styles.emptyStateText}>
                Incearca sa modifici termenii de cautare
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowFilterModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtre</Text>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                style={styles.modalCloseButton}
                activeOpacity={0.7}
              >
                <X size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              {/* Rating Filter */}
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                  <Star size={18} color={colors.primary.teal} />
                  <Text style={styles.filterSectionTitle}>Rating minim</Text>
                </View>
                <View style={styles.ratingOptions}>
                  {[0, 3, 4, 4.5, 4.8].map((rating) => (
                    <TouchableOpacity
                      key={rating}
                      onPress={() => handleFilterChange("minRating", rating)}
                      style={[
                        styles.ratingOption,
                        filters.minRating === rating && styles.ratingOptionActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.ratingOptionText,
                          filters.minRating === rating && styles.ratingOptionTextActive,
                        ]}
                      >
                        {rating === 0 ? "Toate" : `${rating}+`}
                      </Text>
                      {filters.minRating === rating && (
                        <Check size={16} color={colors.ui.white} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Distance Filter */}
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                  <MapPin size={18} color={colors.primary.teal} />
                  <Text style={styles.filterSectionTitle}>Distanta maxima</Text>
                </View>
                <View style={styles.distanceOptions}>
                  {[1, 2, 5, 10].map((distance) => (
                    <TouchableOpacity
                      key={distance}
                      onPress={() => handleFilterChange("maxDistance", distance)}
                      style={[
                        styles.distanceOption,
                        filters.maxDistance === distance && styles.distanceOptionActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.distanceOptionText,
                          filters.maxDistance === distance && styles.distanceOptionTextActive,
                        ]}
                      >
                        {distance === 10 ? "Toate" : `${distance} km`}
                      </Text>
                      {filters.maxDistance === distance && (
                        <Check size={16} color={colors.ui.white} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Availability Filter */}
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                  <Clock size={18} color={colors.primary.teal} />
                  <Text style={styles.filterSectionTitle}>Disponibilitate</Text>
                </View>
                <View style={styles.availabilityOptions}>
                  {[
                    { value: "online", label: "Online" },
                    { value: "offline", label: "Offline" },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => handleFilterChange("availability", option.value)}
                      style={[
                        styles.availabilityOption,
                        filters.availability.includes(option.value) &&
                          styles.availabilityOptionActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.availabilityOptionText,
                          filters.availability.includes(option.value) &&
                            styles.availabilityOptionTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {filters.availability.includes(option.value) && (
                        <Check size={16} color={colors.ui.white} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Price Range Filter */}
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                  <Text style={styles.filterSectionTitle}>Interval pret</Text>
                </View>
                <View style={styles.priceOptions}>
                  {[
                    { value: "low", label: "Mic (< 70 lei)" },
                    { value: "medium", label: "Mediu (70-100 lei)" },
                    { value: "high", label: "Ridicat (> 100 lei)" },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => handleFilterChange("priceRange", option.value)}
                      style={[
                        styles.priceOption,
                        filters.priceRange.includes(option.value) && styles.priceOptionActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.priceOptionText,
                          filters.priceRange.includes(option.value) &&
                            styles.priceOptionTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {filters.priceRange.includes(option.value) && (
                        <Check size={16} color={colors.ui.white} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={clearAllFilters}
                style={styles.clearFiltersButton}
                activeOpacity={0.7}
              >
                <Text style={styles.clearFiltersText}>Sterge filtre</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyFilters}
                style={styles.applyFiltersButton}
                activeOpacity={0.7}
              >
                <Text style={styles.applyFiltersText}>Aplica</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: colors.text.primary,
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  categoryFilterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryFilterBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.status.successBg,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  categoryFilterText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: colors.status.success,
    marginRight: 6,
  },
  categoryFilterClose: {
    padding: 2,
  },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  resultsText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.text.secondary,
  },
  filterButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  sortButtonText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: colors.primary.teal,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    position: "relative",
  },
  filterButtonActive: {
    backgroundColor: colors.primary.teal,
    borderColor: colors.primary.teal,
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: colors.primary.teal,
    marginLeft: 6,
  },
  filterButtonTextActive: {
    color: colors.ui.white,
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.accent.red,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: colors.ui.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: colors.text.primary,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  modalScrollView: {
    maxHeight: 500,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  filterSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: colors.text.primary,
  },
  ratingOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ratingOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    gap: 6,
  },
  ratingOptionActive: {
    backgroundColor: colors.primary.teal,
    borderColor: colors.primary.teal,
  },
  ratingOptionText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.text.primary,
  },
  ratingOptionTextActive: {
    color: colors.ui.white,
    fontFamily: "Inter_600SemiBold",
  },
  distanceOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  distanceOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    gap: 6,
  },
  distanceOptionActive: {
    backgroundColor: colors.primary.teal,
    borderColor: colors.primary.teal,
  },
  distanceOptionText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.text.primary,
  },
  distanceOptionTextActive: {
    color: colors.ui.white,
    fontFamily: "Inter_600SemiBold",
  },
  availabilityOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  availabilityOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    gap: 6,
  },
  availabilityOptionActive: {
    backgroundColor: colors.primary.teal,
    borderColor: colors.primary.teal,
  },
  availabilityOptionText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.text.primary,
  },
  availabilityOptionTextActive: {
    color: colors.ui.white,
    fontFamily: "Inter_600SemiBold",
  },
  priceOptions: {
    gap: 8,
  },
  priceOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  priceOptionActive: {
    backgroundColor: colors.primary.teal,
    borderColor: colors.primary.teal,
  },
  priceOptionText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.text.primary,
  },
  priceOptionTextActive: {
    color: colors.ui.white,
    fontFamily: "Inter_600SemiBold",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  clearFiltersButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: "center",
    justifyContent: "center",
  },
  clearFiltersText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: colors.text.primary,
  },
  applyFiltersButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  applyFiltersText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: colors.ui.white,
  },
});

