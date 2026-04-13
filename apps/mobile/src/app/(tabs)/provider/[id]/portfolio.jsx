import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Share,
  PanResponder,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  X,
  Share2,
} from "lucide-react-native";
import { Image } from "expo-image";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { colors } from "@/theme/colors";
import { providersApi } from "@/api";
import { mapPortfolioItem } from "@/utils/mapProviderData";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_COLUMNS = 2;
const ITEM_MARGIN = 8;
const ITEM_WIDTH = (SCREEN_WIDTH - 32 - ITEM_MARGIN * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

const FILTERS = [
  { id: "all", label: "Toate" },
  { id: "montaj", label: "Montaj" },
  { id: "reparatii", label: "Reparatii" },
  { id: "instalatii", label: "Instalatii" },
  { id: "inainte-dupa", label: "Inainte / Dupa" },
];

export default function PortfolioGalleryScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    loadPortfolio();
  }, [id]);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      // First fetch the provider to get user_id
      const profile = await providersApi.getProvider(id);
      const userId = profile.user_id;

      const data = await providersApi.getPortfolio(userId);
      const items = (Array.isArray(data) ? data : []).map(mapPortfolioItem);

      if (items.length > 0) {
        setPortfolio(items);
      } else {
        // Empty state — keep empty array
        setPortfolio([]);
      }
    } catch (error) {
      console.error("Error loading portfolio:", error);
      setPortfolio([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPortfolio =
    selectedFilter === "all"
      ? portfolio
      : portfolio.filter((item) => item.category === selectedFilter);

  const handleImagePress = (index) => {
    setSelectedImageIndex(index);
  };

  const handleCloseViewer = () => {
    setSelectedImageIndex(null);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: "Vezi portofoliul acestui prestator",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
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
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Portofoliu</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
        >
            {FILTERS.map((filter) => (
            <TouchableOpacity
                key={filter.id}
                onPress={() => setSelectedFilter(filter.id)}
                style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive,
                ]}
                activeOpacity={0.7}
            >
                <Text
                style={[
                    styles.filterText,
                    selectedFilter === filter.id && styles.filterTextActive,
                ]}
                >
                {filter.label}
                </Text>
            </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
      {/* Gallery */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary.teal} />
        </View>
      ) : portfolio.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.text.primary, textAlign: "center", marginBottom: 8 }}>
            Portofoliu gol
          </Text>
          <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.text.secondary, textAlign: "center" }}>
            Acest prestator nu are inca imagini in portofoliu.
          </Text>
        </View>
      ) : (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridContainer}>
          {filteredPortfolio.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridItem}
              onPress={() => {
                const actualIndex = portfolio.findIndex((p) => p.id === item.id);
                handleImagePress(actualIndex);
              }}
              activeOpacity={0.8}
            >
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={{ width: "100%", aspectRatio: 1, borderRadius: 12 }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>
                    {item.service}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      )}

      {/* Fullscreen Photo Viewer */}
      {selectedImageIndex !== null && (
        <FullscreenPhotoViewer
          images={portfolio}
          initialIndex={selectedImageIndex}
          onClose={handleCloseViewer}
          onShare={handleShare}
        />
      )}
    </View>
  );
}

function FullscreenPhotoViewer({ images, initialIndex, onClose, onShare }) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(new Animated.Value(1));
  const [translateX, setTranslateX] = useState(new Animated.Value(0));

  const currentImage = images[currentIndex];

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      scale.setOffset(scale._value);
      translateX.setOffset(translateX._value);
    },
    onPanResponderMove: (evt, gestureState) => {
      if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
        // Horizontal swipe
        translateX.setValue(gestureState.dx);
      } else {
        // Vertical pinch/zoom
        const newScale = Math.max(1, 1 + gestureState.dy / 200);
        scale.setValue(newScale);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      scale.flattenOffset();
      translateX.flattenOffset();

      // Handle swipe to next/previous image
      if (Math.abs(gestureState.dx) > 50) {
        if (gestureState.dx > 0 && currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        } else if (gestureState.dx < 0 && currentIndex < images.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
        translateX.setValue(0);
      }

      // Reset scale if too small
      if (scale._value < 1) {
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      scale.setValue(1);
      translateX.setValue(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      scale.setValue(1);
      translateX.setValue(0);
    }
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.viewerContainer, { paddingTop: insets.top }]}>
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={styles.viewerHeader}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.viewerCloseButton}
            activeOpacity={0.7}
          >
            <X size={24} color={colors.ui.white} />
          </TouchableOpacity>
          <Text style={styles.viewerTitle}>
            {currentIndex + 1} / {images.length}
          </Text>
          <TouchableOpacity
            onPress={onShare}
            style={styles.viewerShareButton}
            activeOpacity={0.7}
          >
            <Share2 size={20} color={colors.ui.white} />
          </TouchableOpacity>
        </View>

        {/* Image */}
        <View style={styles.viewerImageContainer} {...panResponder.panHandlers}>
          <Animated.View
            style={[
              styles.viewerImageWrapper,
              {
                transform: [
                  { scale: scale },
                  { translateX: translateX },
                ],
              },
            ]}
          >
            {currentImage?.image ? (
              <Image
                source={{ uri: currentImage.image }}
                style={{ width: "90%", height: "90%", borderRadius: 12 }}
                contentFit="contain"
                transition={200}
              />
            ) : (
              <View style={styles.viewerImagePlaceholder}>
                <Text style={styles.viewerImagePlaceholderText}>
                  {currentImage?.service || "Image"}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <TouchableOpacity
              style={[styles.navArrow, styles.navArrowLeft]}
              onPress={handlePrevious}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color={colors.ui.white} />
            </TouchableOpacity>
          )}
          {currentIndex < images.length - 1 && (
            <TouchableOpacity
              style={[styles.navArrow, styles.navArrowRight]}
              onPress={handleNext}
              activeOpacity={0.7}
            >
              <ArrowRight size={24} color={colors.ui.white} />
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        {currentImage?.description && (
          <View style={styles.viewerDescription}>
            <Text style={styles.viewerDescriptionText}>
              {currentImage.description}
            </Text>
          </View>
        )}
      </View>
    </Modal>
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
    paddingVertical: 16,
    backgroundColor: 'colors.background.primary,'
  },
  backButton: {
    padding: 4,
    marginRight: 12,
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
  filtersContainer: {
    backgroundColor: colors.background.primary,
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 2,
    paddingRight: 16,
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.background.primary,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
    justifyContent: "center",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: colors.primary.teal,
    borderColor: colors.primary.teal,
  },
  filterText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: colors.text.primary,
    lineHeight: 14,
  },
  filterTextActive: {
    color: colors.ui.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -ITEM_MARGIN / 2,
  },
  gridItem: {
    width: ITEM_WIDTH,
    margin: ITEM_MARGIN / 2,
    marginBottom: ITEM_MARGIN,
  },
  imagePlaceholder: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[200],
  },
  imagePlaceholderText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: colors.text.secondary,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
  },
  viewerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  viewerCloseButton: {
    padding: 4,
  },
  viewerTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: colors.ui.white,
  },
  viewerShareButton: {
    padding: 4,
  },
  viewerImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  viewerImageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  viewerImagePlaceholder: {
    width: "90%",
    height: "90%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[700],
    borderRadius: 12,
  },
  viewerImagePlaceholderText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: colors.ui.white,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  navArrow: {
    position: "absolute",
    top: "50%",
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 24,
  },
  navArrowLeft: {
    left: 16,
  },
  navArrowRight: {
    right: 16,
  },
  viewerDescription: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  viewerDescriptionText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.ui.white,
    textAlign: "center",
  },
});

