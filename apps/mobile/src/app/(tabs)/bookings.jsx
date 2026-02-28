import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useCurrentUser } from "@/utils/auth";
import { tasksApi } from "@/api";
import { mapTaskToBookingCard, formatTaskDate, formatRelativeDate, TASK_STATUS_CONFIG } from "@/utils/mapTaskData";
import {
  Calendar,
  MapPin,
  Plus,
  AlertTriangle,
  Inbox,
} from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

const TABS = [
  { key: "upcoming", label: "Viitoare", statusFilter: "open,assigned,in_progress" },
  { key: "completed", label: "Finalizate", statusFilter: "completed" },
  { key: "cancelled", label: "Anulate", statusFilter: "cancelled" },
];

function BookingCard({ booking, isDark, onPress }) {
  const statusConfig = TASK_STATUS_CONFIG[booking.status] || TASK_STATUS_CONFIG.open;

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
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
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
            {booking.title}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: isDark ? "#B3B3B3" : "#6B7280",
            }}
          >
            {booking.categoryName}
            {booking.taskerName ? ` • ${booking.taskerName}` : ""}
          </Text>
        </View>

        {/* Status Badge */}
        <View
          style={{
            backgroundColor: statusConfig.bg,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 6,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 12,
              color: statusConfig.color,
            }}
          >
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Description */}
      {booking.description && (
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            color: isDark ? "#B3B3B3" : "#6B7280",
            marginBottom: 10,
            lineHeight: 20,
          }}
          numberOfLines={2}
        >
          {booking.description}
        </Text>
      )}

      {/* Details */}
      <View style={{ gap: 6, marginBottom: 10 }}>
        {booking.taskDate && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Calendar size={14} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: isDark ? "#B3B3B3" : "#6B7280",
                marginLeft: 8,
              }}
            >
              {formatTaskDate(booking.taskDate)}
              {booking.taskTime ? ` la ${booking.taskTime}` : ""}
            </Text>
          </View>
        )}

        {booking.location ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MapPin size={14} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: isDark ? "#B3B3B3" : "#6B7280",
                marginLeft: 8,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {booking.location}
            </Text>
          </View>
        ) : null}

        {booking.urgency === "high" && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <AlertTriangle size={14} color="#EF4444" />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 13,
                color: "#EF4444",
                marginLeft: 8,
              }}
            >
              Urgent
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {booking.price ? (
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 15,
              color: "#16A34A",
            }}
          >
            {booking.price}
          </Text>
        ) : (
          <View />
        )}

        {booking.status === "open" && booking.bidsCount > 0 && (
          <View
            style={{
              backgroundColor: "#DBEAFE",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 12,
                color: "#1D4ED8",
              }}
            >
              {booking.bidsCount} {booking.bidsCount === 1 ? "oferta" : "oferte"} primite
            </Text>
          </View>
        )}

        {!booking.price && booking.bidsCount === 0 && (
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 12,
              color: isDark ? "#8F8F8F" : "#9CA3AF",
            }}
          >
            {formatRelativeDate(booking.createdAt)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function BookingsPage() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useCurrentUser();

  const [selectedTab, setSelectedTab] = useState("upcoming");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  const currentTabConfig = TABS.find((t) => t.key === selectedTab);

  const loadTasks = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await tasksApi.getCustomerTasks({
        customer_id: user.id,
        status: currentTabConfig?.statusFilter,
      });

      const raw = Array.isArray(response) ? response : response.data || response.tasks || [];
      const mapped = (Array.isArray(raw) ? raw : []).map(mapTaskToBookingCard);
      setTasks(mapped);
    } catch (error) {
      console.error("Error loading tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, currentTabConfig?.statusFilter]);

  useEffect(() => {
    setLoading(true);
    loadTasks();
  }, [loadTasks]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const handleTabChange = (tabKey) => {
    setSelectedTab(tabKey);
    setLoading(true);
  };

  const handleBookingPress = (booking) => {
    router.push(`/(tabs)/booking/${booking.id}`);
  };

  const handleCreateBooking = () => {
    router.push("/(tabs)/service-request");
  };

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
          paddingHorizontal: 16,
          paddingVertical: 16,
          backgroundColor: isDark ? "#121212" : "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#2D2D2D" : "#E5E7EB",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 28,
            color: isDark ? "#FFFFFF" : "#000000",
          }}
        >
          Sarcinile mele
        </Text>

        <TouchableOpacity
          onPress={handleCreateBooking}
          style={{
            backgroundColor: "#000000",
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 14,
              color: "#FFFFFF",
              marginLeft: 6,
            }}
          >
            Nou
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: isDark ? "#121212" : "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#2D2D2D" : "#E5E7EB",
        }}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => handleTabChange(tab.key)}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 8,
              borderBottomWidth: selectedTab === tab.key ? 2 : 0,
              borderBottomColor: "#000000",
            }}
          >
            <Text
              style={{
                fontFamily:
                  selectedTab === tab.key
                    ? "Inter_600SemiBold"
                    : "Inter_400Regular",
                fontSize: 16,
                color:
                  selectedTab === tab.key
                    ? isDark
                      ? "#FFFFFF"
                      : "#000000"
                    : isDark
                      ? "#8F8F8F"
                      : "#6B7280",
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
            Se incarca...
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
            <Inbox size={36} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
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
            {selectedTab === "upcoming"
              ? "Nicio sarcina activa"
              : selectedTab === "completed"
                ? "Nicio sarcina finalizata"
                : "Nicio sarcina anulata"}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: isDark ? "#B3B3B3" : "#6B7280",
              textAlign: "center",
              lineHeight: 20,
              marginBottom: 24,
            }}
          >
            {selectedTab === "upcoming"
              ? "Publica o sarcina pentru a primi oferte de la mesterii din zona ta."
              : `Sarcinile ${selectedTab === "completed" ? "finalizate" : "anulate"} vor aparea aici.`}
          </Text>
          {selectedTab === "upcoming" && (
            <TouchableOpacity
              onPress={handleCreateBooking}
              style={{
                backgroundColor: "#000000",
                borderRadius: 8,
                paddingHorizontal: 24,
                paddingVertical: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: "#FFFFFF",
                }}
              >
                Publica o sarcina
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 100,
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
          {tasks.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              isDark={isDark}
              onPress={() => handleBookingPress(booking)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
