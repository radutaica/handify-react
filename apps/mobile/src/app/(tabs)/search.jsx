import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Tag,
  Users,
  Briefcase,
  X,
  SlidersHorizontal,
} from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { tasksApi, categoriesApi } from "@/api";
import { useCurrentUser } from "@/utils/auth";
import {
  formatRelativeDate,
  URGENCY_CONFIG,
} from "@/utils/mapTaskData";

const URGENCY_FILTERS = [
  { key: "all", label: "Toate" },
  { key: "low", label: "Scazuta" },
  { key: "medium", label: "Normal" },
  { key: "high", label: "Urgenta" },
];

function formatPrice(task) {
  if (task.fixed_price) {
    return `${parseFloat(task.fixed_price).toFixed(0)} lei`;
  }
  if (task.budget_min && task.budget_max) {
    return `${task.budget_min} - ${task.budget_max} lei`;
  }
  if (task.budget_min) {
    return `de la ${task.budget_min} lei`;
  }
  return null;
}

function OpenTaskCard({ task, isDark, onPress, isTasker }) {
  const urgencyConfig = URGENCY_CONFIG[task.urgency] || URGENCY_CONFIG.medium;
  const price = formatPrice(task);
  const location = task.address?.city || task.address?.full_address || null;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: isDark ? "#2D2D2D" : "#E5E7EB",
      }}
    >
      {/* Header Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              color: isDark ? "#FFFFFF" : "#111827",
              marginBottom: 4,
            }}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          {task.category?.name && (
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: isDark ? "#B3B3B3" : "#6B7280",
              }}
            >
              {task.category.name}
            </Text>
          )}
        </View>

        {/* Urgency Badge */}
        <View
          style={{
            backgroundColor:
              task.urgency === "high"
                ? "#FEE2E2"
                : task.urgency === "medium"
                  ? "#DBEAFE"
                  : "#F3F4F6",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 6,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 12,
              color: urgencyConfig.color,
            }}
          >
            {urgencyConfig.label}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View style={{ gap: 8 }}>
        {price && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Tag size={14} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: isDark ? "#FFFFFF" : "#111827",
                marginLeft: 8,
              }}
            >
              {price}
            </Text>
          </View>
        )}

        {location && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MapPin size={14} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: isDark ? "#B3B3B3" : "#6B7280",
                marginLeft: 8,
              }}
            >
              {location}
            </Text>
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Clock size={14} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: isDark ? "#8F8F8F" : "#9CA3AF",
                marginLeft: 8,
              }}
            >
              {formatRelativeDate(task.created_at)}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Users size={14} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: isDark ? "#8F8F8F" : "#9CA3AF",
                marginLeft: 6,
              }}
            >
              {task.bids_count || 0}{" "}
              {(task.bids_count || 0) === 1 ? "oferta" : "oferte"}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        onPress={onPress}
        style={{
          backgroundColor: "#3B82F6",
          borderRadius: 10,
          paddingVertical: 10,
          alignItems: "center",
          marginTop: 12,
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 14,
            color: "#FFFFFF",
          }}
        >
          {isTasker ? "Depune Oferta" : "Vezi detalii"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function SearchPage() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { hasTaskerProfile } = useCurrentUser();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filters
  const [activeUrgency, setActiveUrgency] = useState("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState(null);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

  // Filter modal
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Temp filter state (for modal)
  const [tempCategoryId, setTempCategoryId] = useState(null);
  const [tempCategoryName, setTempCategoryName] = useState(null);
  const [tempUrgency, setTempUrgency] = useState("all");
  const [tempBudgetMin, setTempBudgetMin] = useState("");
  const [tempBudgetMax, setTempBudgetMax] = useState("");

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const response = await categoriesApi.getCategories({ active: true });
      setCategories(response.data?.categories || response.data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      const params = {};

      if (selectedCategoryId) params.category_id = selectedCategoryId;
      if (activeUrgency !== "all") params.urgency = activeUrgency;
      if (budgetMin) params.budget_min = budgetMin;
      if (budgetMax) params.budget_max = budgetMax;

      const response = await tasksApi.getOpenTasks(params);
      let tasksList = response.data?.tasks || response.data || [];

      // Client-side search filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        tasksList = tasksList.filter(
          (t) =>
            t.title?.toLowerCase().includes(query) ||
            t.description?.toLowerCase().includes(query)
        );
      }

      setTasks(tasksList);
    } catch (error) {
      console.error("Error loading open tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategoryId, activeUrgency, budgetMin, budgetMax, searchQuery]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const handleTaskPress = (task) => {
    router.push(`/tasker-browse-tasks/${task.id}`);
  };

  const handleOpenFilterModal = () => {
    setTempCategoryId(selectedCategoryId);
    setTempCategoryName(selectedCategoryName);
    setTempUrgency(activeUrgency);
    setTempBudgetMin(budgetMin);
    setTempBudgetMax(budgetMax);
    if (categories.length === 0) {
      loadCategories();
    }
    setShowFilterModal(true);
  };

  const handleApplyFilters = () => {
    setSelectedCategoryId(tempCategoryId);
    setSelectedCategoryName(tempCategoryName);
    setActiveUrgency(tempUrgency);
    setBudgetMin(tempBudgetMin);
    setBudgetMax(tempBudgetMax);
    setShowFilterModal(false);
    setLoading(true);
  };

  const handleResetFilters = () => {
    setTempCategoryId(null);
    setTempCategoryName(null);
    setTempUrgency("all");
    setTempBudgetMin("");
    setTempBudgetMax("");
  };

  const handleClearAllFilters = () => {
    setSelectedCategoryId(null);
    setSelectedCategoryName(null);
    setActiveUrgency("all");
    setBudgetMin("");
    setBudgetMax("");
    setSearchQuery("");
    setLoading(true);
  };

  const hasActiveFilters =
    selectedCategoryId || activeUrgency !== "all" || budgetMin || budgetMax;

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#121212" : "#F9FAFB",
        paddingTop: insets.top,
      }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: isDark ? "#121212" : "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#2D2D2D" : "#E5E7EB",
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 24,
            color: isDark ? "#FFFFFF" : "#111827",
            flex: 1,
          }}
        >
          Lucrari postate
        </Text>

        <TouchableOpacity
          onPress={handleOpenFilterModal}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: hasActiveFilters
              ? "#3B82F6"
              : isDark
                ? "#2D2D2D"
                : "#F3F4F6",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <SlidersHorizontal
            size={20}
            color={hasActiveFilters ? "#FFFFFF" : isDark ? "#FFFFFF" : "#000000"}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: isDark ? "#121212" : "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#2D2D2D" : "#E5E7EB",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: isDark ? "#2D2D2D" : "#F3F4F6",
            borderRadius: 12,
            paddingHorizontal: 12,
          }}
        >
          <Search size={18} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
          <TextInput
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setLoading(true);
            }}
            placeholder="Cauta lucrari..."
            placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
            style={{
              flex: 1,
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              color: isDark ? "#FFFFFF" : "#111827",
              paddingVertical: 12,
              marginLeft: 8,
            }}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setLoading(true);
              }}
            >
              <X size={18} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Active Filter Chips */}
      {(hasActiveFilters || searchQuery) && (
        <View
          style={{
            backgroundColor: isDark ? "#121212" : "#FFFFFF",
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#2D2D2D" : "#E5E7EB",
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {searchQuery && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: isDark ? "#3B82F6" : "#DBEAFE",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 13,
                    color: isDark ? "#FFFFFF" : "#1D4ED8",
                    marginRight: 6,
                  }}
                >
                  "{searchQuery}"
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery("");
                    setLoading(true);
                  }}
                >
                  <X size={14} color={isDark ? "#FFFFFF" : "#1D4ED8"} />
                </TouchableOpacity>
              </View>
            )}

            {selectedCategoryName && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#DBEAFE",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                    color: "#1D4ED8",
                    marginRight: 6,
                  }}
                >
                  {selectedCategoryName}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCategoryId(null);
                    setSelectedCategoryName(null);
                    setLoading(true);
                  }}
                >
                  <X size={14} color="#1D4ED8" />
                </TouchableOpacity>
              </View>
            )}

            {activeUrgency !== "all" && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor:
                    activeUrgency === "high" ? "#FEE2E2" : "#DBEAFE",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                    color:
                      activeUrgency === "high" ? "#DC2626" : "#1D4ED8",
                  }}
                >
                  {URGENCY_FILTERS.find((f) => f.key === activeUrgency)?.label}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setActiveUrgency("all");
                    setLoading(true);
                  }}
                  style={{ marginLeft: 6 }}
                >
                  <X
                    size={14}
                    color={activeUrgency === "high" ? "#DC2626" : "#1D4ED8"}
                  />
                </TouchableOpacity>
              </View>
            )}

            {(budgetMin || budgetMax) && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#D1FAE5",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                    color: "#047857",
                  }}
                >
                  {budgetMin && budgetMax
                    ? `${budgetMin} - ${budgetMax} lei`
                    : budgetMin
                      ? `de la ${budgetMin} lei`
                      : `pana la ${budgetMax} lei`}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setBudgetMin("");
                    setBudgetMax("");
                    setLoading(true);
                  }}
                  style={{ marginLeft: 6 }}
                >
                  <X size={14} color="#047857" />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              onPress={handleClearAllFilters}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: isDark ? "#2D2D2D" : "#F3F4F6",
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: isDark ? "#B3B3B3" : "#6B7280",
                }}
              >
                Sterge filtre
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: isDark ? "#B3B3B3" : "#6B7280",
              marginTop: 12,
            }}
          >
            Se incarca lucrarile...
          </Text>
        </View>
      ) : tasks.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 32,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: isDark ? "#2D2D2D" : "#F3F4F6",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Briefcase size={36} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
          </View>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: isDark ? "#FFFFFF" : "#111827",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Nicio lucrare gasita
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: isDark ? "#B3B3B3" : "#6B7280",
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            Cauta lucrari disponibile sau ajusteaza filtrele
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#3B82F6"
            />
          }
        >
          {/* Results Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: isDark ? "#8F8F8F" : "#9CA3AF",
              }}
            >
              {tasks.length} {tasks.length === 1 ? "lucrare gasita" : "lucrari gasite"}
            </Text>

            <TouchableOpacity
              onPress={() => {
                const sorted = [...tasks].sort(
                  (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                setTasks(sorted);
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: "#3B82F6",
                }}
              >
                Cele mai recente
              </Text>
            </TouchableOpacity>
          </View>

          {tasks.map((task) => (
            <OpenTaskCard
              key={task.id}
              task={task}
              isDark={isDark}
              isTasker={hasTaskerProfile}
              onPress={() => handleTaskPress(task)}
            />
          ))}
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 24,
              paddingBottom: insets.bottom + 24,
              maxHeight: "80%",
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 18,
                  color: isDark ? "#FFFFFF" : "#111827",
                }}
              >
                Filtreaza lucrari
              </Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <X size={24} color={isDark ? "#FFFFFF" : "#111827"} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Category Selection */}
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: isDark ? "#8F8F8F" : "#6B7280",
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Categorie
              </Text>
              {loadingCategories ? (
                <ActivityIndicator
                  size="small"
                  color="#3B82F6"
                  style={{ marginBottom: 20 }}
                />
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 20 }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setTempCategoryId(null);
                      setTempCategoryName(null);
                    }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      marginRight: 8,
                      backgroundColor:
                        tempCategoryId === null
                          ? "#3B82F6"
                          : isDark
                            ? "#2D2D2D"
                            : "#F3F4F6",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily:
                          tempCategoryId === null
                            ? "Inter_600SemiBold"
                            : "Inter_400Regular",
                        fontSize: 14,
                        color:
                          tempCategoryId === null
                            ? "#FFFFFF"
                            : isDark
                              ? "#B3B3B3"
                              : "#6B7280",
                      }}
                    >
                      Toate
                    </Text>
                  </TouchableOpacity>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => {
                        setTempCategoryId(cat.id);
                        setTempCategoryName(cat.name);
                      }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        marginRight: 8,
                        backgroundColor:
                          tempCategoryId === cat.id
                            ? "#3B82F6"
                            : isDark
                              ? "#2D2D2D"
                              : "#F3F4F6",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily:
                            tempCategoryId === cat.id
                              ? "Inter_600SemiBold"
                              : "Inter_400Regular",
                          fontSize: 14,
                          color:
                            tempCategoryId === cat.id
                              ? "#FFFFFF"
                              : isDark
                                ? "#B3B3B3"
                                : "#6B7280",
                        }}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Urgency Selection */}
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: isDark ? "#8F8F8F" : "#6B7280",
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Urgenta
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 20 }}
              >
                {URGENCY_FILTERS.map((filter) => (
                  <TouchableOpacity
                    key={filter.key}
                    onPress={() => setTempUrgency(filter.key)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      marginRight: 8,
                      backgroundColor:
                        tempUrgency === filter.key
                          ? "#3B82F6"
                          : isDark
                            ? "#2D2D2D"
                            : "#F3F4F6",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily:
                          tempUrgency === filter.key
                            ? "Inter_600SemiBold"
                            : "Inter_400Regular",
                        fontSize: 14,
                        color:
                          tempUrgency === filter.key
                            ? "#FFFFFF"
                            : isDark
                              ? "#B3B3B3"
                              : "#6B7280",
                      }}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Budget Range */}
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: isDark ? "#8F8F8F" : "#6B7280",
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Buget (lei)
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <View style={{ flex: 1 }}>
                  <TextInput
                    value={tempBudgetMin}
                    onChangeText={setTempBudgetMin}
                    placeholder="Minim"
                    placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
                    keyboardType="numeric"
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 15,
                      color: isDark ? "#FFFFFF" : "#111827",
                      backgroundColor: isDark ? "#2D2D2D" : "#F9FAFB",
                      borderRadius: 12,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: isDark ? "#3D3D3D" : "#E5E7EB",
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    value={tempBudgetMax}
                    onChangeText={setTempBudgetMax}
                    placeholder="Maxim"
                    placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
                    keyboardType="numeric"
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 15,
                      color: isDark ? "#FFFFFF" : "#111827",
                      backgroundColor: isDark ? "#2D2D2D" : "#F9FAFB",
                      borderRadius: 12,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: isDark ? "#3D3D3D" : "#E5E7EB",
                    }}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={handleResetFilters}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: "center",
                  backgroundColor: isDark ? "#2D2D2D" : "#F3F4F6",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 15,
                    color: isDark ? "#FFFFFF" : "#374151",
                  }}
                >
                  Reseteaza
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApplyFilters}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: "center",
                  backgroundColor: "#3B82F6",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 15,
                    color: "#FFFFFF",
                  }}
                >
                  Aplica
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
