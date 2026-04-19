import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useColorScheme,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { tasksApi, disputesApi } from "@/api";
import {
  ChevronLeft,
  Calendar,
  DollarSign,
  User,
  MapPin,
  Clock,
  FileText,
  AlertTriangle,
  Play,
  CheckCircle,
} from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

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

function SectionCard({ title, children, isDark }) {
  return (
    <View
      style={{
        backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: isDark ? "#2D2D2D" : "#E5E7EB",
      }}
    >
      {title && (
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 14,
            color: isDark ? "#8F8F8F" : "#6B7280",
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}

function InfoRow({ icon: Icon, label, value, isDark }) {
  if (!value) return null;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: isDark ? "#2D2D2D" : "#F3F4F6",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        <Icon size={16} color={isDark ? "#8F8F8F" : "#6B7280"} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 12,
            color: isDark ? "#8F8F8F" : "#9CA3AF",
            marginBottom: 2,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 15,
            color: isDark ? "#FFFFFF" : "#111827",
          }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function TaskDetail() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { id } = useLocalSearchParams();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showDisputeInput, setShowDisputeInput] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  const loadTask = useCallback(async () => {
    if (!id) return;

    try {
      const response = await tasksApi.getTask(id);
      setTask(response.data?.task || response.data);
    } catch (error) {
      console.error("Error loading task:", error);
      Alert.alert("Error", "Failed to load task details");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const handleStartTask = async () => {
    Alert.alert(
      "Start Task",
      "Are you sure you want to start working on this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start",
          onPress: async () => {
            setUpdating(true);
            try {
              await tasksApi.updateTaskStatus(id, "in_progress");
              setTask((prev) => ({ ...prev, status: "in_progress" }));
              Alert.alert("Success", "Task started successfully");
            } catch (error) {
              console.error("Error starting task:", error);
              Alert.alert("Error", "Failed to start task");
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleCompleteTask = async () => {
    Alert.alert(
      "Complete Task",
      "Are you sure you want to mark this task as completed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: async () => {
            setUpdating(true);
            try {
              await tasksApi.updateTaskStatus(id, "completed");
              setTask((prev) => ({ ...prev, status: "completed" }));
              Alert.alert("Success", "Task marked as completed");
            } catch (error) {
              console.error("Error completing task:", error);
              Alert.alert("Error", "Failed to complete task");
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleSubmitDispute = async () => {
    if (!disputeReason.trim()) {
      Alert.alert("Eroare", "Te rugam sa descrii problema.");
      return;
    }
    setUpdating(true);
    try {
      await disputesApi.createDispute({
        task_id: id,
        reason: disputeReason.trim(),
      });
      setShowDisputeInput(false);
      setDisputeReason("");
      setTask((prev) => ({ ...prev, status: "disputed" }));
      Alert.alert("Succes", "Disputa a fost inregistrata.");
    } catch (err) {
      Alert.alert("Eroare", "Nu am putut inregistra disputa.");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatPrice = () => {
    if (!task) return null;
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

  const getCustomerName = () => {
    if (!task?.customer) return null;
    const { first_name, last_name } = task.customer;
    if (first_name && last_name) {
      return `${first_name} ${last_name}`;
    }
    return first_name || null;
  };

  const getAddress = () => {
    if (!task?.address) return null;
    // Support both address formats: full_address (customer view) and street/city (tasker view)
    if (task.address.full_address) return task.address.full_address;
    const { street_address, street, city, county, state, zip_code, postal_code } = task.address;
    const parts = [street_address || street, city, county || state, postal_code || zip_code].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  };

  if (!fontsLoaded || loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? "#121212" : "#F9FAFB",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!task) {
    return null;
  }

  const statusStyle = STATUS_COLORS[task.status] || STATUS_COLORS.assigned;
  const canStart = task.status === "assigned";
  const canComplete = task.status === "in_progress";
  const isFinished =
    task.status === "completed" ||
    task.status === "cancelled" ||
    task.status === "disputed";

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
          Task Details
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + (canStart || canComplete ? 100 : 16),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Status Section */}
        <SectionCard isDark={isDark}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 20,
                color: isDark ? "#FFFFFF" : "#111827",
                flex: 1,
                marginRight: 12,
              }}
            >
              {task.title}
            </Text>

            <View
              style={{
                backgroundColor: statusStyle.bg,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 13,
                  color: statusStyle.text,
                }}
              >
                {STATUS_LABELS[task.status] || task.status}
              </Text>
            </View>
          </View>

          {task.category?.name && (
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 15,
                color: isDark ? "#B3B3B3" : "#6B7280",
              }}
            >
              {task.category.name}
            </Text>
          )}

          {task.urgency === "high" && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 12,
                backgroundColor: "#FEF3C7",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <AlertTriangle size={16} color="#B45309" />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: "#B45309",
                  marginLeft: 8,
                }}
              >
                This is an urgent task
              </Text>
            </View>
          )}
        </SectionCard>

        {/* Customer Section */}
        {getCustomerName() && (
          <SectionCard title="Customer" isDark={isDark}>
            <InfoRow
              icon={User}
              label="Name"
              value={getCustomerName()}
              isDark={isDark}
            />
            {task.customer?.phone && (
              <InfoRow
                icon={User}
                label="Phone"
                value={task.customer.phone}
                isDark={isDark}
              />
            )}
          </SectionCard>
        )}

        {/* Task Details Section */}
        {task.description && (
          <SectionCard title="Description" isDark={isDark}>
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: isDark ? "#2D2D2D" : "#F3F4F6",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <FileText size={16} color={isDark ? "#8F8F8F" : "#6B7280"} />
              </View>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: isDark ? "#FFFFFF" : "#374151",
                  flex: 1,
                  lineHeight: 22,
                }}
              >
                {task.description}
              </Text>
            </View>
          </SectionCard>
        )}

        {/* Schedule & Location Section */}
        <SectionCard title="Schedule & Location" isDark={isDark}>
          <InfoRow
            icon={Calendar}
            label="Scheduled Date"
            value={formatDate(task.scheduled_at)}
            isDark={isDark}
          />
          {task.duration_hours && (
            <InfoRow
              icon={Clock}
              label="Estimated Duration"
              value={`${task.duration_hours} ${task.duration_hours > 1 ? "ore" : "ora"}`}
              isDark={isDark}
            />
          )}
          <InfoRow
            icon={MapPin}
            label="Location"
            value={getAddress()}
            isDark={isDark}
          />
        </SectionCard>

        {/* Pricing Section */}
        {formatPrice() && (
          <SectionCard title="Pricing" isDark={isDark}>
            <InfoRow
              icon={DollarSign}
              label="Payment"
              value={formatPrice()}
              isDark={isDark}
            />
          </SectionCard>
        )}

        {/* Completion Info (for completed tasks) */}
        {task.status === "completed" && task.completed_at && (
          <SectionCard title="Completion" isDark={isDark}>
            <InfoRow
              icon={CheckCircle}
              label="Completed On"
              value={formatDate(task.completed_at)}
              isDark={isDark}
            />
          </SectionCard>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {(canStart || canComplete) && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: isDark ? "#121212" : "#FFFFFF",
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: insets.bottom + 16,
            borderTopWidth: 1,
            borderTopColor: isDark ? "#2D2D2D" : "#E5E7EB",
          }}
        >
          {canStart && (
            <TouchableOpacity
              onPress={handleStartTask}
              disabled={updating}
              style={{
                backgroundColor: "#3B82F6",
                borderRadius: 12,
                paddingVertical: 16,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                opacity: updating ? 0.7 : 1,
              }}
            >
              {updating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Play size={20} color="white" />
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 16,
                      color: "white",
                      marginLeft: 8,
                    }}
                  >
                    Start Task
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {canComplete && (
            <>
              <TouchableOpacity
                onPress={handleCompleteTask}
                disabled={updating}
                style={{
                  backgroundColor: "#10B981",
                  borderRadius: 12,
                  paddingVertical: 16,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: updating ? 0.7 : 1,
                }}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <CheckCircle size={20} color="white" />
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 16,
                        color: "white",
                        marginLeft: 8,
                      }}
                    >
                      Mark Complete
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowDisputeInput(true)}
                style={{
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 14,
                    color: "#EF4444",
                  }}
                >
                  Raporteaza o problema
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* Dispute Modal */}
      <Modal
        visible={showDisputeInput}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDisputeInput(false)}
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
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 18,
                color: isDark ? "#FFFFFF" : "#111827",
                marginBottom: 4,
              }}
            >
              Raporteaza o problema
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: isDark ? "#8F8F8F" : "#6B7280",
                marginBottom: 20,
              }}
            >
              Descrie problema intampinata cu aceasta sarcina.
            </Text>

            <TextInput
              value={disputeReason}
              onChangeText={setDisputeReason}
              placeholder="Descrie problema..."
              placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
              multiline
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 15,
                color: isDark ? "#FFFFFF" : "#111827",
                backgroundColor: isDark ? "#2D2D2D" : "#F9FAFB",
                borderRadius: 12,
                padding: 16,
                minHeight: 120,
                textAlignVertical: "top",
                borderWidth: 1,
                borderColor: isDark ? "#3D3D3D" : "#E5E7EB",
                marginBottom: 20,
              }}
            />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowDisputeInput(false);
                  setDisputeReason("");
                }}
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
                  Anuleaza
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitDispute}
                disabled={updating}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: "center",
                  backgroundColor: "#EF4444",
                  opacity: updating ? 0.6 : 1,
                }}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 15,
                      color: "#FFFFFF",
                    }}
                  >
                    Trimite
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
