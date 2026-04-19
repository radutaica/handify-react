import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useColorScheme,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { portfolioApi, categoriesApi } from "@/api";
import { ChevronLeft, Trash2, Plus, X } from "lucide-react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useUpload } from "@/utils/useUpload";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function PortfolioItemScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { id } = useLocalSearchParams();
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [images, setImages] = useState([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [upload, { loading: uploading }] = useUpload();

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    loadCategories();
    if (!isNew) loadItem();
  }, [id]);

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getCategories();
      const data = response.data?.categories || response.data || response || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const loadItem = async () => {
    try {
      const response = await portfolioApi.getPortfolioItems();
      const items = response.data?.portfolio_items || response.data || response || [];
      const item = (Array.isArray(items) ? items : []).find((i) => i.id === id);
      if (item) {
        setTitle(item.title || "");
        setDescription(item.description || "");
        setCategoryId(item.category_id || item.category?.id || null);
        setImages(item.images || []);
        setIsFeatured(item.is_featured || false);
      }
    } catch (err) {
      console.error("Error loading portfolio item:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      for (const asset of result.assets) {
        const uploadResult = await upload({ reactNativeAsset: asset });
        if (uploadResult.url) {
          setImages((prev) => [...prev, uploadResult.url]);
        } else {
          Alert.alert("Eroare", uploadResult.error || "Nu am putut incarca imaginea.");
        }
      }
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Eroare", "Titlul este obligatoriu.");
      return;
    }
    if (saving) return;
    setSaving(true);

    try {
      const data = {
        title: title.trim(),
        description: description.trim() || undefined,
        category_id: categoryId || undefined,
        images: images.length > 0 ? images : undefined,
        is_featured: isFeatured,
      };

      if (isNew) {
        await portfolioApi.createPortfolioItem(data);
      } else {
        await portfolioApi.updatePortfolioItem(id, data);
      }
      router.back();
    } catch (err) {
      console.error("Error saving portfolio item:", err);
      Alert.alert("Eroare", "Nu am putut salva proiectul.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Sterge proiect", "Esti sigur ca vrei sa stergi acest proiect?", [
      { text: "Anuleaza", style: "cancel" },
      {
        text: "Sterge",
        style: "destructive",
        onPress: async () => {
          try {
            await portfolioApi.deletePortfolioItem(id);
            router.back();
          } catch (err) {
            Alert.alert("Eroare", "Nu am putut sterge proiectul.");
          }
        },
      },
    ]);
  };

  if (!fontsLoaded || loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? "#121212" : "#F9FAFB",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const inputStyle = {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: isDark ? "#FFFFFF" : "#111827",
    backgroundColor: isDark ? "#2D2D2D" : "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: isDark ? "#3D3D3D" : "#E5E7EB",
  };

  const labelStyle = {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: isDark ? "#B3B3B3" : "#374151",
    marginBottom: 8,
  };

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
          {isNew ? "Proiect nou" : "Editeaza proiect"}
        </Text>

        {!isNew && (
          <TouchableOpacity onPress={handleDelete} style={{ padding: 8 }}>
            <Trash2 size={22} color="#EF4444" />
          </TouchableOpacity>
        )}
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
        {/* Images */}
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
          <Text style={labelStyle}>Imagini</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {images.map((uri, index) => (
                <View key={index} style={{ position: "relative" }}>
                  <Image
                    source={{ uri }}
                    style={{ width: 100, height: 100, borderRadius: 10 }}
                    contentFit="cover"
                  />
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(index)}
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: "#EF4444",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <X size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                onPress={handlePickImage}
                disabled={uploading}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 10,
                  backgroundColor: isDark ? "#2D2D2D" : "#F3F4F6",
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: isDark ? "#3D3D3D" : "#D1D5DB",
                  borderStyle: "dashed",
                  opacity: uploading ? 0.6 : 1,
                }}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={isDark ? "#8F8F8F" : "#9CA3AF"} />
                ) : (
                  <Plus size={28} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Title & Description */}
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
          <View style={{ marginBottom: 16 }}>
            <Text style={labelStyle}>Titlu *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="ex: Renovare baie completa"
              placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
              style={inputStyle}
            />
          </View>

          <View>
            <Text style={labelStyle}>Descriere</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Descrie proiectul tau..."
              placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
              multiline
              style={{ ...inputStyle, minHeight: 100, textAlignVertical: "top" }}
            />
          </View>
        </View>

        {/* Category */}
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
          <Text style={labelStyle}>Categorie</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {categories.map((cat) => {
              const isSelected = categoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategoryId(isSelected ? null : cat.id)}
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
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Featured toggle */}
        <View
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: isDark ? "#2D2D2D" : "#E5E7EB",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 15,
                color: isDark ? "#FFFFFF" : "#111827",
              }}
            >
              Proiect recomandat
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: isDark ? "#8F8F8F" : "#6B7280",
                marginTop: 2,
              }}
            >
              Afiseaza-l primul in portofoliu
            </Text>
          </View>
          <Switch
            value={isFeatured}
            onValueChange={setIsFeatured}
            trackColor={{ false: isDark ? "#3D3D3D" : "#D1D5DB", true: "#3B82F6" }}
          />
        </View>
      </ScrollView>

      {/* Save Button */}
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
          onPress={handleSave}
          disabled={saving || uploading}
          style={{
            backgroundColor: "#3B82F6",
            borderRadius: 12,
            paddingVertical: 16,
            justifyContent: "center",
            alignItems: "center",
            opacity: saving || uploading ? 0.6 : 1,
          }}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: "#FFFFFF",
              }}
            >
              {isNew ? "Adauga proiect" : "Salveaza"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
