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
  Calendar,
  ArrowRight,
  Phone,
  Truck,
  Tv,
  Package,
  TreePine,
  Paintbrush,
  Droplet,
  User,
  PartyPopper,
  Sofa,
  Warehouse,
  DoorOpen,
  Building,
  Grid3X3,
  Dumbbell,
  Armchair,
  Move,
  Boxes,
  LayoutDashboard,
  DoorClosed,
  AppWindow,
  Circle,
  Image,
  Blinds,
  Smartphone,
  ShoppingCart,
  Store,
  Heart,
  Flower2,
  Leaf,
  Snowflake,
  Brush,
  Lightbulb,
  Plug,
  Fan,
  ToggleLeft,
  Bath,
  Flame,
  PersonStanding,
  Clock,
  Folder,
  Dog,
  UtensilsCrossed,
  Wine,
} from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { colors } from "@/theme/colors";
import AppIcon from "@/components/AppIcon";
import SearchBar from "@/components/home/SearchBar";
import CategoryCard from "@/components/home/CategoryCard";
import ProfessionalCard from "@/components/home/ProfessionalCard";
import ReviewCard from "@/components/home/ReviewCard";
import QuickActionButton from "@/components/home/QuickActionButton";
import DiscountOfferCard from "@/components/home/DiscountOfferCard";
import SectionHeader from "@/components/home/SectionHeader";
import { providersApi } from "@/api";
import { mapProviderToCard } from "@/utils/mapProviderData";

