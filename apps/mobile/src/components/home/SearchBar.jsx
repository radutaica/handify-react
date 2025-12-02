import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Search } from "lucide-react-native";
import { colors } from "@/theme/colors";

export default function SearchBar({ 
  value, 
  onChangeText, 
  onSubmitEditing, 
  placeholder = "Caută un serviciu...",
}) {
  return (
    <View style={styles.container}>
      <Search size={18} color={colors.gray[400]} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.gray[400]}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: colors.text.primary,
    fontFamily: "Inter_400Regular",
  },
});

