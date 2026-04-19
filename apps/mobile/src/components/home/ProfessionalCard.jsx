import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Star, MapPin, ChevronRight, CheckCircle2 } from "lucide-react-native";
import { colors } from "@/theme/colors";

export default function ProfessionalCard({
  id,
  name,
  profession,
  rating,
  reviewCount,
  distance,
  price,
  avatarColor,
  isOnline = false,
  isRecommended = false,
  variant = "horizontal", // "horizontal" or "list"
  onPress,
}) {
  const getInitials = (name) => {
    // For horizontal variant, show only first initial
    if (variant === "horizontal") {
      return name.split(" ")[0][0].toUpperCase();
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (variant === "list") {
    return (
      <TouchableOpacity
        style={styles.listContainer}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.listContent}>
          <View style={styles.avatarContainer}>
            <View style={[styles.listAvatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.listAvatarText}>{getInitials(name)}</Text>
            </View>
            {isOnline && (
              <View style={styles.onlineIndicator}>
                <CheckCircle2 size={16} color={colors.ui.white} fill={colors.primary.teal} />
              </View>
            )}
          </View>
          
          <View style={styles.listInfo}>
            <Text style={styles.listName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.listProfession} numberOfLines={1}>
              {profession}
            </Text>
            
            <View style={styles.listMetaRow}>
              <View style={styles.ratingContainer}>
                <Star size={14} color={colors.semantic.star} fill={colors.semantic.star} />
                <Text style={styles.listRatingText}>
                  {rating} {reviewCount && `(${reviewCount})`}
                </Text>
              </View>
              
              <View style={styles.separator} />
              
              <View style={styles.distanceContainer}>
                <MapPin size={12} color={colors.gray[400]} />
                <Text style={styles.listDistanceText}>{distance}</Text>
              </View>
              
              {price && (
                <>
                  <View style={styles.separator} />
                  <Text style={styles.listPriceText}>{price}</Text>
                </>
              )}
            </View>
          </View>
        </View>
        
        <ChevronRight size={20} color={colors.gray[400]} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top section: Avatar and Text */}
      <View style={styles.topSection}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>
          {isOnline && (
            <View style={styles.onlineIndicator}>
              <CheckCircle2 size={16} color={colors.ui.white} fill={colors.primary.teal} />
            </View>
          )}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.professionText} numberOfLines={1}>
            {profession}
          </Text>
        </View>
      </View>
      
      {/* Middle section: Rating and Location */}
      <View style={styles.middleSection}>
        <View style={styles.ratingContainer}>
          <Star size={14} color={colors.semantic.star} fill={colors.semantic.star} />
          <Text style={styles.ratingText}>
            {rating}
          </Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.distanceContainer}>
          <MapPin size={12} color={colors.gray[400]} />
          <Text style={styles.distanceText}>{distance}</Text>
        </View>
      </View>
      
      {/* Bottom section: Recommended button */}
      {isRecommended && (
        <View style={styles.recommendedButton}>
          <Text style={styles.recommendedText}>Recomandat</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 250,
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topSection: {
    flexDirection: "row",
    marginBottom: 12,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: colors.ui.white,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: colors.background.primary,
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  professionText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.text.secondary,
  },
  middleSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.text.primary,
    marginLeft: 4,
  },
  separator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[400],
    marginHorizontal: 8,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  distanceText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.text.primary,
    marginLeft: 4,
  },
  recommendedButton: {
    backgroundColor: colors.status.successBg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  recommendedText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: colors.status.success,
  },
  listContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  listContent: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  listAvatar: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  listAvatarText: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: colors.ui.white,
  },
  listInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  listName: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  listProfession: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.text.secondary,
    marginBottom: 8,
  },
  listMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  listRatingText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: colors.text.primary,
    marginLeft: 4,
  },
  listDistanceText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: colors.text.primary,
    marginLeft: 4,
  },
  listPriceText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: colors.primary.teal,
  },
});

