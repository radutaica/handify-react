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
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { tasksApi, bidsApi } from "@/api";
import {
  formatTaskDate,
  formatRelativeDate,
  URGENCY_CONFIG,
} from "@/utils/mapTaskData";
import {
  ChevronLeft,
  Calendar,
  MapPin,
  Clock,
  FileText,
  AlertTriangle,
  User,
  Tag,
  Users,
  Send,
  Image as ImageIcon,
} from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

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

function formatPrice(task) {
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
}

export default function BrowseTaskDetail() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { id } = useLocalSearchParams();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Bid form state
  const [bidAmount, setBidAmount] = useState("");
  const [bidHours, setBidHours] = useState("");
  const [bidDate, setBidDate] = useState("");
  const [bidTime, setBidTime] = useState("");
  const [bidMessage, setBidMessage] = useState("");

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
      Alert.alert("Eroare", "Nu am putut incarca detaliile lucrarii.");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const handleSubmitBid = async () => {
    if (!bidAmount.trim()) {
      Alert.alert("Eroare", "Te rugam sa introduci suma ofertei.");
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Eroare", "Suma ofertei trebuie sa fie un numar pozitiv.");
      return;
    }

    const bidData = {
      amount,
    };

    if (bidHours.trim()) {
      const hours = parseFloat(bidHours);
      if (!isNaN(hours) && hours > 0) {
        bidData.estimated_hours = hours;
      }
    }

    if (bidDate.trim()) {
      bidData.proposed_date = bidDate.trim();
    }

    if (bidTime.trim()) {
      bidData.proposed_time = bidTime.trim();
    }

    if (bidMessage.trim()) {
      bidData.message = bidMessage.trim();
    }

    setSubmitting(true);
    try {
      await bidsApi.createBid(id, bidData);
      Alert.alert("Succes", "Oferta ta a fost trimisa cu succes!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error submitting bid:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Nu am putut trimite oferta. Incearca din nou.";
      Alert.alert("Eroare", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getCustomerName = () => {
    if (!task?.customer) return null;
    const { first_name, last_name } = task.customer;
    if (first_name) {
      return `${first_name} ${last_name?.[0] || ""}.`;
    }
    return null;
  };

  const getAddress = () => {
    if (!task?.address) return null;
    const { street, city, state, zip_code } = task.address;
    const parts = [street, city, state, zip_code].filter(Boolean);
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

  const urgencyConfig = URGENCY_CONFIG[task.urgency] || URGENCY_CONFIG.medium;
  const price = formatPrice(task);
  const images = task.images || task.task_images || [];

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
          numberOfLines={1}
        >
          Detalii Lucrare
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 16,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title & Urgency Section */}
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
                  backgroundColor:
                    task.urgency === "high"
                      ? "#FEE2E2"
                      : task.urgency === "medium"
                        ? "#DBEAFE"
                        : "#F3F4F6",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                    color: urgencyConfig.color,
                  }}
                >
                  {urgencyConfig.label}
                </Text>
              </View>
            </View>

            {task.category?.name && (
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: isDark ? "#B3B3B3" : "#6B7280",
                  marginBottom: 8,
                }}
              >
                {task.category.name}
              </Text>
            )}

            {/* Bids count & Posted date */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Users size={14} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: isDark ? "#8F8F8F" : "#9CA3AF",
                  marginLeft: 6,
                  marginRight: 16,
                }}
              >
                {task.bids_count || 0}{" "}
                {(task.bids_count || 0) === 1 ? "oferta" : "oferte"}
              </Text>
              <Clock size={14} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: isDark ? "#8F8F8F" : "#9CA3AF",
                  marginLeft: 6,
                }}
              >
                Publicat {formatRelativeDate(task.created_at)}
              </Text>
            </View>

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
                  Lucrare urgenta
                </Text>
              </View>
            )}
          </SectionCard>

          {/* Description */}
          {task.description && (
            <SectionCard title="Descriere" isDark={isDark}>
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

          {/* Customer */}
          {getCustomerName() && (
            <SectionCard title="Client" isDark={isDark}>
              <InfoRow
                icon={User}
                label="Nume"
                value={getCustomerName()}
                isDark={isDark}
              />
            </SectionCard>
          )}

          {/* Pricing */}
          {price && (
            <SectionCard title="Buget" isDark={isDark}>
              <InfoRow
                icon={Tag}
                label="Plata"
                value={price}
                isDark={isDark}
              />
            </SectionCard>
          )}

          {/* Schedule & Location */}
          <SectionCard title="Program si Locatie" isDark={isDark}>
            <InfoRow
              icon={Calendar}
              label="Data programata"
              value={
                task.task_date
                  ? formatTaskDate(task.task_date)
                  : task.scheduled_at
                    ? formatTaskDate(task.scheduled_at)
                    : null
              }
              isDark={isDark}
            />
            {task.task_time && (
              <InfoRow
                icon={Clock}
                label="Ora"
                value={task.task_time}
                isDark={isDark}
              />
            )}
            {task.duration_hours && (
              <InfoRow
                icon={Clock}
                label="Durata estimata"
                value={`${task.duration_hours} ${task.duration_hours > 1 ? "ore" : "ora"}`}
                isDark={isDark}
              />
            )}
            <InfoRow
              icon={MapPin}
              label="Locatie"
              value={getAddress()}
              isDark={isDark}
            />
          </SectionCard>

          {/* Images */}
          {images.length > 0 && (
            <SectionCard title="Imagini" isDark={isDark}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginHorizontal: -4 }}
              >
                {images.map((img, index) => (
                  <View
                    key={img.id || index}
                    style={{
                      marginHorizontal: 4,
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      source={{ uri: img.url || img.image_url }}
                      style={{
                        width: 160,
                        height: 120,
                        borderRadius: 12,
                      }}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </ScrollView>
            </SectionCard>
          )}

          {/* Bid Submission Form */}
          <SectionCard title="Depune Oferta" isDark={isDark}>
            {/* Amount */}
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: isDark ? "#FFFFFF" : "#111827",
                marginBottom: 6,
              }}
            >
              Suma (lei) *
            </Text>
            <TextInput
              value={bidAmount}
              onChangeText={setBidAmount}
              placeholder="ex: 250"
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
                marginBottom: 16,
              }}
            />

            {/* Estimated Hours */}
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: isDark ? "#FFFFFF" : "#111827",
                marginBottom: 6,
              }}
            >
              Ore estimate
            </Text>
            <TextInput
              value={bidHours}
              onChangeText={setBidHours}
              placeholder="ex: 3"
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
                marginBottom: 16,
              }}
            />

            {/* Proposed Date */}
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: isDark ? "#FFFFFF" : "#111827",
                marginBottom: 6,
              }}
            >
              Data propusa
            </Text>
            <TextInput
              value={bidDate}
              onChangeText={setBidDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 15,
                color: isDark ? "#FFFFFF" : "#111827",
                backgroundColor: isDark ? "#2D2D2D" : "#F9FAFB",
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: isDark ? "#3D3D3D" : "#E5E7EB",
                marginBottom: 16,
              }}
            />

            {/* Proposed Time */}
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: isDark ? "#FFFFFF" : "#111827",
                marginBottom: 6,
              }}
            >
              Ora propusa
            </Text>
            <TextInput
              value={bidTime}
              onChangeText={setBidTime}
              placeholder="HH:MM"
              placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 15,
                color: isDark ? "#FFFFFF" : "#111827",
                backgroundColor: isDark ? "#2D2D2D" : "#F9FAFB",
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: isDark ? "#3D3D3D" : "#E5E7EB",
                marginBottom: 16,
              }}
            />

            {/* Message */}
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: isDark ? "#FFFFFF" : "#111827",
                marginBottom: 6,
              }}
            >
              Mesaj
            </Text>
            <TextInput
              value={bidMessage}
              onChangeText={setBidMessage}
              placeholder="Descrie experienta ta si de ce esti potrivit pentru aceasta lucrare..."
              placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
              multiline
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 15,
                color: isDark ? "#FFFFFF" : "#111827",
                backgroundColor: isDark ? "#2D2D2D" : "#F9FAFB",
                borderRadius: 12,
                padding: 14,
                minHeight: 100,
                textAlignVertical: "top",
                borderWidth: 1,
                borderColor: isDark ? "#3D3D3D" : "#E5E7EB",
                marginBottom: 20,
              }}
            />

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmitBid}
              disabled={submitting}
              style={{
                backgroundColor: "#3B82F6",
                borderRadius: 12,
                paddingVertical: 16,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Send size={20} color="white" />
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 16,
                      color: "white",
                      marginLeft: 8,
                    }}
                  >
                    Trimite Oferta
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </SectionCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
