import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useFocusEffect } from "expo-router";
import { useCurrentUser } from "@/utils/auth";
import { availabilityApi } from "@/api";
import {
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Plus,
  Trash2,
  Clock,
} from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

const DAYS_RO = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sam", "Dum"];

function getWeekDates(weekOffset = 0) {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + weekOffset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function formatDateDisplay(date) {
  return `${date.getDate()} ${["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "nov", "dec"][date.getMonth()]}`;
}

export default function TaskerAvailabilityScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { taskerProfile } = useCurrentUser();

  const [weekOffset, setWeekOffset] = useState(0);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("17:00");

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  const weekDates = getWeekDates(weekOffset);

  const loadSlots = useCallback(async () => {
    try {
      const response = await availabilityApi.getAvailability({
        tasker_id: taskerProfile?.id,
      });
      const data = response.data?.tasker_availabilities || response.data || response || [];
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading availability:", err);
    } finally {
      setLoading(false);
    }
  }, [taskerProfile?.id]);

  useFocusEffect(
    useCallback(() => {
      loadSlots();
    }, [loadSlots])
  );

  const getSlotsForDate = (date) => {
    const dateStr = formatDate(date);
    return slots.filter((s) => s.date === dateStr);
  };

  const handleAddSlot = async () => {
    if (!selectedDate) return;

    try {
      await availabilityApi.createSlot({
        date: formatDate(selectedDate),
        start_time: newStartTime,
        end_time: newEndTime,
        is_available: true,
      });
      setShowAddModal(false);
      setNewStartTime("09:00");
      setNewEndTime("17:00");
      loadSlots();
    } catch (err) {
      Alert.alert("Eroare", "Nu am putut adauga slotul.");
    }
  };

  const handleDeleteSlot = (slotId) => {
    Alert.alert("Sterge slot", "Esti sigur?", [
      { text: "Anuleaza", style: "cancel" },
      {
        text: "Sterge",
        style: "destructive",
        onPress: async () => {
          try {
            await availabilityApi.deleteSlot(slotId);
            loadSlots();
          } catch (err) {
            Alert.alert("Eroare", "Nu am putut sterge slotul.");
          }
        },
      },
    ]);
  };

  const openAddModal = (date) => {
    setSelectedDate(date);
    setShowAddModal(true);
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

  const inputStyle = {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: isDark ? "#FFFFFF" : "#111827",
    backgroundColor: isDark ? "#2D2D2D" : "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: isDark ? "#3D3D3D" : "#E5E7EB",
  };

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
          Disponibilitate
        </Text>
      </View>

      {/* Week Navigator */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#2D2D2D" : "#E5E7EB",
        }}
      >
        <TouchableOpacity
          onPress={() => setWeekOffset((p) => p - 1)}
          style={{ padding: 8 }}
        >
          <ChevronLeft size={22} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>

        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 15,
            color: isDark ? "#FFFFFF" : "#111827",
          }}
        >
          {formatDateDisplay(weekDates[0])} - {formatDateDisplay(weekDates[6])}
        </Text>

        <TouchableOpacity
          onPress={() => setWeekOffset((p) => p + 1)}
          style={{ padding: 8 }}
        >
          <ChevronRightIcon size={22} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {weekDates.map((date, dayIndex) => {
          const daySlots = getSlotsForDate(date);
          const isToday = formatDate(date) === formatDate(new Date());

          return (
            <View
              key={dayIndex}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "#2D2D2D" : "#F3F4F6",
                backgroundColor: isToday
                  ? isDark
                    ? "#1E293B"
                    : "#EFF6FF"
                  : "transparent",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: daySlots.length > 0 ? 10 : 0,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      fontFamily: "Inter_700Bold",
                      fontSize: 14,
                      color: isToday
                        ? "#3B82F6"
                        : isDark
                          ? "#FFFFFF"
                          : "#111827",
                      width: 36,
                    }}
                  >
                    {DAYS_RO[dayIndex]}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: isDark ? "#8F8F8F" : "#6B7280",
                      marginLeft: 8,
                    }}
                  >
                    {date.getDate()}/{date.getMonth() + 1}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => openAddModal(date)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: isDark ? "#2D2D2D" : "#F3F4F6",
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  }}
                >
                  <Plus size={14} color="#3B82F6" />
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 12,
                      color: "#3B82F6",
                      marginLeft: 4,
                    }}
                  >
                    Adauga
                  </Text>
                </TouchableOpacity>
              </View>

              {daySlots.map((slot) => (
                <View
                  key={slot.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: slot.is_available
                      ? isDark
                        ? "#1A3A2F"
                        : "#ECFDF5"
                      : isDark
                        ? "#1E293B"
                        : "#EFF6FF",
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 6,
                  }}
                >
                  <Clock
                    size={14}
                    color={slot.is_available ? "#10B981" : "#3B82F6"}
                  />
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                      color: slot.is_available
                        ? "#10B981"
                        : "#3B82F6",
                      marginLeft: 8,
                      flex: 1,
                    }}
                  >
                    {slot.start_time} - {slot.end_time}
                  </Text>
                  {slot.is_available && (
                    <TouchableOpacity
                      onPress={() => handleDeleteSlot(slot.id)}
                      style={{ padding: 4 }}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>

      {/* Add Slot Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
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
              Adauga slot
            </Text>
            {selectedDate && (
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: isDark ? "#8F8F8F" : "#6B7280",
                  marginBottom: 20,
                }}
              >
                {DAYS_RO[selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1]},{" "}
                {formatDateDisplay(selectedDate)}
              </Text>
            )}

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: isDark ? "#B3B3B3" : "#374151",
                  marginBottom: 8,
                }}
              >
                Ora inceput
              </Text>
              <TextInput
                value={newStartTime}
                onChangeText={setNewStartTime}
                placeholder="09:00"
                placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
                style={inputStyle}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: isDark ? "#B3B3B3" : "#374151",
                  marginBottom: 8,
                }}
              >
                Ora sfarsit
              </Text>
              <TextInput
                value={newEndTime}
                onChangeText={setNewEndTime}
                placeholder="17:00"
                placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
                style={inputStyle}
              />
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
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
                onPress={handleAddSlot}
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
                  Adauga
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
