import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { reviewsApi } from "@/api";
import { ChevronLeft, Star } from "lucide-react-native";
import { Image } from "expo-image";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

const TAGS = [
  "Punctual",
  "Profesionist",
  "Comunicare buna",
  "Calitate",
  "Pret corect",
];

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { id: taskId, revieweeId, revieweeName, revieweeImage } =
    useLocalSearchParams();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0 || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const data = {
        task_id: taskId,
        rating,
        comment: comment.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      };

      await reviewsApi.submitReview(data);
      Alert.alert("Multumim!", "Recenzia ta a fost trimisa cu succes.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err.message || "Nu am putut trimite recenzia. Incearca din nou.");
    } finally {
      setSubmitting(false);
    }
  };

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
          Lasa o recenzie
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Reviewee Card */}
        <View
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: isDark ? "#2D2D2D" : "#E5E7EB",
            alignItems: "center",
          }}
        >
          {revieweeImage ? (
            <Image
              source={{ uri: revieweeImage }}
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                marginBottom: 12,
              }}
              contentFit="cover"
              transition={100}
            />
          ) : (
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: isDark ? "#3D3D3D" : "#E5E7EB",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 28,
                  color: isDark ? "#FFFFFF" : "#6B7280",
                }}
              >
                {revieweeName?.[0]?.toUpperCase() || "?"}
              </Text>
            </View>
          )}
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: isDark ? "#FFFFFF" : "#111827",
            }}
          >
            {revieweeName || "Prestator"}
          </Text>
        </View>

        {/* Star Rating */}
        <View
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: isDark ? "#2D2D2D" : "#E5E7EB",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              color: isDark ? "#FFFFFF" : "#111827",
              marginBottom: 16,
            }}
          >
            Cum a fost experienta?
          </Text>

          <View style={{ flexDirection: "row", gap: 12 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={{ padding: 4 }}
              >
                <Star
                  size={40}
                  color="#F59E0B"
                  fill={star <= rating ? "#F59E0B" : "transparent"}
                  strokeWidth={star <= rating ? 0 : 1.5}
                />
              </TouchableOpacity>
            ))}
          </View>

          {rating > 0 && (
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: isDark ? "#B3B3B3" : "#6B7280",
                marginTop: 12,
              }}
            >
              {rating === 1
                ? "Slab"
                : rating === 2
                  ? "Acceptabil"
                  : rating === 3
                    ? "Bun"
                    : rating === 4
                      ? "Foarte bun"
                      : "Excelent"}
            </Text>
          )}
        </View>

        {/* Tags */}
        <View
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: isDark ? "#2D2D2D" : "#E5E7EB",
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 14,
              color: isDark ? "#8F8F8F" : "#6B7280",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Ce ti-a placut? (optional)
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={{
                    backgroundColor: isSelected
                      ? "#3B82F6"
                      : isDark
                        ? "#2D2D2D"
                        : "#F3F4F6",
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                      color: isSelected
                        ? "#FFFFFF"
                        : isDark
                          ? "#B3B3B3"
                          : "#374151",
                    }}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Comment */}
        <View
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: isDark ? "#2D2D2D" : "#E5E7EB",
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 14,
              color: isDark ? "#8F8F8F" : "#6B7280",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Comentariu (optional)
          </Text>

          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Spune-ne mai multe despre experienta ta..."
            placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
            multiline
            maxLength={1000}
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              color: isDark ? "#FFFFFF" : "#111827",
              backgroundColor: isDark ? "#2D2D2D" : "#F9FAFB",
              borderRadius: 12,
              padding: 16,
              minHeight: 120,
              textAlignVertical: "top",
            }}
          />
        </View>

        {/* Error */}
        {error && (
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: "#EF4444",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            {error}
          </Text>
        )}
      </ScrollView>

      {/* Submit Button */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: isDark ? "#121212" : "#FFFFFF",
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
          borderTopWidth: 1,
          borderTopColor: isDark ? "#2D2D2D" : "#E5E7EB",
        }}
      >
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={rating === 0 || submitting}
          style={{
            backgroundColor:
              rating > 0 && !submitting ? "#3B82F6" : isDark ? "#2D2D2D" : "#E5E7EB",
            borderRadius: 12,
            paddingVertical: 16,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            opacity: rating === 0 || submitting ? 0.6 : 1,
          }}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Star size={20} color={rating > 0 ? "#FFFFFF" : isDark ? "#8F8F8F" : "#9CA3AF"} />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: rating > 0 ? "#FFFFFF" : isDark ? "#8F8F8F" : "#9CA3AF",
                  marginLeft: 8,
                }}
              >
                Trimite recenzia
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
