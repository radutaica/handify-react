import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  ArrowRight,
  DollarSign,
  Clock,
  X,
  Plus,
} from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function ProfileDetails() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const params = useLocalSearchParams();

  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  // Parse existing data from params if going back and forth
  useEffect(() => {
    if (params.bio) setBio(params.bio);
    if (params.hourlyRate) setHourlyRate(params.hourlyRate);
    if (params.experienceYears) setExperienceYears(params.experienceYears);
    if (params.skills) {
      try {
        setSkills(JSON.parse(params.skills));
      } catch (e) {}
    }
  }, [params]);

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const validateForm = () => {
    if (!bio.trim()) {
      Alert.alert("Required", "Please add a bio describing your services.");
      return false;
    }
    if (bio.trim().length < 50) {
      Alert.alert(
        "Bio Too Short",
        "Please write at least 50 characters for your bio."
      );
      return false;
    }
    if (!hourlyRate || parseFloat(hourlyRate) <= 0) {
      Alert.alert("Required", "Please enter a valid hourly rate.");
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (!validateForm()) return;

    router.push({
      pathname: "/become-tasker/review",
      params: {
        selectedCategories: params.selectedCategories,
        bio: bio.trim(),
        hourlyRate,
        experienceYears: experienceYears || "0",
        skills: JSON.stringify(skills),
      },
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  const inputStyle = {
    backgroundColor: isDark ? "#1E1E1E" : "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: isDark ? "#FFFFFF" : "#111827",
    borderWidth: 1,
    borderColor: isDark ? "#2D2D2D" : "#E5E7EB",
  };

  const labelStyle = {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: isDark ? "#FFFFFF" : "#374151",
    marginBottom: 8,
  };

  return (
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
          paddingVertical: 12,
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

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 12,
              color: isDark ? "#8F8F8F" : "#6B7280",
            }}
          >
            Step 2 of 3
          </Text>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: isDark ? "#FFFFFF" : "#111827",
            }}
          >
            Profile Details
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View
        style={{
          height: 4,
          backgroundColor: isDark ? "#2D2D2D" : "#E5E7EB",
          marginHorizontal: 16,
          borderRadius: 2,
          marginBottom: 16,
        }}
      >
        <View
          style={{
            width: "66%",
            height: "100%",
            backgroundColor: "#10B981",
            borderRadius: 2,
          }}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 120,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Bio */}
          <View style={{ marginBottom: 24 }}>
            <Text style={labelStyle}>
              About You <Text style={{ color: "#EF4444" }}>*</Text>
            </Text>
            <TextInput
              style={[
                inputStyle,
                {
                  height: 120,
                  textAlignVertical: "top",
                },
              ]}
              placeholder="Tell customers about your experience, skills, and what makes you great at what you do..."
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={500}
            />
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                color: isDark ? "#6B7280" : "#9CA3AF",
                marginTop: 8,
                textAlign: "right",
              }}
            >
              {bio.length}/500
            </Text>
          </View>

          {/* Hourly Rate */}
          <View style={{ marginBottom: 24 }}>
            <Text style={labelStyle}>
              Hourly Rate <Text style={{ color: "#EF4444" }}>*</Text>
            </Text>
            <View
              style={[
                inputStyle,
                {
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 0,
                  paddingLeft: 16,
                },
              ]}
            >
              <DollarSign size={20} color={isDark ? "#6B7280" : "#9CA3AF"} />
              <TextInput
                style={{
                  flex: 1,
                  padding: 16,
                  paddingLeft: 8,
                  fontSize: 16,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#FFFFFF" : "#111827",
                }}
                placeholder="0.00"
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                value={hourlyRate}
                onChangeText={(text) =>
                  setHourlyRate(text.replace(/[^0-9.]/g, ""))
                }
                keyboardType="decimal-pad"
              />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: isDark ? "#6B7280" : "#9CA3AF",
                  paddingRight: 16,
                }}
              >
                /hour
              </Text>
            </View>
          </View>

          {/* Experience Years */}
          <View style={{ marginBottom: 24 }}>
            <Text style={labelStyle}>Years of Experience</Text>
            <View
              style={[
                inputStyle,
                {
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 0,
                  paddingLeft: 16,
                },
              ]}
            >
              <Clock size={20} color={isDark ? "#6B7280" : "#9CA3AF"} />
              <TextInput
                style={{
                  flex: 1,
                  padding: 16,
                  paddingLeft: 8,
                  fontSize: 16,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#FFFFFF" : "#111827",
                }}
                placeholder="0"
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                value={experienceYears}
                onChangeText={(text) =>
                  setExperienceYears(text.replace(/[^0-9]/g, ""))
                }
                keyboardType="number-pad"
              />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: isDark ? "#6B7280" : "#9CA3AF",
                  paddingRight: 16,
                }}
              >
                years
              </Text>
            </View>
          </View>

          {/* Skills */}
          <View style={{ marginBottom: 24 }}>
            <Text style={labelStyle}>Skills (Optional)</Text>
            <View
              style={[
                inputStyle,
                {
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 0,
                  paddingLeft: 16,
                },
              ]}
            >
              <TextInput
                style={{
                  flex: 1,
                  padding: 16,
                  paddingLeft: 0,
                  fontSize: 16,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#FFFFFF" : "#111827",
                }}
                placeholder="Add a skill..."
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                value={newSkill}
                onChangeText={setNewSkill}
                onSubmitEditing={addSkill}
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={addSkill}
                style={{
                  padding: 12,
                  marginRight: 4,
                }}
              >
                <Plus size={20} color="#10B981" />
              </TouchableOpacity>
            </View>

            {skills.length > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginTop: 12,
                  gap: 8,
                }}
              >
                {skills.map((skill, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: isDark ? "#10B98120" : "#D1FAE5",
                      borderRadius: 20,
                      paddingVertical: 8,
                      paddingLeft: 14,
                      paddingRight: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: isDark ? "#10B981" : "#065F46",
                        marginRight: 6,
                      }}
                    >
                      {skill}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeSkill(skill)}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: isDark ? "#10B98140" : "#A7F3D0",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <X size={12} color={isDark ? "#10B981" : "#065F46"} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom CTA */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: isDark ? "#121212" : "#FFFFFF",
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
          borderTopWidth: 1,
          borderTopColor: isDark ? "#2D2D2D" : "#E5E7EB",
        }}
      >
        <TouchableOpacity
          onPress={handleContinue}
          style={{
            backgroundColor: "#10B981",
            borderRadius: 12,
            paddingVertical: 16,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              color: "white",
              marginRight: 8,
            }}
          >
            Continue
          </Text>
          <ArrowRight size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
