import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles } from "lucide-react-native";
import { colors } from "@/theme/colors";

/**
 * Reusable App Icon Component
 * 
 * @param {number} size - Size of the icon container (default: 100)
 * @param {number} iconSize - Size of the sparkles icon (default: 40)
 * @param {string} borderRadius - Border radius of the container (default: 24)
 */
export default function AppIcon({ 
  size = 100, 
  iconSize = 40, 
  borderRadius = 24 
}) {
  return (
    <LinearGradient
      colors={colors.primary.gradient}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
      style={[
        styles.iconContainer,
        {
          width: size,
          height: size,
          borderRadius: borderRadius,
        },
      ]}
    >
      <Sparkles 
        size={iconSize} 
        color={colors.ui.white} 
        strokeWidth={2.5} 
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

