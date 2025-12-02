import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Star, Quote } from "lucide-react-native";
import { colors } from "@/theme/colors";

export default function ReviewCard({ 
  review, 
  authorName, 
  service, 
  rating = 5,
  avatarColor 
}) {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 1);
  };

  return (
    <View style={styles.container}>
      <Quote size={32} color={colors.accent.purple} style={styles.quoteIcon} />
      <Text style={styles.reviewText}>{review}</Text>
      <View style={styles.footer}>
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{getInitials(authorName)}</Text>
        </View>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{authorName}</Text>
          <Text style={styles.service}>{service}</Text>
        </View>
        <View style={styles.stars}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={16}
              color={colors.semantic.star}
              fill={i < rating ? colors.semantic.star : "transparent"}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  quoteIcon: {
    marginBottom: 12,
    opacity: 0.3,
  },
  reviewText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: colors.ui.white,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: colors.text.primary,
    marginBottom: 2,
  },
  service: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: colors.gray[400],
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
});

