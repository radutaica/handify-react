import React, { useState } from "react";
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
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

const FAQ_ITEMS = [
  {
    question: "Cum creez o sarcina noua?",
    answer:
      'Apasa butonul "+" din tab-ul principal sau mergi la "Creeaza sarcina". Completeaza detaliile sarcinii, alege categoria, seteaza bugetul si locatia.',
  },
  {
    question: "Cum aleg un prestator?",
    answer:
      "Dupa publicarea sarcinii, prestatorii din zona ta vor trimite oferte. Poti vedea profilul, recenziile si pretul fiecaruia inainte de a accepta o oferta.",
  },
  {
    question: "Cum pot deveni prestator?",
    answer:
      'Mergi la Profil si apasa "Devino prestator". Completeaza informatiile necesare, alege categoriile in care vrei sa lucrezi si asteapta verificarea.',
  },
  {
    question: "Cum pot anula o sarcina?",
    answer:
      'Deschide sarcina din tab-ul "Rezervari" si apasa "Anuleaza sarcina". Anularea este gratuita daca sarcina nu a fost inca acceptata de un prestator.',
  },
  {
    question: "Cum las o recenzie?",
    answer:
      'Dupa finalizarea unei sarcini, butonul "Lasa o recenzie" va aparea pe pagina sarcinii. Poti acorda intre 1 si 5 stele si lasa un comentariu.',
  },
];

function FAQItem({ item, isDark }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      style={{
        backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: isDark ? "#2D2D2D" : "#E5E7EB",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 15,
            color: isDark ? "#FFFFFF" : "#111827",
            flex: 1,
            marginRight: 12,
          }}
        >
          {item.question}
        </Text>
        {expanded ? (
          <ChevronUp size={18} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
        ) : (
          <ChevronDown size={18} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
        )}
      </View>
      {expanded && (
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            color: isDark ? "#B3B3B3" : "#6B7280",
            marginTop: 12,
            lineHeight: 22,
          }}
        >
          {item.answer}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function HelpScreen() {
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
          Ajutor si suport
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
        {/* FAQ Section */}
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 13,
            color: isDark ? "#8F8F8F" : "#6B7280",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 12,
            paddingHorizontal: 4,
          }}
        >
          Intrebari frecvente
        </Text>

        {FAQ_ITEMS.map((item, index) => (
          <FAQItem key={index} item={item} isDark={isDark} />
        ))}

        {/* Contact Section */}
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 13,
            color: isDark ? "#8F8F8F" : "#6B7280",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 12,
            marginTop: 24,
            paddingHorizontal: 4,
          }}
        >
          Contacteaza-ne
        </Text>

        <TouchableOpacity
          onPress={() => Linking.openURL("mailto:support@handify.ro")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            borderRadius: 12,
            padding: 16,
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
            <Mail size={18} color="#3B82F6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 15,
                color: isDark ? "#FFFFFF" : "#111827",
              }}
            >
              Email
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: isDark ? "#8F8F8F" : "#6B7280",
              }}
            >
              support@handify.ro
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Linking.openURL("tel:+40700000000")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            borderRadius: 12,
            padding: 16,
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
            <Phone size={18} color="#10B981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 15,
                color: isDark ? "#FFFFFF" : "#111827",
              }}
            >
              Telefon
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: isDark ? "#8F8F8F" : "#6B7280",
              }}
            >
              +40 700 000 000
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
