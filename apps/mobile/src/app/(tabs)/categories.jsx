import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import {
  Car,
  Wrench,
  Zap,
  Scissors,
  Sparkles,
  Laptop,
  Home as HomeIcon,
  ArrowLeft,
} from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { colors } from "@/theme/colors";
import SearchBar from "@/components/home/SearchBar";
import CategoryCard from "@/components/home/CategoryCard";

export default function CategoriesPage() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [searchQuery, categories]);

  const loadCategories = async () => {
    try {
      const { categoriesApi } = await import("@/api");
      const data = await categoriesApi.getCategories();
      
      const iconMap = {
        Car: Car,
        Wrench: Wrench,
        Zap: Zap,
        Scissors: Scissors,
        Home: HomeIcon,
        Laptop: Laptop,
        Sparkles: Sparkles,
      };

      const transformedCategories = data.map((category) => ({
        icon: iconMap[category.iconName] || Wrench,
        name: category.name,
        color: category.color || colors.primary.teal,
        id: category.id,
      }));

      setCategories(transformedCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
      // Fallback categories
      setCategories([
        { icon: Car, name: "Auto", color: colors.primary.teal, id: "1" },
        { icon: Wrench, name: "Electrocasnice", color: colors.accent.amber, id: "2" },
        { icon: Zap, name: "Instalator", color: colors.accent.purple, id: "3" },
        { icon: Zap, name: "Electrician", color: colors.primary.teal, id: "4" },
        { icon: Scissors, name: "Beauty & Hairstyle", color: colors.accent.amber, id: "5" },
        { icon: Sparkles, name: "Curatenie", color: colors.accent.purple, id: "6" },
        { icon: Laptop, name: "IT & Device Repair", color: colors.primary.teal, id: "7" },
        { icon: HomeIcon, name: "Renovari", color: colors.accent.amber, id: "8" },
        { icon: Car, name: "Reparatii Auto", color: colors.primary.teal, id: "9" },
        { icon: Wrench, name: "Reparatii Electrocasnice", color: colors.accent.amber, id: "10" },
        { icon: Zap, name: "Instalatii Electrice", color: colors.accent.purple, id: "11" },
        { icon: Scissors, name: "Frizerie", color: colors.primary.teal, id: "12" },
        { icon: Sparkles, name: "Servicii de Curatenie", color: colors.accent.amber, id: "13" },
        { icon: Laptop, name: "Reparatii IT", color: colors.accent.purple, id: "14" },
        { icon: HomeIcon, name: "Renovari si Amenajari", color: colors.primary.teal, id: "15" },
        { icon: Wrench, name: "Instalatii Sanitare", color: colors.accent.amber, id: "16" },
      ]);
    }
  };

  const filterCategories = () => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(query)
    );
    setFilteredCategories(filtered);
  };

  const handleCategoryPress = (category) => {
    router.push({
      pathname: "/(tabs)/search",
      params: { category: category.name },
    });
  };

  const handleBackPress = () => {
    router.back();
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categorii</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Cauta o categorie..."
        />
      </View>

      {/* Categories Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filteredCategories.length > 0 ? (
          <>
            <Text style={styles.resultsText}>
              {filteredCategories.length} {filteredCategories.length === 1 ? "categorie" : "categorii"}
            </Text>
            <View style={styles.categoriesGrid}>
              {filteredCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  icon={category.icon}
                  name={category.name}
                  color={category.color}
                  onPress={() => handleCategoryPress(category)}
                />
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔍</Text>
            <Text style={styles.emptyStateTitle}>Nu s-au gasit categorii</Text>
            <Text style={styles.emptyStateText}>
              Incearca sa modifici termenii de cautare
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: colors.text.primary,
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  resultsText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.text.secondary,
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
});

