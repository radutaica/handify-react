import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { directRequestsApi } from "@/api";
import {
  ChevronLeft,
  User,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  MessageCircle,
} from "lucide-react-native";
import { Image } from "expo-image";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

const STATUS_CONFIG = {
  pending: { label: "In asteptare", color: "#F59E0B", bg: "#FEF3C7" },
  countered: { label: "Contra-oferta", color: "#3B82F6", bg: "#EFF6FF" },
  accepted: { label: "Acceptat", color: "#10B981", bg: "#ECFDF5" },
  rejected: { label: "Respins", color: "#EF4444", bg: "#FEF2F2" },
  expired: { label: "Expirat", color: "#6B7280", bg: "#F3F4F6" },
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

export default function DirectRequestDetailScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { id } = useLocalSearchParams();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [showCounter, setShowCounter] = useState(false);
  const [counterAmount, setCounterAmount] = useState("");
  const [counterMessage, setCounterMessage] = useState("");

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    try {
      const response = await directRequestsApi.getDirectRequest(id);
      const data = response.data?.direct_request || response.data || response;
      setRequest(data);
    } catch (err) {
      console.error("Error loading direct request:", err);
      Alert.alert("Eroare", "Nu am putut incarca cererea.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    Alert.alert("Accepta cererea", "Esti sigur ca vrei sa accepti aceasta cerere?", [
      { text: "Anuleaza", style: "cancel" },
      {
        text: "Accepta",
        onPress: async () => {
          setActing(true);
          try {
            await directRequestsApi.acceptDirectRequest(id);
            Alert.alert("Succes", "Cererea a fost acceptata!");
            loadRequest();
          } catch (err) {
            Alert.alert("Eroare", "Nu am putut accepta cererea.");
          } finally {
            setActing(false);
          }
        },
      },
    ]);
  };

  const handleReject = () => {
    Alert.alert("Refuza cererea", "Esti sigur ca vrei sa refuzi aceasta cerere?", [
      { text: "Anuleaza", style: "cancel" },
      {
        text: "Refuza",
        style: "destructive",
        onPress: async () => {
          setActing(true);
          try {
            await directRequestsApi.rejectDirectRequest(id);
            Alert.alert("Cerere refuzata");
            loadRequest();
          } catch (err) {
            Alert.alert("Eroare", "Nu am putut refuza cererea.");
          } finally {
            setActing(false);
          }
        },
      },
    ]);
  };

  const handleCounter = async () => {
    if (!counterAmount.trim()) {
      Alert.alert("Eroare", "Introdu un pret.");
      return;
    }
    setActing(true);
    try {
      await directRequestsApi.counterOffer(id, {
        amount: parseFloat(counterAmount),
        message: counterMessage.trim() || undefined,
      });
      Alert.alert("Succes", "Contra-oferta a fost trimisa!");
      setShowCounter(false);
      loadRequest();
    } catch (err) {
      Alert.alert("Eroare", "Nu am putut trimite contra-oferta.");
    } finally {
      setActing(false);
    }
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

  if (!request) return null;

  const status = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
  const isPending = request.status === "pending";

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
          Detalii cerere
        </Text>

        <View
          style={{
            backgroundColor: status.bg,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 13,
              color: status.color,
            }}
          >
            {status.label}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + (isPending ? 200 : 20),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Customer Info */}
        <SectionCard title="Client" isDark={isDark}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: isDark ? "#4B5563" : "#E5E7EB",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              {request.customer?.profile_image_url ? (
                <Image
                  source={{ uri: request.customer.profile_image_url }}
                  style={{ width: 50, height: 50, borderRadius: 25 }}
                  contentFit="cover"
                />
              ) : (
                <User size={24} color={isDark ? "#9CA3AF" : "#6B7280"} />
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
                {request.customer?.first_name || "Client"}{" "}
                {request.customer?.last_name || ""}
              </Text>
            </View>
          </View>
        </SectionCard>

        {/* Request Details */}
        <SectionCard title="Detalii cerere" isDark={isDark}>
          {request.title && (
            <InfoRow
              icon={FileText}
              label="Titlu"
              value={request.title}
              isDark={isDark}
            />
          )}
          {request.description && (
            <InfoRow
              icon={FileText}
              label="Descriere"
              value={request.description}
              isDark={isDark}
            />
          )}
          <InfoRow
            icon={DollarSign}
            label="Pret propus"
            value={
              request.proposed_amount
                ? `${parseFloat(request.proposed_amount).toFixed(0)} lei`
                : null
            }
            isDark={isDark}
          />
          <InfoRow
            icon={Calendar}
            label="Data preferata"
            value={request.preferred_date}
            isDark={isDark}
          />
          <InfoRow
            icon={MapPin}
            label="Locatie"
            value={request.location || request.address}
            isDark={isDark}
          />
        </SectionCard>

        {/* Counter Offer Form */}
        {isPending && showCounter && (
          <SectionCard title="Contra-oferta" isDark={isDark}>
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: isDark ? "#B3B3B3" : "#374151",
                  marginBottom: 8,
                }}
              >
                Pretul tau (lei)
              </Text>
              <TextInput
                value={counterAmount}
                onChangeText={setCounterAmount}
                placeholder="ex: 250"
                placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
                keyboardType="numeric"
                style={inputStyle}
              />
            </View>
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: isDark ? "#B3B3B3" : "#374151",
                  marginBottom: 8,
                }}
              >
                Mesaj (optional)
              </Text>
              <TextInput
                value={counterMessage}
                onChangeText={setCounterMessage}
                placeholder="Explica contra-oferta ta..."
                placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
                multiline
                style={{
                  ...inputStyle,
                  minHeight: 80,
                  textAlignVertical: "top",
                }}
              />
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowCounter(false)}
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
                onPress={handleCounter}
                disabled={acting}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: "center",
                  backgroundColor: "#3B82F6",
                  opacity: acting ? 0.6 : 1,
                }}
              >
                {acting ? (
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
          </SectionCard>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {isPending && !showCounter && (
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
            gap: 8,
          }}
        >
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={handleReject}
              disabled={acting}
              style={{
                flex: 1,
                backgroundColor: "#FEE2E2",
                borderRadius: 12,
                paddingVertical: 14,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <XCircle size={18} color="#DC2626" />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 15,
                  color: "#DC2626",
                  marginLeft: 6,
                }}
              >
                Refuza
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAccept}
              disabled={acting}
              style={{
                flex: 1,
                backgroundColor: "#10B981",
                borderRadius: 12,
                paddingVertical: 14,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CheckCircle size={18} color="#FFFFFF" />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 15,
                  color: "#FFFFFF",
                  marginLeft: 6,
                }}
              >
                Accepta
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setShowCounter(true)}
            style={{
              backgroundColor: "#3B82F6",
              borderRadius: 12,
              paddingVertical: 14,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MessageCircle size={18} color="#FFFFFF" />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 15,
                color: "#FFFFFF",
                marginLeft: 6,
              }}
            >
              Contra-oferta
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
