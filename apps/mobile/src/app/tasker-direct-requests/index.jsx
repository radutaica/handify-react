import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useFocusEffect } from "expo-router";
import { directRequestsApi } from "@/api";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  DollarSign,
  Inbox,
} from "lucide-react-native";
import { Image } from "expo-image";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

const FILTERS = [
  { key: "all", label: "Toate" },
  { key: "pending", label: "In asteptare" },
  { key: "countered", label: "Contra-oferta" },
  { key: "accepted", label: "Acceptate" },
  { key: "rejected", label: "Respinse" },
];

const STATUS_CONFIG = {
  pending: { label: "In asteptare", color: "#F59E0B", bg: "#FEF3C7" },
  countered: { label: "Contra-oferta", color: "#3B82F6", bg: "#EFF6FF" },
  accepted: { label: "Acceptat", color: "#10B981", bg: "#ECFDF5" },
  rejected: { label: "Respins", color: "#EF4444", bg: "#FEF2F2" },
  expired: { label: "Expirat", color: "#6B7280", bg: "#F3F4F6" },
};

export default function DirectRequestsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  const loadRequests = useCallback(async () => {
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const response = await directRequestsApi.getDirectRequests(params);
      const data =
        response.data?.direct_requests || response.data || response || [];
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading direct requests:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [loadRequests])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const renderItem = ({ item }) => {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/tasker-direct-requests/${item.id}`)}
        style={{
          backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: isDark ? "#2D2D2D" : "#E5E7EB",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: isDark ? "#4B5563" : "#E5E7EB",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            {item.customer?.profile_image_url ? (
              <Image
                source={{ uri: item.customer.profile_image_url }}
                style={{ width: 44, height: 44, borderRadius: 22 }}
                contentFit="cover"
              />
            ) : (
              <User size={22} color={isDark ? "#9CA3AF" : "#6B7280"} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: isDark ? "#FFFFFF" : "#111827",
              }}
            >
              {item.customer?.first_name || "Client"}{" "}
              {item.customer?.last_name || ""}
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: isDark ? "#8F8F8F" : "#6B7280",
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {item.title || item.description || "Cerere directa"}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: status.bg,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 12,
                color: status.color,
              }}
            >
              {status.label}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 16 }}>
          {item.proposed_amount && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <DollarSign
                size={14}
                color={isDark ? "#8F8F8F" : "#9CA3AF"}
              />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: "#16A34A",
                  marginLeft: 4,
                }}
              >
                {parseFloat(item.proposed_amount).toFixed(0)} lei
              </Text>
            </View>
          )}
          {item.preferred_date && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Clock size={14} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: isDark ? "#8F8F8F" : "#6B7280",
                  marginLeft: 4,
                }}
              >
                {item.preferred_date}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!fontsLoaded) return null;

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
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: isDark ? "#121212" : "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#2D2D2D" : "#E5E7EB",
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

        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 20,
            color: isDark ? "#FFFFFF" : "#111827",
            marginLeft: 16,
            flex: 1,
          }}
        >
          Cereri directe
        </Text>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 8,
        }}
        style={{
          backgroundColor: isDark ? "#121212" : "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#2D2D2D" : "#E5E7EB",
          maxHeight: 60,
        }}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => {
              setFilter(f.key);
              setLoading(true);
            }}
            style={{
              backgroundColor:
                filter === f.key
                  ? "#3B82F6"
                  : isDark
                    ? "#2D2D2D"
                    : "#F3F4F6",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color:
                  filter === f.key
                    ? "#FFFFFF"
                    : isDark
                      ? "#B3B3B3"
                      : "#374151",
              }}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 20,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View
              style={{ alignItems: "center", paddingVertical: 60 }}
            >
              <Inbox size={48} color={isDark ? "#4B5563" : "#D1D5DB"} />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: isDark ? "#FFFFFF" : "#111827",
                  marginTop: 16,
                }}
              >
                Nicio cerere
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: isDark ? "#8F8F8F" : "#6B7280",
                  textAlign: "center",
                  marginTop: 8,
                  paddingHorizontal: 32,
                }}
              >
                Cererile directe de la clienti vor aparea aici.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
