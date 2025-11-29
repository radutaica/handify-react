import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
  Switch,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/utils/auth/useAuth";
import {
  Camera,
  Check,
  ChevronDown,
  MapPin,
  Send,
  Clock,
  Lock,
  CreditCard,
  Wallet,
  Home,
  Wrench,
  Heart,
  Briefcase,
  Zap,
  User,
  Users,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useUpload } from "@/utils/useUpload";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

const TOTAL_STEPS = 5;
const CORAL_COLOR = "#FF6B6B";
const LIGHT_PURPLE = "#A78BFA";
const LIGHT_GRAY = "#E5E7EB";
const DARK_GRAY = "#374151";
const LIGHT_BEIGE = "#F5F5DC";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isReady } = useAuth();
  const [upload] = useUpload();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Profile
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoAsset, setProfilePhotoAsset] = useState(null);
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  // Step 2: Platform usage
  const [platformUsage, setPlatformUsage] = useState(null);

  // Step 3: Location
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("New York");
  const [postalCode, setPostalCode] = useState("10001");

  // Step 4: Interests
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTimeWindows, setSelectedTimeWindows] = useState([]);

  // Step 5: Payment
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [cardNumber, setCardNumber] = useState("1234 5678 9012 3456");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("123");
  const [billingZip, setBillingZip] = useState("10001");

  const languages = ["English", "Spanish", "French", "German", "Italian"];

  const serviceCategories = [
    { id: "cleaning", label: "Cleaning", icon: Home },
    { id: "repairs", label: "Repairs & Maintenance", icon: Wrench },
    { id: "personal_care", label: "Personal Care", icon: Heart },
    { id: "business", label: "Business Services", icon: Briefcase },
    { id: "urgent", label: "Urgent Tasks", icon: Zap },
  ];

  const timeWindows = [
    { id: "morning", label: "Morning (6AM - 12PM)" },
    { id: "afternoon", label: "Afternoon (12PM - 6PM)" },
    { id: "evening", label: "Evening (6PM - 10PM)" },
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace("/welcome");
    }
  }, [isReady, isAuthenticated]);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please grant camera roll permissions");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfilePhoto(result.assets[0].uri);
        setProfilePhotoAsset(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleEnableLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please grant location permissions");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address && address.length > 0) {
        const addr = address[0];
        setStreetAddress(addr.street || "");
        setCity(addr.city || "New York");
        setPostalCode(addr.postalCode || "10001");
        setLocationEnabled(true);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get location");
    }
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleTimeWindow = (timeId) => {
    setSelectedTimeWindows((prev) =>
      prev.includes(timeId)
        ? prev.filter((id) => id !== timeId)
        : [...prev, timeId]
    );
  };

  const handleContinue = async () => {
    if (currentStep < TOTAL_STEPS) {
      // Step 2 validation
      if (currentStep === 2 && !platformUsage) {
        Alert.alert("Required", "Please select how you'd like to use the platform");
        return;
      }

      setCurrentStep(currentStep + 1);
    } else {
      // Final step - complete onboarding
      await handleComplete();
    }
  };

  const handleSkip = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      let photoUrl = null;
      if (profilePhotoAsset) {
        const uploadResult = await upload({
          reactNativeAsset: profilePhotoAsset,
        });
        if (uploadResult.url && !uploadResult.error) {
          photoUrl = uploadResult.url;
        }
      }

      const { profileApi } = await import("@/api");
      const profileData = {
        photo_url: photoUrl,
        preferred_language: preferredLanguage,
        email_notifications: emailNotifications,
        sms_notifications: smsNotifications,
        push_notifications: pushNotifications,
        user_type: platformUsage || "customer",
        location_address: streetAddress,
        location_city: city,
        location_zip: postalCode,
        service_categories: selectedCategories,
        preferred_time_windows: selectedTimeWindows,
        payment_method: paymentMethod,
      };

      await profileApi.completeProfile(profileData);
      // For testing: comment out redirect to stay on onboarding screen
      // router.replace("/(tabs)");
      Alert.alert("Success", "Onboarding completed! (Testing mode - staying on page)");
    } catch (error) {
      console.error("Onboarding completion error:", error);
      Alert.alert("Error", error.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  const renderProgressIndicator = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingTop: insets.top + 20,
          paddingBottom: 24,
        }}
      >
        {[1, 2, 3, 4, 5].map((step, index) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const stepColor = isCompleted
            ? CORAL_COLOR
            : isCurrent
            ? LIGHT_PURPLE
            : LIGHT_GRAY;
          const textColor = isCompleted || isCurrent ? "white" : DARK_GRAY;

          return (
            <React.Fragment key={step}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: stepColor,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {isCompleted ? (
                  <Check size={18} color="white" />
                ) : (
                  <Text
                    style={{
                      color: textColor,
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    {step}
                  </Text>
                )}
              </View>
              {index < 4 && (
                <View
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: step < currentStep ? CORAL_COLOR : LIGHT_GRAY,
                    marginHorizontal: 8,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  const renderStep1 = () => (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: DARK_GRAY,
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Let's personalize your profile
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: "#9CA3AF",
          marginBottom: 32,
          textAlign: "center",
        }}
      >
        Help us get to know you better (all optional)
      </Text>

      {/* Profile Photo */}
      <View style={{ alignItems: "center", marginBottom: 32 }}>
        <TouchableOpacity onPress={handlePickImage}>
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 2,
              borderColor: LIGHT_GRAY,
              borderStyle: "dashed",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#F9FAFB",
            }}
          >
            {profilePhoto ? (
              <Image
                source={{ uri: profilePhoto }}
                style={{
                  width: 116,
                  height: 116,
                  borderRadius: 58,
                }}
              />
            ) : (
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: LIGHT_GRAY,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <User size={32} color={DARK_GRAY} />
              </View>
            )}
          </View>
          <View
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: CORAL_COLOR,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 3,
              borderColor: "white",
            }}
          >
            <Camera size={18} color="white" />
          </View>
        </TouchableOpacity>
        <Text
          style={{
            marginTop: 12,
            fontSize: 14,
            color: DARK_GRAY,
          }}
        >
          Tap to add your photo
        </Text>
      </View>

      {/* Preferred Language */}
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: DARK_GRAY,
            marginBottom: 12,
          }}
        >
          Preferred Language
        </Text>
        <TouchableOpacity
          onPress={() => setShowLanguagePicker(!showLanguagePicker)}
          style={{
            backgroundColor: "#F9FAFB",
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, color: DARK_GRAY }}>
            {preferredLanguage}
          </Text>
          <ChevronDown size={20} color="#9CA3AF" />
        </TouchableOpacity>
        {showLanguagePicker && (
          <View
            style={{
              marginTop: 8,
              backgroundColor: "white",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: LIGHT_GRAY,
              overflow: "hidden",
            }}
          >
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang}
                onPress={() => {
                  setPreferredLanguage(lang);
                  setShowLanguagePicker(false);
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: LIGHT_GRAY,
                }}
              >
                <Text style={{ fontSize: 16, color: DARK_GRAY }}>{lang}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Notification Preferences */}
      <View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: DARK_GRAY,
            marginBottom: 12,
          }}
        >
          Notification Preferences
        </Text>
        {[
          { label: "Email notifications", value: emailNotifications, setValue: setEmailNotifications },
          { label: "SMS notifications", value: smsNotifications, setValue: setSmsNotifications },
          { label: "Push notifications", value: pushNotifications, setValue: setPushNotifications },
        ].map((notif) => (
          <View
            key={notif.label}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#F9FAFB",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 16, color: DARK_GRAY }}>{notif.label}</Text>
            <Switch
              value={notif.value}
              onValueChange={notif.setValue}
              trackColor={{ false: LIGHT_GRAY, true: CORAL_COLOR }}
              thumbColor="white"
            />
          </View>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: DARK_GRAY,
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        How would you like to use our platform?
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: "#9CA3AF",
          marginBottom: 32,
          textAlign: "center",
        }}
      >
        Choose the option that best describes you
      </Text>

      {[
        {
          id: "customer",
          title: "I want to request services",
          description: "Find trusted professionals to help with your tasks",
          Icon: User,
        },
        {
          id: "provider",
          title: "I want to provide services",
          description: "Offer your skills and expertise to those who need it",
          Icon: Briefcase,
        },
        {
          id: "both",
          title: "Both",
          description: "Request services and offer your own skills",
          Icon: Users,
        },
      ].map((option) => {
        const isSelected = platformUsage === option.id;
        const IconComponent = option.Icon;
        return (
          <TouchableOpacity
            key={option.id}
            onPress={() => setPlatformUsage(option.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isSelected ? "#FFE5E5" : "white",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: isSelected ? 2 : 1,
              borderColor: isSelected ? CORAL_COLOR : LIGHT_GRAY,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                backgroundColor: isSelected ? CORAL_COLOR : LIGHT_BEIGE,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <IconComponent
                size={24}
                color={isSelected ? "white" : DARK_GRAY}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: DARK_GRAY,
                  marginBottom: 4,
                }}
              >
                {option.title}
              </Text>
              <Text style={{ fontSize: 14, color: "#6B7280" }}>
                {option.description}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderStep3 = () => (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: DARK_GRAY,
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Where are you located?
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: "#9CA3AF",
          marginBottom: 32,
          textAlign: "center",
        }}
      >
        This helps us find services near you
      </Text>

      {/* Location Services Button */}
      <TouchableOpacity
        onPress={handleEnableLocation}
        style={{
          backgroundColor: locationEnabled ? CORAL_COLOR : LIGHT_BEIGE,
          borderRadius: 12,
          padding: 24,
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Send
          size={24}
          color={locationEnabled ? "white" : DARK_GRAY}
          style={{ marginBottom: 12 }}
        />
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: locationEnabled ? "white" : DARK_GRAY,
              marginRight: 8,
            }}
          >
            {locationEnabled ? "Location enabled" : "Enable location services"}
          </Text>
          {locationEnabled && <Check size={20} color="white" />}
        </View>
        <Text
          style={{
            fontSize: 14,
            color: locationEnabled ? "#FFE5E5" : "#6B7280",
            marginTop: 4,
          }}
        >
          Quick and automatic
        </Text>
      </TouchableOpacity>

      {/* Divider */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <View style={{ flex: 1, height: 1, backgroundColor: LIGHT_GRAY }} />
        <Text
          style={{
            marginHorizontal: 16,
            fontSize: 12,
            color: "#9CA3AF",
            fontWeight: "600",
          }}
        >
          OR ENTER MANUALLY
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: LIGHT_GRAY }} />
      </View>

      {/* Manual Entry */}
      <View>
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: DARK_GRAY,
              marginBottom: 8,
            }}
          >
            Street Address
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F9FAFB",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          >
            <MapPin size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
            <TextInput
              placeholder="123 Main Street"
              placeholderTextColor="#9CA3AF"
              value={streetAddress}
              onChangeText={setStreetAddress}
              style={{
                flex: 1,
                fontSize: 16,
                color: DARK_GRAY,
              }}
            />
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: DARK_GRAY,
              marginBottom: 8,
            }}
          >
            City
          </Text>
          <TextInput
            placeholder="New York"
            placeholderTextColor="#9CA3AF"
            value={city}
            onChangeText={setCity}
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              color: DARK_GRAY,
            }}
          />
        </View>

        <View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: DARK_GRAY,
              marginBottom: 8,
            }}
          >
            Postal Code
          </Text>
          <TextInput
            placeholder="10001"
            placeholderTextColor="#9CA3AF"
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="numeric"
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              color: DARK_GRAY,
            }}
          />
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: DARK_GRAY,
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        What are you interested in?
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: "#9CA3AF",
          marginBottom: 32,
          textAlign: "center",
        }}
      >
        Help us personalize your experience (optional)
      </Text>

      {/* Service Categories */}
      <View style={{ marginBottom: 32 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: DARK_GRAY,
            marginBottom: 16,
          }}
        >
          Service Categories
        </Text>
        {serviceCategories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategories.includes(category.id);
          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => toggleCategory(category.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isSelected ? "#FFE5E5" : "white",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? CORAL_COLOR : LIGHT_GRAY,
              }}
            >
              <Icon
                size={24}
                color={isSelected ? CORAL_COLOR : DARK_GRAY}
                style={{ marginRight: 12 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: DARK_GRAY,
                }}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Preferred Time Windows */}
      <View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Clock size={20} color={DARK_GRAY} style={{ marginRight: 8 }} />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: DARK_GRAY,
            }}
          >
            Preferred Time Windows
          </Text>
        </View>
        {timeWindows.map((time) => {
          const isSelected = selectedTimeWindows.includes(time.id);
          return (
            <TouchableOpacity
              key={time.id}
              onPress={() => toggleTimeWindow(time.id)}
              style={{
                backgroundColor: isSelected ? "#FFE5E5" : "white",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? CORAL_COLOR : LIGHT_GRAY,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: DARK_GRAY,
                }}
              >
                {time.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={{ flex: 1 }}>
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <Lock size={48} color={DARK_GRAY} style={{ marginBottom: 16 }} />
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: DARK_GRAY,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          Add a payment method
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#9CA3AF",
            textAlign: "center",
          }}
        >
          Secure and encrypted. You can skip this for now.
        </Text>
      </View>

      {/* Payment Method Selection */}
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <TouchableOpacity
          onPress={() => setPaymentMethod("credit_card")}
          style={{
            flex: 1,
            backgroundColor: paymentMethod === "credit_card" ? "#FFE5E5" : "white",
            borderRadius: 12,
            padding: 20,
            alignItems: "center",
            borderWidth: paymentMethod === "credit_card" ? 2 : 1,
            borderColor: paymentMethod === "credit_card" ? CORAL_COLOR : LIGHT_GRAY,
          }}
        >
          <CreditCard
            size={32}
            color={paymentMethod === "credit_card" ? CORAL_COLOR : DARK_GRAY}
            style={{ marginBottom: 8 }}
          />
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: DARK_GRAY,
            }}
          >
            Credit Card
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setPaymentMethod("digital_wallet")}
          style={{
            flex: 1,
            backgroundColor: paymentMethod === "digital_wallet" ? "#FFE5E5" : "white",
            borderRadius: 12,
            padding: 20,
            alignItems: "center",
            borderWidth: paymentMethod === "digital_wallet" ? 2 : 1,
            borderColor: paymentMethod === "digital_wallet" ? CORAL_COLOR : LIGHT_GRAY,
          }}
        >
          <Wallet
            size={32}
            color={paymentMethod === "digital_wallet" ? CORAL_COLOR : DARK_GRAY}
            style={{ marginBottom: 8 }}
          />
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: DARK_GRAY,
            }}
          >
            Digital Wallet
          </Text>
        </TouchableOpacity>
      </View>

      {/* Credit Card Form */}
      {paymentMethod === "credit_card" && (
        <View>
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: DARK_GRAY,
                marginBottom: 8,
              }}
            >
              Card Number
            </Text>
            <TextInput
              placeholder="1234 5678 9012 3456"
              placeholderTextColor="#9CA3AF"
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: DARK_GRAY,
              }}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: DARK_GRAY,
                  marginBottom: 8,
                }}
              >
                Expiry Date
              </Text>
              <TextInput
                placeholder="MM/YY"
                placeholderTextColor="#9CA3AF"
                value={expiryDate}
                onChangeText={setExpiryDate}
                style={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: DARK_GRAY,
                }}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: DARK_GRAY,
                  marginBottom: 8,
                }}
              >
                CVV
              </Text>
              <TextInput
                placeholder="123"
                placeholderTextColor="#9CA3AF"
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                secureTextEntry
                style={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: DARK_GRAY,
                }}
              />
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: DARK_GRAY,
                marginBottom: 8,
              }}
            >
              Billing Zip Code
            </Text>
            <TextInput
              placeholder="10001"
              placeholderTextColor="#9CA3AF"
              value={billingZip}
              onChangeText={setBillingZip}
              keyboardType="numeric"
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: DARK_GRAY,
              }}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F9FAFB",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Lock size={20} color={DARK_GRAY} style={{ marginRight: 12 }} />
            <Text
              style={{
                fontSize: 14,
                color: DARK_GRAY,
                flex: 1,
              }}
            >
              Your payment information is encrypted and secure. We never share your data.
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color={CORAL_COLOR} />
      </View>
    );
  }

  const canContinue = currentStep === 2 ? platformUsage !== null : true;
  const continueButtonColor = canContinue ? CORAL_COLOR : LIGHT_GRAY;

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: "white" }}>
        {renderProgressIndicator()}

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 24,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        >
          {renderCurrentStep()}
        </ScrollView>

        {/* Bottom Buttons */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingBottom: insets.bottom + 16,
            paddingTop: 16,
            backgroundColor: "white",
            borderTopWidth: 1,
            borderTopColor: LIGHT_GRAY,
          }}
        >
          {currentStep === 4 ? (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={handleSkip}
                style={{
                  flex: 1,
                  backgroundColor: "white",
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: LIGHT_GRAY,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: DARK_GRAY,
                  }}
                >
                  Skip for now
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleContinue}
                disabled={loading}
                style={{
                  flex: 2,
                  backgroundColor: CORAL_COLOR,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: "center",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "white",
                    }}
                  >
                    Continue
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleContinue}
              disabled={!canContinue || loading}
              style={{
                backgroundColor: continueButtonColor,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
                opacity: !canContinue || loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "white",
                  }}
                >
                  Continue
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
