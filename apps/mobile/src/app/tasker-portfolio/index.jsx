import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useFocusEffect } from "expo-router";
import { useCurrentUser } from "@/utils/auth";
import { portfolioApi } from "@/api";
import { ChevronLeft, Plus, Image as ImageIcon } from "lucide-react-native";
import { Image } from "expo-image";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function TaskerPortfolioScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { taskerProfile } = useCurrentUser();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  const loadItems = useCallback(async () => {
    try {
      const response = await portfolioApi.getPortfolioItems({
        tasker_id: taskerProfile?.id,
      });
      const data = response.data?.portfolio_items || response.data || response || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading portfolio:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [taskerProfile?.id]);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  const renderItem = ({ item, index }) => {
    const imageUrl = item.images?.[0] || null;
    const isLeft = index % 2 === 0;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/tasker-portfolio/${item.id}`)}
        style={{
          flex: 1,
          marginLeft: isLeft ? 0 : 6,
          marginRight: isLeft ? 6 : 0,
          marginBottom: 12,
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
          borderWidth: 1,
          borderColor: isDark ? "#2D2D2D" : "#E5E7EB",
        }}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: "100%", height: 160 }}
            contentFit="cover"
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: 160,
              backgroundColor: isDark ? "#2D2D2D" : "#F3F4F6",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ImageIcon size={32} color={isDark ? "#4B5563" : "#D1D5DB"} />
          </View>
        )}
        <View style={{ padding: 12 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 14,
              color: isDark ? "#FFFFFF" : "#111827",
            }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {item.category?.name && (
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                color: isDark ? "#8F8F8F" : "#6B7280",
                marginTop: 4,
              }}
              numberOfLines={1}
            >
              {item.category.name}
            </Text>
          )}
          {item.is_featured && (
            <View
              style={{
                backgroundColor: "#F59E0B",
                borderRadius: 4,
                paddingHorizontal: 6,
                paddingVertical: 2,
                alignSelf: "flex-start",
                marginTop: 6,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 10,
                  color: "#FFFFFF",
                }}
              >
                FEATURED
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
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
          Portofoliu
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/tasker-portfolio/new")}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#3B82F6",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Plus size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 20,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View
              style={{
                alignItems: "center",
                paddingVertical: 60,
              }}
            >
              <ImageIcon size={48} color={isDark ? "#4B5563" : "#D1D5DB"} />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: isDark ? "#FFFFFF" : "#111827",
                  marginTop: 16,
                }}
              >
                Niciun proiect inca
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: isDark ? "#8F8F8F" : "#6B7280",
                  textAlign: "center",
                  marginTop: 8,
                  paddingHorizontal: 32,
                }}
              >
                Adauga primul tau proiect pentru a atrage mai multi clienti.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/tasker-portfolio/new")}
                style={{
                  backgroundColor: "#3B82F6",
                  borderRadius: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 24,
                  marginTop: 20,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 15,
                    color: "#FFFFFF",
                  }}
                >
                  Adauga proiect
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}
