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
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
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
import { colors } from "@/theme/colors";

const TOTAL_STEPS = 5;

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
      router.replace("/(tabs)");
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
        style={[styles.progressContainer, { paddingTop: insets.top + 20 }]}
      >
        {[1, 2, 3, 4, 5].map((step, index) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <React.Fragment key={step}>
              <View
                style={[
                  styles.progressStep,
                  isCompleted && styles.progressStepCompleted,
                  isCurrent && styles.progressStepCurrent,
                  !isCompleted && !isCurrent && styles.progressStepInactive,
                ]}
              >
                {isCompleted ? (
                  <Check size={16} color={colors.ui.white} strokeWidth={3} />
                ) : (
                  <Text
                    style={[
                      styles.progressStepText,
                      isCurrent && styles.progressStepTextActive,
                      !isCurrent && !isCompleted && styles.progressStepTextInactive,
                    ]}
                  >
                    {step}
                  </Text>
                )}
              </View>
              {index < 4 && (
                <View
                  style={[
                    styles.progressLine,
                    step < currentStep && styles.progressLineActive,
                    step >= currentStep && styles.progressLineInactive,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>
        Personalize your profile
      </Text>
      <Text style={styles.stepSubtitle}>
        Help us get to know you better (optional)
      </Text>

      {/* Profile Photo */}
      <View style={styles.profilePhotoContainer}>
        <TouchableOpacity onPress={handlePickImage}>
          <View style={styles.profilePhotoCircle}>
            {profilePhoto ? (
              <Image
                source={{ uri: profilePhoto }}
                style={styles.profilePhotoImage}
              />
            ) : (
              <View style={styles.profilePhotoPlaceholder}>
                <User size={40} color={colors.text.tertiary} />
              </View>
            )}
          </View>
          <View style={styles.cameraIconContainer}>
            <Camera size={16} color={colors.ui.white} />
          </View>
        </TouchableOpacity>
        <Text style={styles.addPhotoText}>Add photo</Text>
      </View>

      {/* Preferred Language */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Preferred Language</Text>
        <TouchableOpacity
          onPress={() => setShowLanguagePicker(!showLanguagePicker)}
          style={styles.dropdown}
        >
          <Text style={styles.dropdownText}>
            {preferredLanguage}
          </Text>
          <ChevronDown size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
        {showLanguagePicker && (
          <View style={styles.dropdownMenu}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang}
                onPress={() => {
                  setPreferredLanguage(lang);
                  setShowLanguagePicker(false);
                }}
                style={styles.dropdownItem}
              >
                <Text style={styles.dropdownItemText}>{lang}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Notification Preferences */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Notification Preferences</Text>
        {[
          { label: "Email notifications", value: emailNotifications, setValue: setEmailNotifications },
          { label: "SMS notifications", value: smsNotifications, setValue: setSmsNotifications },
          { label: "Push notifications", value: pushNotifications, setValue: setPushNotifications },
        ].map((notif) => (
          <View key={notif.label} style={styles.notificationRow}>
            <Text style={styles.notificationLabel}>{notif.label}</Text>
            <Switch
              value={notif.value}
              onValueChange={notif.setValue}
              trackColor={{ false: colors.border.light, true: colors.primary.teal }}
              thumbColor={colors.ui.white}
            />
          </View>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>
        How would you like to use our platform?
      </Text>
      <Text style={styles.stepSubtitle}>
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
            style={[
              styles.platformOption,
              isSelected && styles.platformOptionSelected,
            ]}
          >
            <View
              style={[
                styles.platformOptionIcon,
                isSelected && styles.platformOptionIconSelected,
              ]}
            >
              <IconComponent
                size={24}
                color={isSelected ? colors.primary.teal : colors.text.primary}
              />
            </View>
            <View style={styles.platformOptionContent}>
              <Text style={[
                styles.platformOptionTitle,
                isSelected && styles.platformOptionTitleSelected,
              ]}>
                {option.title}
              </Text>
              <Text style={[
                styles.platformOptionDescription,
                isSelected && styles.platformOptionDescriptionSelected,
              ]}>
                {option.description}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>
        Where are you located?
      </Text>
      <Text style={styles.stepSubtitle}>
        This helps us find services near you
      </Text>

      {/* Location Services Button */}
      <TouchableOpacity
        onPress={handleEnableLocation}
        style={[
          styles.locationButton,
          locationEnabled && styles.locationButtonEnabled,
        ]}
      >
        <Send
          size={24}
          color={locationEnabled ? colors.ui.white : colors.text.primary}
          style={styles.locationIcon}
        />
        <View style={styles.locationButtonContent}>
          <Text
            style={[
              styles.locationButtonText,
              locationEnabled && styles.locationButtonTextEnabled,
            ]}
          >
            {locationEnabled ? "Location enabled" : "Enable location services"}
          </Text>
          {locationEnabled && <Check size={20} color={colors.ui.white} />}
        </View>
        <Text
          style={[
            styles.locationButtonSubtext,
            locationEnabled && styles.locationButtonSubtextEnabled,
          ]}
        >
          Quick and automatic
        </Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Or enter manually</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Manual Entry */}
      <View>
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Street Address</Text>
          <View style={styles.inputWrapper}>
            <MapPin size={20} color={colors.text.tertiary} style={styles.inputIcon} />
            <TextInput
              placeholder="123 Main Street"
              placeholderTextColor={colors.text.tertiary}
              value={streetAddress}
              onChangeText={setStreetAddress}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={[styles.inputSection, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>City</Text>
          <TextInput
            placeholder="New York"
              placeholderTextColor={colors.text.tertiary}
            value={city}
            onChangeText={setCity}
              style={styles.input}
          />
        </View>

          <View style={[styles.inputSection, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>Postal Code</Text>
          <TextInput
            placeholder="10001"
              placeholderTextColor={colors.text.tertiary}
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="numeric"
              style={styles.input}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>
        What are you interested in?
      </Text>
      <Text style={styles.stepSubtitle}>
        Help us personalize your experience (optional)
      </Text>

      {/* Service Categories */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Service Categories</Text>
        {serviceCategories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategories.includes(category.id);
          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => toggleCategory(category.id)}
              style={[
                styles.categoryCard,
                isSelected && styles.categoryCardSelected,
              ]}
            >
              <View
                style={[
                  styles.categoryIconContainer,
                  isSelected && styles.categoryIconContainerSelected,
                ]}
            >
              <Icon
                size={24}
                  color={isSelected ? colors.ui.white : colors.text.primary}
                />
              </View>
              <Text style={styles.categoryText}>
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Preferred Time Windows */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Clock size={20} color={colors.text.primary} style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Preferred Time Windows</Text>
        </View>
        <View style={styles.timeWindowsContainer}>
        {timeWindows.map((time) => {
          const isSelected = selectedTimeWindows.includes(time.id);
          return (
            <TouchableOpacity
              key={time.id}
              onPress={() => toggleTimeWindow(time.id)}
                style={[
                  styles.timeWindowButton,
                  isSelected && styles.timeWindowButtonSelected,
                ]}
            >
              <Text
                  style={[
                    styles.timeWindowText,
                    isSelected && styles.timeWindowTextSelected,
                  ]}
              >
                {time.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        </View>
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.paymentHeader}>
        <Lock size={48} color={colors.text.primary} strokeWidth={1.5} style={styles.paymentIcon} />
        <Text style={styles.stepTitle}>
          Add a payment method
        </Text>
        <Text style={styles.stepSubtitle}>
          Secure and encrypted. You can skip this for now.
        </Text>
      </View>

      {/* Payment Method Selection */}
      <View style={styles.paymentMethodContainer}>
        <TouchableOpacity
          onPress={() => setPaymentMethod("credit_card")}
          style={[
            styles.paymentMethodButton,
            paymentMethod === "credit_card" && styles.paymentMethodButtonSelected,
          ]}
        >
          <CreditCard
            size={32}
            color={paymentMethod === "credit_card" ? colors.primary.teal : colors.text.primary}
            style={styles.paymentMethodIcon}
          />
          <Text style={styles.paymentMethodText}>Card</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setPaymentMethod("digital_wallet")}
          style={[
            styles.paymentMethodButton,
            paymentMethod === "digital_wallet" && styles.paymentMethodButtonSelected,
          ]}
        >
          <Wallet
            size={32}
            color={paymentMethod === "digital_wallet" ? colors.primary.teal : colors.text.primary}
            style={styles.paymentMethodIcon}
          />
          <Text style={styles.paymentMethodText}>Wallet</Text>
        </TouchableOpacity>
      </View>

      {/* Credit Card Form */}
      {paymentMethod === "credit_card" && (
        <View>
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={colors.text.tertiary}
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputSection, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Expiry</Text>
              <TextInput
                placeholder="MM/YY"
                placeholderTextColor={colors.text.tertiary}
                value={expiryDate}
                onChangeText={setExpiryDate}
                style={styles.input}
              />
            </View>

            <View style={[styles.inputSection, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput
                placeholder="123"
                placeholderTextColor={colors.text.tertiary}
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                secureTextEntry
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Billing Zip Code</Text>
            <TextInput
              placeholder="10001"
              placeholderTextColor={colors.text.tertiary}
              value={billingZip}
              onChangeText={setBillingZip}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <View style={styles.securityMessage}>
            <Lock size={20} color={colors.text.primary} style={styles.securityIcon} />
            <Text style={styles.securityText}>
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.teal} />
      </View>
    );
  }

  const canContinue = currentStep === 2 ? platformUsage !== null : true;

  return (
    <KeyboardAvoidingAnimatedView style={styles.container} behavior="padding">
      <StatusBar style="dark" />
      <View style={styles.content}>
        {renderProgressIndicator()}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderCurrentStep()}
        </ScrollView>

        {/* Bottom Buttons */}
        <View style={[styles.bottomButtons, { paddingBottom: insets.bottom + 16 }]}>
          {currentStep === 4 || currentStep === 5 ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={handleSkip}
                style={styles.skipButton}
              >
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleContinue}
                disabled={loading}
                style={styles.continueButton}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={styles.continueButtonGradient}>
                    <ActivityIndicator color={colors.ui.white} />
                  </View>
                ) : (
                  <LinearGradient
                    colors={colors.primary.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.continueButtonGradient}
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleContinue}
              disabled={!canContinue || loading}
              style={styles.continueButtonFull}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.ui.white} />
              ) : (
                <LinearGradient
                  colors={canContinue ? colors.primary.gradient : [colors.gray[400], colors.gray[400]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.continueButtonGradient}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.primary,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  progressStepCompleted: {
    backgroundColor: colors.primary.teal,
  },
  progressStepCurrent: {
    backgroundColor: colors.primary.teal,
    borderWidth: 2,
    borderColor: colors.ui.white,
  },
  progressStepInactive: {
    backgroundColor: colors.gray[200],
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressStepTextActive: {
    color: colors.ui.white,
  },
  progressStepTextInactive: {
    color: colors.text.primary,
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: colors.primary.teal,
  },
  progressLineInactive: {
    backgroundColor: colors.gray[200],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexGrow: 1,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  stepSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 32,
    textAlign: "center",
  },
  profilePhotoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  profilePhotoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
  },
  profilePhotoImage: {
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  profilePhotoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gray[200],
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.teal,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.ui.white,
  },
  addPhotoText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.text.secondary,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  dropdown: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: colors.ui.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  notificationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  notificationLabel: {
    fontSize: 16,
    color: colors.text.primary,
  },
  platformOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  platformOptionSelected: {
    backgroundColor: colors.primary.teal,
    borderWidth: 2,
    borderColor: colors.primary.teal,
  },
  platformOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.gray[200],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  platformOptionIconSelected: {
    backgroundColor: colors.ui.white,
  },
  platformOptionContent: {
    flex: 1,
  },
  platformOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 4,
  },
  platformOptionTitleSelected: {
    color: colors.ui.white,
  },
  platformOptionDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  platformOptionDescriptionSelected: {
    color: colors.ui.white,
    opacity: 0.9,
  },
  locationButton: {
    backgroundColor: colors.gray[200],
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  locationButtonEnabled: {
    backgroundColor: colors.primary.teal,
  },
  locationIcon: {
    marginBottom: 12,
  },
  locationButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginRight: 8,
  },
  locationButtonTextEnabled: {
    color: colors.ui.white,
  },
  locationButtonSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  locationButtonSubtextEnabled: {
    color: colors.ui.white,
    opacity: 0.9,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: "500",
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  categoryCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary.teal,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.gray[200],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryIconContainerSelected: {
    backgroundColor: colors.primary.teal,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
  timeWindowsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  timeWindowButton: {
    backgroundColor: colors.ui.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  timeWindowButtonSelected: {
    backgroundColor: colors.primary.teal,
    borderColor: colors.primary.teal,
  },
  timeWindowText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  timeWindowTextSelected: {
    color: colors.ui.white,
  },
  paymentHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  paymentIcon: {
    marginBottom: 16,
  },
  paymentMethodContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  paymentMethodButton: {
    flex: 1,
    backgroundColor: colors.ui.white,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  paymentMethodButtonSelected: {
    borderWidth: 2,
    borderColor: colors.primary.teal,
  },
  paymentMethodIcon: {
    marginBottom: 8,
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  securityMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  securityIcon: {
    marginRight: 12,
  },
  securityText: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
  },
  bottomButtons: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: colors.ui.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  skipButton: {
    flex: 1,
    backgroundColor: colors.ui.white,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  continueButton: {
    flex: 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  continueButtonFull: {
    borderRadius: 12,
    overflow: "hidden",
  },
  continueButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.ui.white,
  },
});
