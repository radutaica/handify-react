import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";

export default function QuickActionButton({
  icon: Icon,
  label,
  onPress,
  variant = "primary", // primary, secondary, outline
  iconColor,
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: colors.primary.teal,
          borderColor: "transparent",
          textColor: colors.ui.white,
        };
      case "secondary":
        return {
          backgroundColor: colors.accent.purple,
          borderColor: "transparent",
          textColor: colors.ui.white,
        };
      case "outline":
        return {
          backgroundColor: colors.background.primary,
          borderColor: colors.accent.amber,
          textColor: colors.text.primary,
        };
      default:
        return {
          backgroundColor: colors.primary.teal,
          borderColor: "transparent",
          textColor: colors.ui.white,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const finalIconColor = iconColor || variantStyles.textColor;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon size={24} color={finalIconColor} />
      <Text
        style={[styles.label, { color: variantStyles.textColor }]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginHorizontal: 6,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    marginTop: 8,
  },
});

