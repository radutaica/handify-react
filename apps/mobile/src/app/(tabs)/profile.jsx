import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useCurrentUser } from "@/utils/auth";
import {
  User,
  Settings,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
  Star,
  MapPin,
  Edit3,
  LogOut,
  ChevronRight,
  Briefcase,
  ClipboardList,
} from "lucide-react-native";
import { Image } from "expo-image";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function ProfilePage() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const {
    user,
    isTasker,
    taskerProfile,
    hasTaskerProfile,
    isAuthenticated,
    isReady,
    signOut,
    signIn,
    refetchUser,
    loading,
    isRefetching,
  } = useCurrentUser();
  console.log("taskerProfile", taskerProfile);
  const [stats, setStats] = useState(null);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    if (isReady && isAuthenticated) {
      loadUserStats();
    }
  }, [isReady, isAuthenticated]);

  const loadUserStats = async () => {
    // Mock stats data - will be replaced with actual API call
    const mockStats = {
      totalBookings: 12,
      completedBookings: 10,
      averageRating: 4.8,
      totalSpent: 1250,
      favoriteProviders: 3,
    };
    setStats(mockStats);
  };

  const handleEditProfile = () => {
    router.push("/onboarding");
  };

  const handleSettings = () => {
    Alert.alert("Coming Soon", "Settings page is coming soon!");
  };

  const handlePaymentMethods = () => {
    Alert.alert("Coming Soon", "Payment methods page is coming soon!");
  };

  const handleNotifications = () => {
    Alert.alert("Coming Soon", "Notifications page is coming soon!");
  };

  const handlePrivacy = () => {
    Alert.alert("Coming Soon", "Privacy & Security page is coming soon!");
  };

  const handleHelp = () => {
    Alert.alert("Coming Soon", "Help & Support page is coming soon!");
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/welcome");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to sign out. Please try again.");
          }
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: Settings,
      title: "Settings",
      subtitle: "App preferences and account settings",
      onPress: handleSettings,
    },
    {
      icon: CreditCard,
      title: "Payment Methods",
      subtitle: "Manage cards and payment options",
      onPress: handlePaymentMethods,
    },
    {
      icon: Bell,
      title: "Notifications",
      subtitle: "Push notifications and email alerts",
      onPress: handleNotifications,
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      subtitle: "Data privacy and account security",
      onPress: handlePrivacy,
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      subtitle: "Get help and contact support",
      onPress: handleHelp,
    },
  ];

  if (!fontsLoaded || !isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#666" }}>
          Loading...
        </Text>
      </View>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!isAuthenticated) {
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
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#2D2D2D" : "#E5E7EB",
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 28,
              color: isDark ? "#FFFFFF" : "#000000",
            }}
          >
            Profile
          </Text>
        </View>

        {/* Sign In Prompt */}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              backgroundColor: "#3B82F6",
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <User size={36} color="white" />
          </View>

          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: isDark ? "#FFFFFF" : "#1F2937",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Sign In Required
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: isDark ? "#B3B3B3" : "#6B7280",
              textAlign: "center",
              lineHeight: 24,
              marginBottom: 32,
            }}
          >
            Please sign in to view and manage your profile, bookings, and
            account settings.
          </Text>

          <TouchableOpacity
            onPress={signIn}
            style={{
              backgroundColor: "#3B82F6",
              paddingVertical: 16,
              paddingHorizontal: 32,
              borderRadius: 12,
              alignItems: "center",
              minWidth: 200,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#2D2D2D" : "#E5E7EB",
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 28,
            color: isDark ? "#FFFFFF" : "#000000",
          }}
        >
          Profile
        </Text>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* User Profile Section */}
          {user && (
            <View
              style={{
                backgroundColor: isDark ? "#1E1E1E" : "#F8F9FA",
                margin: 16,
                borderRadius: 16,
                padding: 20,
              }}
            >
              {/* Profile Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                {user.profile_image_url ? (
                  <Image
                    source={{ uri: user.profile_image_url }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      marginRight: 16,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: "#3B82F6",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 16,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 32,
                        fontWeight: "bold",
                      }}
                    >
                      {user.first_name
                        ? user.first_name.charAt(0).toUpperCase()
                        : user.email?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}

                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_700Bold",
                        fontSize: 20,
                        color: isDark ? "#FFFFFF" : "#000000",
                        flex: 1,
                      }}
                    >
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.email}
                    </Text>
                    {user.id_verified && (
                      <View
                        style={{
                          backgroundColor: "#10B981",
                          borderRadius: 4,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 10,
                            color: "#FFFFFF",
                          }}
                        >
                          VERIFIED
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: isDark ? "#B3B3B3" : "#6B7280",
                      marginBottom: 4,
                    }}
                  >
                    {user.email}
                  </Text>

                  {user.location_city && user.location_state && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <MapPin
                        size={12}
                        color={isDark ? "#8F8F8F" : "#9CA3AF"}
                      />
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: isDark ? "#8F8F8F" : "#9CA3AF",
                          marginLeft: 4,
                        }}
                      >
                        {user.location_city}, {user.location_state}
                      </Text>
                    </View>
                  )}

                  {user.user_type && (
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 12,
                        color: isDark ? "#8F8F8F" : "#9CA3AF",
                        textTransform: "capitalize",
                      }}
                    >
                      {user.user_type} Account
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={handleEditProfile}
                  style={{
                    backgroundColor: isDark ? "#2D2D2D" : "#E5E7EB",
                    borderRadius: 8,
                    padding: 8,
                  }}
                >
                  <Edit3 size={16} color={isDark ? "#FFFFFF" : "#000000"} />
                </TouchableOpacity>
              </View>

              {/* Profile Completion Prompt */}
              {!user.first_name && (
                <View
                  style={{
                    backgroundColor: "#FEF3C7",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#92400E",
                      marginBottom: 4,
                    }}
                  >
                    Complete Your Profile
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#B45309",
                      marginBottom: 8,
                    }}
                  >
                    Add your information to get the most out of ServiceHub
                  </Text>
                  <TouchableOpacity
                    onPress={handleEditProfile}
                    style={{
                      backgroundColor: "#F59E0B",
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 6,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      Complete Now
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* User Stats or Tasker Stats */}
              {hasTaskerProfile && taskerProfile ? (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: isDark ? "#2D2D2D" : "#E5E7EB",
                  }}
                >
                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        fontFamily: "Inter_700Bold",
                        fontSize: 20,
                        color: isDark ? "#FFFFFF" : "#000000",
                      }}
                    >
                      {taskerProfile.total_tasks_completed || 0}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 12,
                        color: isDark ? "#B3B3B3" : "#6B7280",
                      }}
                    >
                      Tasks Done
                    </Text>
                  </View>

                  <View style={{ alignItems: "center" }}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Star size={16} color="#F59E0B" />
                      <Text
                        style={{
                          fontFamily: "Inter_700Bold",
                          fontSize: 20,
                          color: isDark ? "#FFFFFF" : "#000000",
                          marginLeft: 4,
                        }}
                      >
                        {taskerProfile.avg_rating?.toFixed(1) || "N/A"}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 12,
                        color: isDark ? "#B3B3B3" : "#6B7280",
                      }}
                    >
                      Rating
                    </Text>
                  </View>

                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        fontFamily: "Inter_700Bold",
                        fontSize: 20,
                        color: "#16A34A",
                      }}
                    >
                      ${taskerProfile.hourly_rate || 0}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 12,
                        color: isDark ? "#B3B3B3" : "#6B7280",
                      }}
                    >
                      Hourly Rate
                    </Text>
                  </View>
                </View>
              ) : (
                stats &&
                user.first_name && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-around",
                      paddingTop: 16,
                      borderTopWidth: 1,
                      borderTopColor: isDark ? "#2D2D2D" : "#E5E7EB",
                    }}
                  >
                    <View style={{ alignItems: "center" }}>
                      <Text
                        style={{
                          fontFamily: "Inter_700Bold",
                          fontSize: 20,
                          color: isDark ? "#FFFFFF" : "#000000",
                        }}
                      >
                        {stats.totalBookings}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: isDark ? "#B3B3B3" : "#6B7280",
                        }}
                      >
                        Bookings
                      </Text>
                    </View>

                    <View style={{ alignItems: "center" }}>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Star size={16} color="#F59E0B" />
                        <Text
                          style={{
                            fontFamily: "Inter_700Bold",
                            fontSize: 20,
                            color: isDark ? "#FFFFFF" : "#000000",
                            marginLeft: 4,
                          }}
                        >
                          {stats.averageRating}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: isDark ? "#B3B3B3" : "#6B7280",
                        }}
                      >
                        Avg Rating
                      </Text>
                    </View>

                    <View style={{ alignItems: "center" }}>
                      <Text
                        style={{
                          fontFamily: "Inter_700Bold",
                          fontSize: 20,
                          color: "#16A34A",
                        }}
                      >
                        ${stats.totalSpent}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: isDark ? "#B3B3B3" : "#6B7280",
                        }}
                      >
                        Total Spent
                      </Text>
                    </View>
                  </View>
                )
              )}
            </View>
          )}

          {/* Manage Tasks - Show when hasTaskerProfile */}
          {user && hasTaskerProfile && (
            <TouchableOpacity
              onPress={() => router.push("/tasker-tasks")}
              style={{
                backgroundColor: isDark ? "#1E293B" : "#EFF6FF",
                margin: 16,
                marginTop: 0,
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: isDark ? "#3B82F6" : "#BFDBFE",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: "#3B82F6",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 16,
                  }}
                >
                  <ClipboardList size={24} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 16,
                      color: isDark ? "#FFFFFF" : "#1E40AF",
                      marginBottom: 4,
                    }}
                  >
                    Manage Tasks
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: isDark ? "#93C5FD" : "#3B82F6",
                    }}
                  >
                    View and manage your assigned tasks
                  </Text>
                </View>
                <ChevronRight size={20} color="#3B82F6" />
              </View>
            </TouchableOpacity>
          )}

          {/* Become a Tasker CTA - Show when !hasTaskerProfile */}
          {user && !hasTaskerProfile && (
            <TouchableOpacity
              onPress={() => router.push("/become-tasker")}
              style={{
                backgroundColor: isDark ? "#1E3A2F" : "#ECFDF5",
                margin: 16,
                marginTop: 0,
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: isDark ? "#10B981" : "#A7F3D0",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: "#10B981",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 16,
                  }}
                >
                  <Briefcase size={24} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 16,
                      color: isDark ? "#FFFFFF" : "#065F46",
                      marginBottom: 4,
                    }}
                  >
                    Become a Service Provider
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: isDark ? "#A7F3D0" : "#047857",
                    }}
                  >
                    Start earning by offering your services
                  </Text>
                </View>
                <ChevronRight size={20} color="#10B981" />
              </View>
            </TouchableOpacity>
          )}

          {/* Menu Items */}
          <View style={{ paddingHorizontal: 16 }}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  backgroundColor: isDark ? "#1E1E1E" : "#F8F9FA",
                  borderRadius: 12,
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    backgroundColor: isDark ? "#2D2D2D" : "#E5E7EB",
                    borderRadius: 8,
                    padding: 8,
                    marginRight: 16,
                  }}
                >
                  <item.icon size={20} color={isDark ? "#FFFFFF" : "#000000"} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 16,
                      color: isDark ? "#FFFFFF" : "#000000",
                      marginBottom: 2,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: isDark ? "#B3B3B3" : "#6B7280",
                    }}
                  >
                    {item.subtitle}
                  </Text>
                </View>

                <ChevronRight
                  size={20}
                  color={isDark ? "#8F8F8F" : "#9E9E9E"}
                />
              </TouchableOpacity>
            ))}

            {/* Logout Button */}
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 16,
                paddingHorizontal: 16,
                backgroundColor: isDark ? "#2D1B1B" : "#FEF2F2",
                borderRadius: 12,
                marginTop: 20,
              }}
            >
              <View
                style={{
                  backgroundColor: "#EF444420",
                  borderRadius: 8,
                  padding: 8,
                  marginRight: 16,
                }}
              >
                <LogOut size={20} color="#EF4444" />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: "#EF4444",
                    marginBottom: 2,
                  }}
                >
                  Sign Out
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: isDark ? "#B85C5C" : "#DC2626",
                  }}
                >
                  Sign out of your account
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View
            style={{
              alignItems: "center",
              paddingVertical: 24,
              paddingHorizontal: 16,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                color: isDark ? "#8F8F8F" : "#9CA3AF",
                textAlign: "center",
              }}
            >
              ServiceHub v1.0.0
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                color: isDark ? "#8F8F8F" : "#9CA3AF",
                textAlign: "center",
                marginTop: 4,
              }}
            >
              Connecting you with local service providers
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
