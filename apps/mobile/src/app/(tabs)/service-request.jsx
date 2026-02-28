import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Plus,
  MapPin,
  Camera,
  X,
} from "lucide-react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import LocationPicker from "@/components/LocationPicker";
import { useCurrentUser } from "@/utils/auth";
import { geocodeAddress } from "@/utils/location";
import { useUpload } from "@/utils/useUpload";
import { categoriesApi, addressesApi, tasksApi } from "@/api";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function ServiceRequestPage() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });
  const [images, setImages] = useState([]);
  const [upload, { loading: uploading }] = useUpload();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    addressId: "",
    taskDate: "",
    taskTime: "",
    budgetMin: "",
    budgetMax: "",
    urgency: "medium",
    bookingType: "open_bidding",
  });

  // New address fields (when creating a new address)
  const [newAddress, setNewAddress] = useState({
    street_address: "",
    city: "",
    county: "",
    postal_code: "",
  });

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [isNewAddress, setIsNewAddress] = useState(false);

  const [errors, setErrors] = useState({});

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    loadCategories();
    loadAddresses();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getCategories({ active: true });
      setCategories(Array.isArray(data) ? data : data.categories || data.data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadAddresses = async () => {
    try {
      const data = await addressesApi.getAddresses();
      const list = Array.isArray(data) ? data : data.addresses || data.data || [];
      setAddresses(list);
      // Auto-select default address
      const defaultAddr = list.find((a) => a.is_default) || list[0];
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
        setFormData((prev) => ({ ...prev, addressId: defaultAddr.id }));
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFormData((prev) => ({ ...prev, categoryId: category.id }));
    setShowCategoryPicker(false);
  };

  const handleAddressSelect = (address) => {
    if (address === "new") {
      setIsNewAddress(true);
      setSelectedAddress(null);
      setFormData((prev) => ({ ...prev, addressId: "" }));
    } else {
      setIsNewAddress(false);
      setSelectedAddress(address);
      setFormData((prev) => ({ ...prev, addressId: address.id }));
    }
    setShowAddressPicker(false);
  };

  const handleLocationConfirm = (location) => {
    setShowLocationPicker(false);
    setIsNewAddress(true);
    setSelectedAddress(null);
    setFormData((prev) => ({ ...prev, addressId: "" }));
    setNewAddress({
      street_address: location.streetAddress || "",
      city: location.city || "",
      county: location.county || "",
      postal_code: location.postalCode || "",
    });
    setCoordinates({
      latitude: location.latitude,
      longitude: location.longitude,
    });
  };

  const handleAddImages = async () => {
    if (images.length >= 5) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      for (const asset of result.assets) {
        const uploadResult = await upload({
          reactNativeAsset: {
            uri: asset.uri,
            name: asset.fileName || asset.uri.split("/").pop(),
            mimeType: asset.mimeType || "image/jpeg",
          },
        });
        if (uploadResult?.url) {
          setImages((prev) => [...prev, uploadResult.url]);
        }
      }
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Titlul este obligatoriu";
    }
    if (!formData.categoryId) {
      newErrors.category = "Selecteaza o categorie";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Descrierea este obligatorie";
    }

    if (!formData.addressId && !isNewAddress) {
      newErrors.address = "Selecteaza o adresa";
    }

    if (isNewAddress) {
      if (!newAddress.street_address.trim()) {
        newErrors.street_address = "Adresa este obligatorie";
      }
      if (!newAddress.city.trim()) {
        newErrors.city = "Orasul este obligatoriu";
      }
    }

    if (formData.budgetMin && formData.budgetMax) {
      const min = parseFloat(formData.budgetMin);
      const max = parseFloat(formData.budgetMax);
      if (min > max) {
        newErrors.budget = "Bugetul minim nu poate fi mai mare decat maximul";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let addressId = formData.addressId;

      // Create new address first if needed
      if (isNewAddress) {
        const addressData = {
          ...newAddress,
          country: "RO",
        };

        // Include coordinates if available (from map picker)
        if (coordinates.latitude && coordinates.longitude) {
          addressData.latitude = coordinates.latitude;
          addressData.longitude = coordinates.longitude;
        } else {
          // Attempt forward geocoding for manually typed addresses
          const fullAddr = [newAddress.street_address, newAddress.city, newAddress.county, "Romania"]
            .filter(Boolean)
            .join(", ");
          const geo = await geocodeAddress(fullAddr);
          if (geo) {
            addressData.latitude = geo.latitude;
            addressData.longitude = geo.longitude;
          }
        }

        const addressResult = await addressesApi.createAddress(addressData);
        const created = addressResult.data || addressResult;
        addressId = created.id;
      }

      const taskData = {
        category_id: formData.categoryId,
        address_id: addressId,
        title: formData.title,
        description: formData.description,
        task_date: formData.taskDate || null,
        task_time: formData.taskTime || null,
        pricing_type: "bidding",
        budget_min: formData.budgetMin ? parseFloat(formData.budgetMin) : null,
        budget_max: formData.budgetMax ? parseFloat(formData.budgetMax) : null,
        booking_type: formData.bookingType,
        urgency: formData.urgency,
        images: images.length > 0 ? images : undefined,
      };

      await tasksApi.createTask(taskData);

      Alert.alert(
        "Succes!",
        "Sarcina ta a fost publicata. Mesterii din zona ta vor fi notificati.",
        [
          {
            text: "Vezi sarcinile",
            onPress: () => router.push("/(tabs)/bookings"),
          },
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      console.error("Error creating task:", error);
      Alert.alert(
        "Eroare",
        error.message || "Nu am putut crea sarcina. Incearca din nou.",
      );
    } finally {
      setLoading(false);
    }
  };

  const urgencyOptions = [
    { value: "low", label: "Scazuta", icon: Clock, color: "#6B7280" },
    { value: "medium", label: "Normal", icon: CheckCircle, color: "#10B981" },
    { value: "high", label: "Urgent", icon: AlertCircle, color: "#EF4444" },
  ];

  const bookingTypeOptions = [
    { value: "open_bidding", label: "Primeste oferte", description: "Mesterii iti trimit oferte" },
    { value: "instant_book", label: "Rezervare directa", description: "Atribuit automat" },
  ];

  if (!fontsLoaded) {
    return null;
  }

  const inputStyle = {
    backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: isDark ? "#FFFFFF" : "#000000",
  };

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? "#121212" : "#FFFFFF",
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
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#2D2D2D" : "#E5E7EB",
          }}
        >
          <TouchableOpacity onPress={handleBack} style={{ marginRight: 16 }}>
            <ArrowLeft size={24} color={isDark ? "#FFFFFF" : "#000000"} />
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 20,
              color: isDark ? "#FFFFFF" : "#000000",
              flex: 1,
            }}
          >
            Publica o sarcina
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 20,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Category Selection */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 12,
              }}
            >
              Categorie *
            </Text>

            {selectedCategory ? (
              <TouchableOpacity
                onPress={() => {
                  setSelectedCategory(null);
                  setShowCategoryPicker(true);
                }}
                style={{
                  ...inputStyle,
                  borderWidth: 2,
                  borderColor: "#10B981",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: isDark ? "#FFFFFF" : "#000000",
                  }}
                >
                  {selectedCategory.name}
                </Text>
                <ChevronDown size={20} color={isDark ? "#B3B3B3" : "#6B7280"} />
              </TouchableOpacity>
            ) : (
              <View>
                {categories.slice(0, 6).map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => handleCategorySelect(cat)}
                    style={{
                      ...inputStyle,
                      marginBottom: 8,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 16,
                        color: isDark ? "#FFFFFF" : "#000000",
                      }}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {errors.category && (
              <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                {errors.category}
              </Text>
            )}
          </View>

          {/* Title */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 8,
              }}
            >
              Titlu *
            </Text>
            <TextInput
              style={{
                ...inputStyle,
                borderWidth: errors.title ? 1 : 0,
                borderColor: "#EF4444",
              }}
              placeholder="ex. Reparatie scurgere urgenta"
              placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
              value={formData.title}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, title: text }))
              }
            />
            {errors.title && (
              <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                {errors.title}
              </Text>
            )}
          </View>

          {/* Description */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 8,
              }}
            >
              Descriere *
            </Text>
            <TextInput
              style={{
                ...inputStyle,
                textAlignVertical: "top",
                borderWidth: errors.description ? 1 : 0,
                borderColor: "#EF4444",
              }}
              placeholder="Descrie ce ai nevoie..."
              placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
            />
            {errors.description && (
              <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                {errors.description}
              </Text>
            )}
          </View>

          {/* Address Selection */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 8,
              }}
            >
              Adresa *
            </Text>

            {!isNewAddress && !showAddressPicker && selectedAddress ? (
              <TouchableOpacity
                onPress={() => setShowAddressPicker(true)}
                style={{
                  ...inputStyle,
                  borderWidth: 2,
                  borderColor: "#10B981",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                      color: isDark ? "#FFFFFF" : "#000000",
                    }}
                  >
                    {selectedAddress.label || selectedAddress.street_address}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: isDark ? "#B3B3B3" : "#6B7280",
                      marginTop: 2,
                    }}
                  >
                    {selectedAddress.full_address ||
                      `${selectedAddress.street_address}, ${selectedAddress.city}`}
                  </Text>
                </View>
                <ChevronDown size={20} color={isDark ? "#B3B3B3" : "#6B7280"} />
              </TouchableOpacity>
            ) : !isNewAddress ? (
              <View>
                {addresses.map((addr) => (
                  <TouchableOpacity
                    key={addr.id}
                    onPress={() => handleAddressSelect(addr)}
                    style={{
                      ...inputStyle,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        color: isDark ? "#FFFFFF" : "#000000",
                      }}
                    >
                      {addr.label || addr.street_address}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 12,
                        color: isDark ? "#B3B3B3" : "#6B7280",
                        marginTop: 2,
                      }}
                    >
                      {addr.full_address || `${addr.street_address}, ${addr.city}`}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  onPress={() => handleAddressSelect("new")}
                  style={{
                    ...inputStyle,
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: isDark ? "#2D2D2D" : "#E5E7EB",
                    borderStyle: "dashed",
                  }}
                >
                  <Plus size={18} color={isDark ? "#B3B3B3" : "#6B7280"} />
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                      color: isDark ? "#B3B3B3" : "#6B7280",
                      marginLeft: 8,
                    }}
                  >
                    Adauga adresa noua
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowLocationPicker(true)}
                  style={{
                    ...inputStyle,
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#14B8A6",
                    marginTop: 8,
                  }}
                >
                  <MapPin size={18} color="#14B8A6" />
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                      color: "#14B8A6",
                      marginLeft: 8,
                    }}
                  >
                    Alege pe harta
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <TextInput
                  style={{
                    ...inputStyle,
                    marginBottom: 8,
                    borderWidth: errors.street_address ? 1 : 0,
                    borderColor: "#EF4444",
                  }}
                  placeholder="Adresa (strada, numar)"
                  placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
                  value={newAddress.street_address}
                  onChangeText={(text) =>
                    setNewAddress((prev) => ({ ...prev, street_address: text }))
                  }
                />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TextInput
                    style={{
                      ...inputStyle,
                      flex: 2,
                      borderWidth: errors.city ? 1 : 0,
                      borderColor: "#EF4444",
                    }}
                    placeholder="Oras"
                    placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
                    value={newAddress.city}
                    onChangeText={(text) =>
                      setNewAddress((prev) => ({ ...prev, city: text }))
                    }
                  />
                  <TextInput
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="Judet"
                    placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
                    value={newAddress.county}
                    onChangeText={(text) =>
                      setNewAddress((prev) => ({ ...prev, county: text }))
                    }
                  />
                  <TextInput
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="Cod postal"
                    placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
                    value={newAddress.postal_code}
                    onChangeText={(text) =>
                      setNewAddress((prev) => ({ ...prev, postal_code: text }))
                    }
                  />
                </View>

                <View style={{ flexDirection: "row", marginTop: 8, gap: 16, alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() => {
                      setIsNewAddress(false);
                      setShowAddressPicker(true);
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: "#3B82F6",
                      }}
                    >
                      Foloseste o adresa existenta
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowLocationPicker(true)}
                    style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                  >
                    <MapPin size={14} color="#14B8A6" />
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: "#14B8A6",
                      }}
                    >
                      Alege pe harta
                    </Text>
                  </TouchableOpacity>
                </View>

                {(errors.street_address || errors.city) && (
                  <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                    Adresa si orasul sunt obligatorii
                  </Text>
                )}
              </View>
            )}
            {errors.address && (
              <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                {errors.address}
              </Text>
            )}
          </View>

          {/* Date & Time */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 8,
              }}
            >
              Data si ora (optional)
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                style={{ ...inputStyle, flex: 1 }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
                value={formData.taskDate}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, taskDate: text }))
                }
              />
              <TextInput
                style={{ ...inputStyle, flex: 1 }}
                placeholder="HH:MM"
                placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
                value={formData.taskTime}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, taskTime: text }))
                }
              />
            </View>
          </View>

          {/* Budget */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 8,
              }}
            >
              Buget (optional)
            </Text>
            <View
              style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
            >
              <View style={{ flex: 1 }}>
                <TextInput
                  style={inputStyle}
                  placeholder="Min (lei)"
                  placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
                  keyboardType="numeric"
                  value={formData.budgetMin}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, budgetMin: text }))
                  }
                />
              </View>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 16,
                  color: isDark ? "#8F8F8F" : "#9CA3AF",
                }}
              >
                -
              </Text>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={inputStyle}
                  placeholder="Max (lei)"
                  placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
                  keyboardType="numeric"
                  value={formData.budgetMax}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, budgetMax: text }))
                  }
                />
              </View>
            </View>
            {errors.budget && (
              <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                {errors.budget}
              </Text>
            )}
          </View>

          {/* Booking Type */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 8,
              }}
            >
              Tip rezervare
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {bookingTypeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() =>
                    setFormData((prev) => ({
                      ...prev,
                      bookingType: option.value,
                    }))
                  }
                  style={{
                    flex: 1,
                    backgroundColor:
                      formData.bookingType === option.value
                        ? "#10B98120"
                        : isDark
                          ? "#1E1E1E"
                          : "#F3F4F6",
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: formData.bookingType === option.value ? 1 : 0,
                    borderColor: "#10B981",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                      color:
                        formData.bookingType === option.value
                          ? "#10B981"
                          : isDark
                            ? "#FFFFFF"
                            : "#000000",
                      marginBottom: 4,
                    }}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: isDark ? "#8F8F8F" : "#9CA3AF",
                      textAlign: "center",
                    }}
                  >
                    {option.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Images */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 8,
              }}
            >
              Poze (optional)
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {images.map((uri, index) => (
                <View key={index} style={{ position: "relative" }}>
                  <Image
                    source={{ uri }}
                    style={{ width: 80, height: 80, borderRadius: 8 }}
                    contentFit="cover"
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: "#EF4444",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <X size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity
                  onPress={handleAddImages}
                  disabled={uploading}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: isDark ? "#2D2D2D" : "#E5E7EB",
                    borderStyle: "dashed",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
                  }}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#14B8A6" />
                  ) : (
                    <Camera size={24} color={isDark ? "#B3B3B3" : "#6B7280"} />
                  )}
                </TouchableOpacity>
              )}
            </View>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                color: isDark ? "#8F8F8F" : "#9CA3AF",
                marginTop: 4,
              }}
            >
              Maxim 5 poze
            </Text>
          </View>

          {/* Urgency */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 8,
              }}
            >
              Nivel urgenta
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {urgencyOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, urgency: option.value }))
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor:
                      formData.urgency === option.value
                        ? `${option.color}20`
                        : isDark
                          ? "#1E1E1E"
                          : "#F3F4F6",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderWidth: formData.urgency === option.value ? 1 : 0,
                    borderColor: option.color,
                  }}
                >
                  <option.icon size={16} color={option.color} />
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color:
                        formData.urgency === option.value
                          ? option.color
                          : isDark
                            ? "#FFFFFF"
                            : "#000000",
                      marginLeft: 6,
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
            paddingVertical: 12,
            paddingBottom: insets.bottom + 12,
            borderTopWidth: 1,
            borderTopColor: isDark ? "#2D2D2D" : "#E5E7EB",
          }}
        >
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#6B7280" : "#000000",
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: "#FFFFFF",
                }}
              >
                Publica sarcina
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <LocationPicker
        visible={showLocationPicker}
        onConfirm={handleLocationConfirm}
        onCancel={() => setShowLocationPicker(false)}
      />
    </KeyboardAvoidingAnimatedView>
  );
}
