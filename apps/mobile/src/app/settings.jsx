import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Moon,
  Info,
  FileText,
  Shield,
} from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

function SettingsItem({ icon: Icon, title, value, onPress, isDark }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: isDark ? "#2D2D2D" : "#E5E7EB",
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: isDark ? "#2D2D2D" : "#F3F4F6",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        <Icon size={18} color={isDark ? "#FFFFFF" : "#374151"} />
      </View>
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 15,
          color: isDark ? "#FFFFFF" : "#111827",
          flex: 1,
        }}
      >
        {title}
      </Text>
      {value && (
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            color: isDark ? "#8F8F8F" : "#9CA3AF",
            marginRight: 8,
          }}
        >
          {value}
        </Text>
      )}
      {onPress && (
        <ChevronRight size={18} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
      )}
    </TouchableOpacity>
  );
}

function SectionTitle({ title, isDark }) {
  return (
    <Text
      style={{
        fontFamily: "Inter_600SemiBold",
        fontSize: 13,
        color: isDark ? "#8F8F8F" : "#6B7280",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 8,
        marginTop: 16,
        paddingHorizontal: 4,
      }}
    >
      {title}
    </Text>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

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
          Setari
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle title="Preferinte aplicatie" isDark={isDark} />
        <SettingsItem
          icon={Globe}
          title="Limba"
          value="Romana"
          isDark={isDark}
        />
        <SettingsItem
          icon={Moon}
          title="Mod intunecat"
          value="Automat (sistem)"
          isDark={isDark}
        />

        <SectionTitle title="Despre" isDark={isDark} />
        <SettingsItem
          icon={Info}
          title="Versiune aplicatie"
          value="Handify v1.0.0"
          isDark={isDark}
        />
        <SettingsItem
          icon={FileText}
          title="Termeni si conditii"
          onPress={() => Linking.openURL("https://handify.ro/terms")}
          isDark={isDark}
        />
        <SettingsItem
          icon={Shield}
          title="Politica de confidentialitate"
          onPress={() => Linking.openURL("https://handify.ro/privacy")}
          isDark={isDark}
        />
      </ScrollView>
    </View>
  );
}
