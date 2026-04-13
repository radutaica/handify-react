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
import {
  ChevronLeft,
  Calendar,
  DollarSign,
  User,
  AlertTriangle,
} from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "assigned", label: "Assigned" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

const STATUS_COLORS = {
  assigned: { bg: "#DBEAFE", text: "#1D4ED8" },
  in_progress: { bg: "#FEF3C7", text: "#B45309" },
  completed: { bg: "#D1FAE5", text: "#047857" },
  cancelled: { bg: "#FEE2E2", text: "#DC2626" },
  disputed: { bg: "#FEE2E2", text: "#DC2626" },
};

const STATUS_LABELS = {
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  disputed: "Disputed",
};

function TaskCard({ task, isDark, onPress }) {
  const statusStyle = STATUS_COLORS[task.status] || STATUS_COLORS.assigned;

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatPrice = () => {
    if (task.fixed_price) {
      return `${parseFloat(task.fixed_price).toFixed(0)} lei (pret fix)`;
    }
    if (task.budget_min && task.budget_max) {
      return `${task.budget_min} - ${task.budget_max} lei`;
    }
    if (task.budget_min) {
      return `de la ${task.budget_min} lei`;
    }
    return null;
  };

  const customerName = task.customer?.first_name
    ? `${task.customer.first_name} ${task.customer.last_name?.[0] || ""}.`
    : null;

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

        {/* Status Badge */}
        <View
          style={{
            backgroundColor: statusStyle.bg,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 6,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 12,
              color: statusStyle.text,
            }}
          >
            {STATUS_LABELS[task.status] || task.status}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View style={{ gap: 8 }}>
        {task.scheduled_at && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Calendar size={14} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: isDark ? "#B3B3B3" : "#6B7280",
                marginLeft: 8,
              }}
            >
              {formatDate(task.scheduled_at)}
            </Text>
          </View>
        )}

        {formatPrice() && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <DollarSign size={14} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: isDark ? "#B3B3B3" : "#6B7280",
                marginLeft: 8,
              }}
            >
              {formatPrice()}
            </Text>
          </View>
        )}

        {customerName && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <User size={14} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: isDark ? "#B3B3B3" : "#6B7280",
                marginLeft: 8,
              }}
            >
              {customerName}
            </Text>
          </View>
        )}

        {task.urgency === "high" && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <AlertTriangle size={14} color="#F59E0B" />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: "#F59E0B",
                marginLeft: 8,
              }}
            >
              Urgent
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function TaskerTasksList() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user, taskerProfile } = useCurrentUser();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  const loadTasks = useCallback(async () => {
    if (!user?.id) return;

    try {
      const params = {
        assigned_tasker_id: taskerProfile?.id || user.id,
      };

      if (activeFilter !== "all") {
        params.status = activeFilter;
      }

      const response = await tasksApi.getTaskerTasks(params);
      setTasks(response.data?.tasks || response.data || []);
    } catch (error) {
      console.error("Error loading tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, taskerProfile?.id, activeFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const handleFilterChange = (filterKey) => {
    setActiveFilter(filterKey);
    setLoading(true);
  };

  const handleTaskPress = (task) => {
    router.push(`/tasker-tasks/${task.id}`);
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
          }}
        >
          My Tasks
        </Text>
      </View>

      {/* Filter Tabs */}
      <View
        style={{
          backgroundColor: isDark ? "#121212" : "#FFFFFF",
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#2D2D2D" : "#E5E7EB",
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {STATUS_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => handleFilterChange(filter.key)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                backgroundColor:
                  activeFilter === filter.key
                    ? "#3B82F6"
                    : isDark
                      ? "#2D2D2D"
                      : "#F3F4F6",
              }}
            >
              <Text
                style={{
                  fontFamily:
                    activeFilter === filter.key
                      ? "Inter_600SemiBold"
                      : "Inter_400Regular",
                  fontSize: 14,
                  color:
                    activeFilter === filter.key
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
            Loading tasks...
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
            <Calendar size={36} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
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
            No tasks yet
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
            {activeFilter === "all"
              ? "Tasks assigned to you will appear here"
              : `No ${activeFilter.replace("_", " ")} tasks found`}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 16,
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
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isDark={isDark}
              onPress={() => handleTaskPress(task)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
