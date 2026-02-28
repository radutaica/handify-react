import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useCurrentUser } from "@/utils/auth";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Eye,
  Download,
  Trash2,
  Key,
} from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

function SettingsItem({ icon: Icon, title, subtitle, onPress, isDark, danger }) {
  const iconColor = danger ? "#EF4444" : isDark ? "#FFFFFF" : "#374151";
  const titleColor = danger ? "#EF4444" : isDark ? "#FFFFFF" : "#111827";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: danger
          ? isDark
            ? "#2D1B1B"
            : "#FEF2F2"
          : isDark
            ? "#1E1E1E"
            : "#FFFFFF",
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: danger
          ? isDark
            ? "#7F1D1D"
            : "#FECACA"
          : isDark
            ? "#2D2D2D"
            : "#E5E7EB",
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: danger
            ? "#EF444420"
            : isDark
              ? "#2D2D2D"
              : "#F3F4F6",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        <Icon size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 15,
            color: titleColor,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              color: isDark ? "#8F8F8F" : "#9CA3AF",
              marginTop: 2,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {onPress && (
        <ChevronRight
          size={18}
          color={danger ? "#EF4444" : isDark ? "#8F8F8F" : "#9CA3AF"}
        />
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

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useCurrentUser();

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  const handleChangePassword = () => {
    Alert.alert(
      "Schimba parola",
      "Vei primi un email cu instructiuni pentru schimbarea parolei.",
      [
        { text: "Anuleaza", style: "cancel" },
        {
          text: "Trimite email",
          onPress: () => {
            Alert.alert("Succes", "Email-ul a fost trimis!");
          },
        },
      ]
    );
  };

  const handleDataExport = () => {
    Alert.alert(
      "Export date",
      "Vrei sa soliciti un export al datelor tale personale? Vei primi un email cu un link de descarcare.",
      [
        { text: "Anuleaza", style: "cancel" },
        {
          text: "Solicita export",
          onPress: () => {
            Alert.alert(
              "Solicitare trimisa",
              "Vei primi un email cu datele tale in cel mult 48 de ore."
            );
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Sterge contul",
      "Esti sigur ca vrei sa stergi contul? Aceasta actiune este ireversibila si toate datele tale vor fi sterse permanent.",
      [
        { text: "Anuleaza", style: "cancel" },
        {
          text: "Sterge contul",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Solicitare trimisa",
              "Cererea de stergere a fost inregistrata. Contul tau va fi sters in 30 de zile."
            );
          },
        },
      ]
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
          Confidentialitate si securitate
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
        <SectionTitle title="Securitate" isDark={isDark} />
        <SettingsItem
          icon={Key}
          title="Schimba parola"
          subtitle="Actualizeaza parola contului tau"
          onPress={handleChangePassword}
          isDark={isDark}
        />
        <SettingsItem
          icon={Lock}
          title="Autentificare in doi pasi"
          subtitle="In curand"
          isDark={isDark}
        />

        <SectionTitle title="Date personale (GDPR)" isDark={isDark} />
        <SettingsItem
          icon={Download}
          title="Exporta datele mele"
          subtitle="Descarca o copie a datelor tale personale"
          onPress={handleDataExport}
          isDark={isDark}
        />
        <SettingsItem
          icon={Eye}
          title="Vizibilitate profil"
          subtitle="Profilul tau este vizibil public"
          isDark={isDark}
        />

        <SectionTitle title="Cont" isDark={isDark} />
        <SettingsItem
          icon={Trash2}
          title="Sterge contul"
          subtitle="Sterge permanent contul si toate datele asociate"
          onPress={handleDeleteAccount}
          isDark={isDark}
          danger
        />
      </ScrollView>
    </View>
  );
}
