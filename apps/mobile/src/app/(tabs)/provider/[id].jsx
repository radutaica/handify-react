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
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Star,
  CheckCircle2,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Wrench,
  Droplets,
  Flame,
  Unplug,
} from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { colors } from "@/theme/colors";
import SectionHeader from "@/components/home/SectionHeader";

export default function ProviderProfileScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [provider, setProvider] = useState(null);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    loadProviderData();
  }, [id]);

  const loadProviderData = () => {
    // Mock data matching the design
    setProvider({
      id: id || "1",
      name: "Alexandru Ionescu",
      title: "Instalator Autorizat",
      rating: 4.9,
      reviewCount: 127,
      profileImage: null, // Will use initials
      isVerified: true,
      experience: "12+ ani experienta",
      availableToday: true,
      about: "Cu peste 12 ani de experienta in instalatii sanitare si termice, ofer servicii de calitate pentru case si apartamente. Lucrez rapid, curat si cu materiale de top.",
      location: "Bucuresti • Ilfov • pana la 30 km",
      responseTime: "Raspunde in ~15 min",
      services: [
        {
          id: 1,
          name: "Reparatii instalatii",
          description: "Robineti, tevi, scurgeri",
          price: "de la 80 lei",
          icon: Wrench,
          color: "#D1FAE5",
        },
        {
          id: 2,
          name: "Montaj sanitare",
          description: "Chiuveta, WC, cada, cabina dus",
          price: "de la 150 lei",
          icon: Droplets,
          color: "#FED7AA",
        },
        {
          id: 3,
          name: "Instalatii termice",
          description: "Calorifere, centrale termice",
          price: "de la 200 lei",
          icon: Flame,
          color: "#E9D5FF",
        },
        {
          id: 4,
          name: "Desfundare canalizare",
          description: "Interventie rapida",
          price: "de la 100 lei",
          icon: Unplug,
          color: "#D1FAE5",
        },
      ],
      portfolio: [
        { id: 1, image: null },
        { id: 2, image: null },
        { id: 3, image: null },
        { id: 4, image: null },
      ],
      reviews: {
        average: 4.9,
        total: 127,
        satisfiedPercentage: 98,
        items: [
          {
            id: 1,
            author: "Maria P.",
            rating: 5,
            text: "Foarte profesionist, a rezolvat rapid problema cu scurgerea. Recomand!",
            date: "acum 2 zile",
          },
          {
            id: 2,
            author: "Ion D.",
            rating: 5,
            text: "Excelent! Punctual si preturi corecte. Voi apela din nou.",
            date: "acum 1 saptamana",
          },
          {
            id: 3,
            author: "Elena C.",
            rating: 4,
            text: "Treaba buna, singura problema a fost ca a intarziat putin.",
            date: "acum 2 saptamani",
          },
        ],
      },
    });
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getReviewInitials = (name) => {
    return name.split(" ")[0][0].toUpperCase();
  };

  if (!fontsLoaded || !provider) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil Prestator</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Provider Info Card */}
        <View style={styles.providerCard}>
          <View style={styles.providerHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(provider.name)}
                </Text>
              </View>
              {provider.isVerified && (
                <View style={styles.verifiedBadge}>
                  <CheckCircle2
                    size={20}
                    color={colors.ui.white}
                    fill={colors.primary.green}
                  />
                </View>
              )}
            </View>

            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{provider.name}</Text>
              <Text style={styles.providerTitle}>{provider.title}</Text>
              <View style={styles.ratingRow}>
                <Star
                  size={16}
                  color={colors.semantic.star}
                  fill={colors.semantic.star}
                />
                <Text style={styles.ratingText}>{provider.rating}</Text>
                <Text style={styles.reviewCountText}>
                  ({provider.reviewCount} recenzii)
                </Text>
              </View>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {provider.isVerified && (
              <View style={[styles.tag, { backgroundColor: "#D1FAE5" }]}>
                <CheckCircle2 size={14} color={colors.primary.green} />
                <Text style={[styles.tagText, { color: colors.primary.green }]}>
                  Verificat
                </Text>
              </View>
            )}
            <View style={[styles.tag, { backgroundColor: "#FED7AA" }]}>
              <Star size={14} color={colors.accent.amber} />
              <Text style={[styles.tagText, { color: colors.accent.amber }]}>
                {provider.experience}
              </Text>
            </View>
            {provider.availableToday && (
              <View style={[styles.tag, { backgroundColor: "#E9D5FF" }]}>
                <Clock size={14} color={colors.accent.purple} />
                <Text style={[styles.tagText, { color: colors.accent.purple }]}>
                  Disponibil azi
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#D1FAE5" }]}
              activeOpacity={0.7}
            >
              <Phone size={18} color={colors.primary.green} />
              <Text style={[styles.actionButtonText, { color: colors.primary.green }]}>
                Suna
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#E9D5FF" }]}
              activeOpacity={0.7}
            >
              <MessageCircle size={18} color={colors.accent.purple} />
              <Text style={[styles.actionButtonText, { color: colors.accent.purple }]}>
                Mesaj
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Despre</Text>
          <Text style={styles.aboutText}>{provider.about}</Text>
          <View style={styles.infoRow}>
            <MapPin size={16} color={colors.primary.green} />
            <Text style={styles.infoText}>{provider.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={16} color={colors.accent.amber} />
            <Text style={styles.infoText}>{provider.responseTime}</Text>
          </View>
        </View>

        {/* Services Offered */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servicii oferite</Text>
          <View style={styles.servicesGrid}>
            {provider.services.map((service) => (
              <View
                key={service.id}
                style={[styles.serviceCard, { backgroundColor: service.color }]}
              >
                <service.icon size={24} color={colors.text.primary} />
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
                <Text style={styles.servicePrice}>{service.price}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Portfolio Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Portofoliu"
            showViewAll
            onViewAllPress={() => router.push(`/(tabs)/provider/${id}/portfolio`)}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.portfolioContainer}
          >
            {provider.portfolio.map((item) => (
              <View key={item.id} style={styles.portfolioItem}>
                <View style={styles.portfolioPlaceholder}>
                  <Text style={styles.portfolioPlaceholderText}>Image</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Recenzii"
            showViewAll
            onViewAllPress={() => console.log("View all reviews")}
          />

          {/* Reviews Overview */}
          <View style={styles.reviewsOverview}>
            <View style={styles.ratingDisplay}>
              <Text style={styles.ratingNumber}>{provider.reviews.average}</Text>
              <View style={styles.starsRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    color={colors.semantic.star}
                    fill={
                      i < Math.floor(provider.reviews.average)
                        ? colors.semantic.star
                        : i < provider.reviews.average
                        ? colors.semantic.star
                        : "transparent"
                    }
                  />
                ))}
              </View>
            </View>
            <View style={styles.reviewsStats}>
              <Text style={styles.reviewsCount}>
                {provider.reviews.total} recenzii
              </Text>
              <Text style={styles.satisfiedText}>
                {provider.reviews.satisfiedPercentage}% clienti multumiti
              </Text>
            </View>
          </View>

          {/* Individual Reviews */}
          {provider.reviews.items.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View
                  style={[
                    styles.reviewAvatar,
                    { backgroundColor: colors.accent.purple },
                  ]}
                >
                  <Text style={styles.reviewAvatarText}>
                    {getReviewInitials(review.author)}
                  </Text>
                </View>
                <View style={styles.reviewAuthorInfo}>
                  <Text style={styles.reviewAuthorName}>{review.author}</Text>
                  <View style={styles.reviewStars}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        color={colors.semantic.star}
                        fill={i < review.rating ? colors.semantic.star : "transparent"}
                      />
                    ))}
                  </View>
                </View>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
              <Text style={styles.reviewDate}>{review.date}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Button */}
      <View style={[styles.floatingButtonContainer, { bottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={styles.floatingButton}
          activeOpacity={0.8}
          onPress={() => console.log("Request offer")}
        >
          <Text style={styles.floatingButtonText}>Solicita Oferta</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.primary,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: colors.text.primary,
    textAlign: "center",
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  providerCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  providerHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: colors.ui.white,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.ui.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.ui.white,
  },
  providerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  providerName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  providerTitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.primary.teal,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: colors.text.primary,
    marginLeft: 4,
  },
  reviewCountText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.text.secondary,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  sectionCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: colors.text.primary,
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.text.primary,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  serviceCard: {
    width: "47%",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  serviceName: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: colors.text.primary,
  },
  serviceDescription: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: colors.text.secondary,
  },
  servicePrice: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: colors.primary.green,
    marginTop: 4,
  },
  portfolioContainer: {
    gap: 12,
    paddingRight: 16,
  },
  portfolioItem: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
  },
  portfolioPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.gray[200],
    alignItems: "center",
    justifyContent: "center",
  },
  portfolioPlaceholderText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: colors.text.secondary,
  },
  reviewsOverview: {
    backgroundColor: colors.gray[100],
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  ratingDisplay: {
    alignItems: "center",
  },
  ratingNumber: {
    fontSize: 48,
    fontFamily: "Inter_700Bold",
    color: colors.text.primary,
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: "row",
    gap: 4,
  },
  reviewsStats: {
    flex: 1,
  },
  reviewsCount: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  satisfiedText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.text.secondary,
  },
  reviewCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  reviewAvatarText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: colors.ui.white,
  },
  reviewAuthorInfo: {
    flex: 1,
  },
  reviewAuthorName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
  },
  reviewText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: colors.text.secondary,
  },
  floatingButtonContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
  },
  floatingButton: {
    backgroundColor: colors.primary.teal,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: colors.ui.white,
  },
});