export default function HomePage() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [recommendedProviders, setRecommendedProviders] = useState([]);
  const [popularProfessionals, setPopularProfessionals] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    loadCategories();
    loadRecommendedProviders();
    loadPopularProfessionals();
    loadReviews();
  }, []);

  const loadCategories = async () => {
    try {
      const { categoriesApi } = await import("@/api");
      const data = await categoriesApi.getCategories();
      
      const iconMap = {
        // Original mappings
        Car: Car,
        Wrench: Wrench,
        Zap: Zap,
        Scissors: Scissors,
        Home: HomeIcon,
        Laptop: Laptop,
        Sparkles: Sparkles,
        // Material Icons → Lucide mappings
        cleaning: Sparkles,
        cleaning_services: Sparkles,
        build: Wrench,
        local_shipping: Truck,
        handyman: Wrench,
        tv: Tv,
        delivery: Package,
        grass: TreePine,
        format_paint: Paintbrush,
        electrical_services: Zap,
        plumbing: Droplet,
        person: User,
        celebration: PartyPopper,
        home: HomeIcon,
        door_front: DoorOpen,
        business: Building,
        texture: Grid3X3,
        chair: Armchair,
        shelves: Warehouse,
        fitness_center: Dumbbell,
        deck: Sofa,
        move: Move,
        inventory: Boxes,
        warehouse: Warehouse,
        dashboard: LayoutDashboard,
        door_sliding: DoorClosed,
        window: AppWindow,
        opacity: Circle,
        panorama: Image,
        blinds: Blinds,
        smart_home: Smartphone,
        shopping_cart: ShoppingCart,
        store: Store,
        volunteer_activism: Heart,
        local_florist: Flower2,
        eco: Leaf,
        ac_unit: Snowflake,
        content_cut: Scissors,
        house: HomeIcon,
        kitchen: UtensilsCrossed,
        brush: Brush,
        light: Lightbulb,
        power: Plug,
        air: Fan,
        toggle_on: ToggleLeft,
        water_drop: Droplet,
        wc: Bath,
        hot_tub: Flame,
        directions_run: PersonStanding,
        schedule: Clock,
        folder: Folder,
        pets: Dog,
        event: Calendar,
        room_service: UtensilsCrossed,
        local_bar: Wine,
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
      // Fallback categories matching the screenshot
      setCategories([
        { icon: Car, name: "Auto", color: colors.primary.teal, id: "1" },
        { icon: Wrench, name: "Electrocasnice", color: colors.accent.amber, id: "2" },
        { icon: Zap, name: "Instalator", color: colors.accent.purple, id: "3" },
        { icon: Zap, name: "Electrician", color: colors.primary.teal, id: "4" },
        { icon: Scissors, name: "Beauty & Hairstyle", color: colors.accent.amber, id: "5" },
        { icon: Sparkles, name: "Curatenie", color: colors.accent.purple, id: "6" },
        { icon: Laptop, name: "IT & Device Repair", color: colors.primary.teal, id: "7" },
        { icon: HomeIcon, name: "Renovari", color: colors.accent.amber, id: "8" },
      ]);
    }
  };

  const loadRecommendedProviders = async () => {
    try {
      const response = await providersApi.getProviders({ highRated: true, perPage: 5, sort: 'rating' });
      const profiles = response.data || response;
      const mapped = (Array.isArray(profiles) ? profiles : []).map((p) => ({
        ...mapProviderToCard(p),
        isRecommended: true,
      }));
      setRecommendedProviders(mapped);
    } catch (error) {
      console.error("Error loading recommended providers:", error);
      setRecommendedProviders([]);
    }
  };

  const loadPopularProfessionals = async () => {
    try {
      const response = await providersApi.getProviders({ perPage: 6, sort: 'completed_tasks' });
      const profiles = response.data || response;
      const mapped = (Array.isArray(profiles) ? profiles : []).map(mapProviderToCard);
      setPopularProfessionals(mapped);
    } catch (error) {
      console.error("Error loading popular professionals:", error);
      setPopularProfessionals([]);
    }
  };

  const loadReviews = async () => {
    // Mock data matching the screenshot
    setReviews([
      {
        id: "1",
        review: "Profesionist, punctual şi preţuri corecte. Recomand!",
        authorName: "Ana P.",
        service: "Instalatii",
        rating: 5,
        avatarColor: colors.primary.teal,
      },
      {
        id: "2",
        review: "A rezolvat problema rapid si eficient. Foarte multumit!",
        authorName: "George M.",
        service: "Electrician",
        rating: 5,
        avatarColor: colors.accent.purple,
      },
    ]);
  };

  const handleSearch = () => {
    router.push({
      pathname: "/(tabs)/search",
      params: { query: searchQuery },
    });
  };

  const handleCategoryPress = (category) => {
    router.push({
      pathname: "/(tabs)/providers",
      params: { category: category.name, categoryId: category.id },
    });
  };

  const handleProviderPress = (provider) => {
    router.push(`/(tabs)/provider/${provider.id}`);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case "quick-booking":
        router.push("/(tabs)/service-request");
        break;
      case "request-offer":
        router.push("/(tabs)/service-request");
        break;
      case "urgent-help":
        // TODO: Implement urgent help
        console.log("Urgent help");
        break;
      default:
        break;
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <AppIcon size={32} iconSize={18} borderRadius={8} />
            <Text style={styles.logoText}>ServiceHub</Text>
          </View>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.searchTitle}>Ce serviciu cauti?</Text>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          
          {/* Quick Action Buttons */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionButtons}
          >
            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: "#D1FAE5" }]}
              onPress={() => handleCategoryPress({ name: "Reparatii auto" })}
            >
              <Text style={[styles.quickActionText, { color: colors.text.primary }]}>
                Reparatii auto
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: "#FED7AA" }]}
              onPress={() => handleCategoryPress({ name: "Instalator urgent" })}
            >
              <Text style={[styles.quickActionText, { color: colors.text.primary }]}>
                Instalator urgent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: "#E9D5FF" }]}
              onPress={() => handleCategoryPress({ name: "Frizerie / Hairstyle" })}
            >
              <Text style={[styles.quickActionText, { color: colors.text.primary }]}>
                Frizerie / Hairstyle
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Categorii"
            showViewAll
            onViewAllPress={() => router.push("/(tabs)/categories")}
          />
          <View style={styles.categoriesGrid}>
            {categories.slice(0, 8).map((category) => (
              <CategoryCard
                key={category.id}
                icon={category.icon}
                name={category.name}
                color={category.color}
                onPress={() => handleCategoryPress(category)}
              />
            ))}
          </View>
        </View>

        {/* Recommended Section */}
        <View style={styles.section}>
          <SectionHeader title="Recomandate pentru tine" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {recommendedProviders.map((provider) => (
              <ProfessionalCard
                key={provider.id}
                {...provider}
                onPress={() => handleProviderPress(provider)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Popular Professionals Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Profesionisti populari"
            showViewAll
            viewAllText="Mai multi"
            onViewAllPress={() => router.push("/(tabs)/search")}
          />
          {popularProfessionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              {...professional}
              variant="list"
              onPress={() => handleProviderPress(professional)}
            />
          ))}
        </View>

        {/* Discount Offer */}
        <View style={styles.section}>
          <DiscountOfferCard
            title="20% reducere la prima comanda"
            subtitle="Pentru servicii de curatenie si renovari"
            onPress={() => console.log("Discount offer pressed")}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <SectionHeader title="Actiuni rapide" />
          <View style={styles.quickActionsRow}>
            <QuickActionButton
              icon={Calendar}
              label="Rezervare rapida"
              variant="primary"
              onPress={() => handleQuickAction("quick-booking")}
            />
            <QuickActionButton
              icon={ArrowRight}
              label="Solicita oferta"
              variant="secondary"
              onPress={() => handleQuickAction("request-offer")}
            />
            <QuickActionButton
              icon={Phone}
              label="Ajutor urgent"
              variant="outline"
              iconColor={colors.accent.amber}
              onPress={() => handleQuickAction("urgent-help")}
            />
          </View>
        </View>

        {/* Customer Reviews */}
        <View style={styles.section}>
          <SectionHeader title="Ce spun clientii" />
          {reviews.map((review) => (
            <ReviewCard key={review.id} {...review} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: colors.text.primary,
    marginLeft: 8,
  },
  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  loginText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: colors.gray[500],
  },
  searchSection: {
    marginBottom: 24,
  },
  searchTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: colors.text.primary,
    marginBottom: 16,
  },
  quickActionButtons: {
    flexDirection: "row",
    marginTop: 12,
    paddingRight: 16,
    gap: 8,
  },
  quickActionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  section: {
    marginBottom: 32,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  horizontalScroll: {
    paddingRight: 16,
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
