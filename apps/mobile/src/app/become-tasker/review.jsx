import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Check,
  Briefcase,
  DollarSign,
  Clock,
  Edit2,
  Sparkles,
} from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { categoriesApi, taskerProfilesApi } from "@/api";
import { useCurrentUser } from "@/utils/auth";

export default function ReviewSubmit() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const params = useLocalSearchParams();
  const { refetchUser } = useCurrentUser();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Parse params
  const selectedCategoryIds = params.selectedCategories
    ? JSON.parse(params.selectedCategories)
    : [];
  const bio = params.bio || "";
  const hourlyRate = params.hourlyRate || "0";
  const experienceYears = params.experienceYears || "0";
  const skills = params.skills ? JSON.parse(params.skills) : [];

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getCategories({ active: true });
      const selected = (data || []).filter((cat) =>
        selectedCategoryIds.includes(cat.id)
      );
      setCategories(selected);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const profileData = {
        bio,
        hourly_rate: parseFloat(hourlyRate),
        experience_years: parseInt(experienceYears, 10) || 0,
        category_ids: selectedCategoryIds,
        skills,
        is_active: true,
        allows_instant_booking: false,
        instant_booking_buffer_hours: 24,
      };

      await taskerProfilesApi.createOnboarding(profileData);

      // Refetch user data to update hasTaskerProfile
      await refetchUser();

      // Navigate to success or back to profile
      Alert.alert(
        "Bine ai venit!",
        "Profilul tau de prestator a fost creat cu succes. Acum poti incepe sa primesti cereri de servicii!",
        [
          {
            text: "Incepe",
            onPress: () => {
              router.dismissAll();
              router.replace("/(tabs)/profile");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error creating tasker profile:", error);
      Alert.alert(
        "Eroare",
        error.message || "Nu am putut crea profilul. Incearca din nou."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCategories = () => {
    router.push({
      pathname: "/become-tasker/categories",
      params: {
        selectedCategories: params.selectedCategories,
      },
    });
  };

  const handleEditDetails = () => {
    router.push({
      pathname: "/become-tasker/details",
      params: {
        selectedCategories: params.selectedCategories,
        bio: params.bio,
        hourlyRate: params.hourlyRate,
        experienceYears: params.experienceYears,
        skills: params.skills,
      },
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  const SectionCard = ({ title, onEdit, children }) => (
    <View
      style={{
        backgroundColor: isDark ? "#1E1E1E" : "#F9FAFB",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 16,
            color: isDark ? "#FFFFFF" : "#111827",
          }}
        >
          {title}
        </Text>
        <TouchableOpacity
          onPress={onEdit}
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Edit2 size={14} color="#10B981" />
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: "#10B981",
              marginLeft: 4,
            }}
          >
            Editeaza
          </Text>
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );

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
            Pasul 3 din 3
          </Text>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: isDark ? "#FFFFFF" : "#111827",
            }}
          >
            Revizuire si Trimitere
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
            width: "100%",
            height: "100%",
            backgroundColor: "#10B981",
            borderRadius: 2,
          }}
        />
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 120,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              color: isDark ? "#B3B3B3" : "#6B7280",
              marginBottom: 20,
              lineHeight: 22,
            }}
          >
            Revizuieste informatiile tale inainte de trimitere. Poti edita orice
            sectiune daca este necesar.
          </Text>

          {/* Categories Section */}
          <SectionCard title="Categorii servicii" onEdit={handleEditCategories}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {categories.map((cat) => (
                <View
                  key={cat.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: isDark ? "#10B98120" : "#D1FAE5",
                    borderRadius: 20,
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                  }}
                >
                  <Text style={{ marginRight: 6 }}>{cat.icon || "🔧"}</Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: isDark ? "#10B981" : "#065F46",
                    }}
                  >
                    {cat.name}
                  </Text>
                </View>
              ))}
            </View>
          </SectionCard>

          {/* Bio Section */}
          <SectionCard title="Despre tine" onEdit={handleEditDetails}>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: isDark ? "#B3B3B3" : "#4B5563",
                lineHeight: 22,
              }}
            >
              {bio}
            </Text>
          </SectionCard>

          {/* Rate & Experience Section */}
          <SectionCard title="Tarif si Experienta" onEdit={handleEditDetails}>
            <View style={{ flexDirection: "row", gap: 16 }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: isDark ? "#10B98120" : "#D1FAE5",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <DollarSign size={20} color="#10B981" />
                </View>
                <View>
                  <Text
                    style={{
                      fontFamily: "Inter_700Bold",
                      fontSize: 18,
                      color: isDark ? "#FFFFFF" : "#111827",
                    }}
                  >
                    {hourlyRate} lei
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: isDark ? "#8F8F8F" : "#6B7280",
                    }}
                  >
                    pe ora
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: isDark ? "#10B98120" : "#D1FAE5",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <Clock size={20} color="#10B981" />
                </View>
                <View>
                  <Text
                    style={{
                      fontFamily: "Inter_700Bold",
                      fontSize: 18,
                      color: isDark ? "#FFFFFF" : "#111827",
                    }}
                  >
                    {experienceYears}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: isDark ? "#8F8F8F" : "#6B7280",
                    }}
                  >
                    ani experienta
                  </Text>
                </View>
              </View>
            </View>
          </SectionCard>

          {/* Skills Section */}
          {skills.length > 0 && (
            <SectionCard title="Abilitati" onEdit={handleEditDetails}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {skills.map((skill, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: isDark ? "#2D2D2D" : "#E5E7EB",
                      borderRadius: 16,
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 13,
                        color: isDark ? "#B3B3B3" : "#4B5563",
                      }}
                    >
                      {skill}
                    </Text>
                  </View>
                ))}
              </View>
            </SectionCard>
          )}

          {/* Info Note */}
          <View
            style={{
              backgroundColor: isDark ? "#1E3A5F" : "#EFF6FF",
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            <Sparkles
              size={20}
              color={isDark ? "#60A5FA" : "#3B82F6"}
              style={{ marginRight: 12, marginTop: 2 }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: isDark ? "#60A5FA" : "#1D4ED8",
                  marginBottom: 4,
                }}
              >
                Aproape gata!
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: isDark ? "#93C5FD" : "#1E40AF",
                  lineHeight: 20,
                }}
              >
                Dupa trimitere, profilul tau va fi activ si vei putea incepe
                sa primesti cereri de servicii de la clienti.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

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
          onPress={handleSubmit}
          disabled={submitting}
          style={{
            backgroundColor: "#10B981",
            borderRadius: 12,
            paddingVertical: 16,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Check size={20} color="white" style={{ marginRight: 8 }} />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: "white",
                }}
              >
                Creeaza profilul
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
