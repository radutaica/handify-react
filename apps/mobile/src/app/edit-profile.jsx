import React, { useState } from "react";
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
import { router } from "expo-router";
import { useCurrentUser } from "@/utils/auth";
import { profileApi } from "@/api";
import { ChevronLeft, Camera } from "lucide-react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user, refetchUser } = useCurrentUser();

  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profileImageUrl, setProfileImageUrl] = useState(
    user?.profile_image_url || ""
  );
  const [saving, setSaving] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      setProfileImageUrl(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      await profileApi.updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || undefined,
        profile_image_url: profileImageUrl || undefined,
      });
      await refetchUser();
      router.back();
    } catch (err) {
      console.error("Error updating profile:", err);
      Alert.alert(
        "Eroare",
        err.message || "Nu am putut salva profilul. Incearca din nou."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!fontsLoaded) return null;

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

  const labelStyle = {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: isDark ? "#B3B3B3" : "#374151",
    marginBottom: 8,
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
          Editeaza profilul
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar Section */}
        <View
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: isDark ? "#2D2D2D" : "#E5E7EB",
            alignItems: "center",
          }}
        >
          <TouchableOpacity onPress={handlePickImage} style={{ position: "relative" }}>
            {profileImageUrl ? (
              <Image
                source={{ uri: profileImageUrl }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                }}
                contentFit="cover"
              />
            ) : (
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: "#3B82F6",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 36,
                    color: "#FFFFFF",
                  }}
                >
                  {firstName?.[0]?.toUpperCase() || "?"}
                </Text>
              </View>
            )}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#3B82F6",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: isDark ? "#1E1E1E" : "#FFFFFF",
              }}
            >
              <Camera size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: isDark ? "#8F8F8F" : "#6B7280",
              marginTop: 12,
            }}
          >
            Apasa pentru a schimba fotografia
          </Text>
        </View>

        {/* Personal Info */}
        <View
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: isDark ? "#2D2D2D" : "#E5E7EB",
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 14,
              color: isDark ? "#8F8F8F" : "#6B7280",
              marginBottom: 16,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Informatii personale
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={labelStyle}>Prenume</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Prenumele tau"
              placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
              style={inputStyle}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={labelStyle}>Nume</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Numele tau"
              placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
              style={inputStyle}
            />
          </View>

          <View>
            <Text style={labelStyle}>Telefon</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Numarul de telefon"
              placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
              keyboardType="phone-pad"
              style={inputStyle}
            />
          </View>
        </View>

        {/* Email (read-only) */}
        <View
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: isDark ? "#2D2D2D" : "#E5E7EB",
          }}
        >
          <Text style={labelStyle}>Email</Text>
          <View
            style={{
              ...inputStyle,
              backgroundColor: isDark ? "#1A1A1A" : "#F3F4F6",
              opacity: 0.7,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 15,
                color: isDark ? "#8F8F8F" : "#6B7280",
              }}
            >
              {user?.email || ""}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
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
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{
            backgroundColor: "#3B82F6",
            borderRadius: 12,
            paddingVertical: 16,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: "#FFFFFF",
              }}
            >
              Salveaza
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
