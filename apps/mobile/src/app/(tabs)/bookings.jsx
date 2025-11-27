import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
} from "lucide-react-native";
import { Image } from "expo-image";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function BookingsPage() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selectedTab, setSelectedTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    // Mock bookings data - will be replaced with API call
    const mockBookings = [
      {
        id: "1",
        type: "upcoming",
        providerId: "1",
        providerName: "Mike's Plumbing",
        providerImage: "https://via.placeholder.com/60",
        service: "Emergency Leak Repair",
        category: "Plumbing",
        scheduledDate: "2024-11-27",
        scheduledTime: "10:00 AM",
        status: "confirmed",
        location: "123 Main St, City",
        price: "$150",
        estimatedDuration: "1-2 hours",
        description: "Fix leaking pipe under kitchen sink",
        rating: 4.8,
      },
      {
        id: "2",
        type: "upcoming",
        providerId: "2",
        providerName: "Elite Auto Repair",
        providerImage: "https://via.placeholder.com/60",
        service: "Oil Change & Inspection",
        category: "Car Repair",
        scheduledDate: "2024-11-28",
        scheduledTime: "2:00 PM",
        status: "pending",
        location: "456 Oak Ave, City",
        price: "$75",
        estimatedDuration: "30 mins",
        description: "Regular maintenance service",
        rating: 4.9,
      },
      {
        id: "3",
        type: "completed",
        providerId: "3",
        providerName: "Bella Hair Studio",
        providerImage: "https://via.placeholder.com/60",
        service: "Haircut & Style",
        category: "Hair Salon",
        scheduledDate: "2024-11-20",
        scheduledTime: "3:00 PM",
        status: "completed",
        location: "789 Pine St, City",
        price: "$65",
        estimatedDuration: "45 mins",
        description: "Trim and styling",
        rating: 4.7,
        userRating: null, // User hasn't rated yet
        completedAt: "2024-11-20T16:45:00Z",
      },
      {
        id: "4",
        type: "cancelled",
        providerId: "4",
        providerName: "Quick Fix Electrical",
        providerImage: "https://via.placeholder.com/60",
        service: "Outlet Installation",
        category: "Electrical",
        scheduledDate: "2024-11-25",
        scheduledTime: "11:00 AM",
        status: "cancelled",
        location: "321 Elm St, City",
        price: "$120",
        estimatedDuration: "1 hour",
        description: "Install new outlet in living room",
        rating: 4.6,
        cancelledAt: "2024-11-24T09:30:00Z",
        cancelledBy: "user",
        cancelReason: "Schedule conflict",
      },
    ];
    setBookings(mockBookings);
  };

  const getFilteredBookings = () => {
    switch (selectedTab) {
      case "upcoming":
        return bookings.filter(
          (booking) =>
            booking.status === "confirmed" || booking.status === "pending",
        );
      case "completed":
        return bookings.filter((booking) => booking.status === "completed");
      case "cancelled":
        return bookings.filter((booking) => booking.status === "cancelled");
      default:
        return bookings;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle size={16} color="#10B981" />;
      case "pending":
        return <AlertCircle size={16} color="#F59E0B" />;
      case "completed":
        return <CheckCircle size={16} color="#10B981" />;
      case "cancelled":
        return <XCircle size={16} color="#EF4444" />;
      default:
        return <Clock size={16} color="#6B7280" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "#10B981";
      case "pending":
        return "#F59E0B";
      case "completed":
        return "#10B981";
      case "cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const handleBookingPress = (booking) => {
    router.push(`/(tabs)/booking/${booking.id}`);
  };

  const handleMessagePress = (booking) => {
    router.push({
      pathname: "/messages",
      params: { providerId: booking.providerId },
    });
  };

  const handleCreateBooking = () => {
    router.push("/(tabs)/service-request");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  const filteredBookings = getFilteredBookings();
  const tabs = [
    {
      id: "upcoming",
      label: "Upcoming",
      count: bookings.filter(
        (b) => b.status === "confirmed" || b.status === "pending",
      ).length,
    },
    {
      id: "completed",
      label: "Completed",
      count: bookings.filter((b) => b.status === "completed").length,
    },
    {
      id: "cancelled",
      label: "Cancelled",
      count: bookings.filter((b) => b.status === "cancelled").length,
    },
  ];

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
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 28,
            color: isDark ? "#FFFFFF" : "#000000",
          }}
        >
          Bookings
        </Text>

        <TouchableOpacity
          onPress={handleCreateBooking}
          style={{
            backgroundColor: "#000000",
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 14,
              color: "#FFFFFF",
              marginLeft: 6,
            }}
          >
            New
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#2D2D2D" : "#E5E7EB",
        }}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setSelectedTab(tab.id)}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 8,
              borderBottomWidth: selectedTab === tab.id ? 2 : 0,
              borderBottomColor: "#000000",
            }}
          >
            <Text
              style={{
                fontFamily:
                  selectedTab === tab.id
                    ? "Inter_600SemiBold"
                    : "Inter_400Regular",
                fontSize: 16,
                color:
                  selectedTab === tab.id
                    ? isDark
                      ? "#FFFFFF"
                      : "#000000"
                    : isDark
                      ? "#8F8F8F"
                      : "#6B7280",
                marginBottom: 4,
              }}
            >
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View
                style={{
                  backgroundColor: isDark ? "#3B82F6" : "#DBEAFE",
                  borderRadius: 10,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 12,
                    color: isDark ? "#FFFFFF" : "#1E40AF",
                  }}
                >
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Booking List */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {filteredBookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              onPress={() => handleBookingPress(booking)}
              style={{
                backgroundColor: isDark ? "#1E1E1E" : "#F8F9FA",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}
            >
              {/* Booking Header */}
              <View style={{ flexDirection: "row", marginBottom: 12 }}>
                <Image
                  source={{ uri: booking.providerImage }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 8,
                    marginRight: 12,
                  }}
                  contentFit="cover"
                  transition={100}
                />

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
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 16,
                        color: isDark ? "#FFFFFF" : "#000000",
                        flex: 1,
                      }}
                    >
                      {booking.service}
                    </Text>
                    {getStatusIcon(booking.status)}
                  </View>

                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: isDark ? "#B3B3B3" : "#6B7280",
                      marginBottom: 4,
                    }}
                  >
                    {booking.providerName} • {booking.category}
                  </Text>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Star size={12} color="#F59E0B" />
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 12,
                        color: isDark ? "#B3B3B3" : "#6B7280",
                        marginLeft: 4,
                      }}
                    >
                      {booking.rating}
                    </Text>
                  </View>
                </View>

                {selectedTab === "upcoming" && (
                  <TouchableOpacity
                    onPress={() => handleMessagePress(booking)}
                    style={{
                      backgroundColor: isDark ? "#2D2D2D" : "#E5E7EB",
                      borderRadius: 8,
                      padding: 8,
                      marginLeft: 8,
                    }}
                  >
                    <MessageCircle
                      size={16}
                      color={isDark ? "#FFFFFF" : "#000000"}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Booking Details */}
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: isDark ? "#B3B3B3" : "#6B7280",
                  marginBottom: 12,
                  lineHeight: 20,
                }}
              >
                {booking.description}
              </Text>

              {/* Date and Time */}
              <View style={{ flexDirection: "row", marginBottom: 8 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <Calendar size={14} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: isDark ? "#8F8F8F" : "#9CA3AF",
                      marginLeft: 6,
                    }}
                  >
                    {formatDate(booking.scheduledDate)}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <Clock size={14} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: isDark ? "#8F8F8F" : "#9CA3AF",
                      marginLeft: 6,
                    }}
                  >
                    {booking.scheduledTime} ({booking.estimatedDuration})
                  </Text>
                </View>
              </View>

              {/* Location */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <MapPin size={14} color={isDark ? "#8F8F8F" : "#9CA3AF"} />
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: isDark ? "#8F8F8F" : "#9CA3AF",
                    marginLeft: 6,
                    flex: 1,
                  }}
                >
                  {booking.location}
                </Text>
              </View>

              {/* Status and Price */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: `${getStatusColor(booking.status)}20`,
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 12,
                      color: getStatusColor(booking.status),
                      textTransform: "capitalize",
                    }}
                  >
                    {booking.status}
                  </Text>
                </View>

                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: "#16A34A",
                  }}
                >
                  {booking.price}
                </Text>
              </View>

              {/* Cancellation Info */}
              {booking.status === "cancelled" && booking.cancelReason && (
                <View
                  style={{
                    backgroundColor: isDark ? "#2D1B1B" : "#FEF2F2",
                    borderRadius: 6,
                    padding: 8,
                    marginTop: 8,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: "#EF4444",
                    }}
                  >
                    Cancelled by {booking.cancelledBy}: {booking.cancelReason}
                  </Text>
                </View>
              )}

              {/* Rating Prompt for Completed Services */}
              {booking.status === "completed" && !booking.userRating && (
                <TouchableOpacity
                  style={{
                    backgroundColor: "#000000",
                    borderRadius: 6,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    marginTop: 8,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 12,
                      color: "#FFFFFF",
                    }}
                  >
                    Rate this service
                  </Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}

          {/* Empty State */}
          {filteredBookings.length === 0 && (
            <View
              style={{
                alignItems: "center",
                paddingVertical: 60,
                paddingHorizontal: 20,
              }}
            >
              <Calendar size={64} color={isDark ? "#3D3D3D" : "#E5E5E5"} />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: isDark ? "#B3B3B3" : "#374151",
                  textAlign: "center",
                  marginTop: 24,
                  marginBottom: 8,
                }}
              >
                No {selectedTab} bookings
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: isDark ? "#8F8F8F" : "#9CA3AF",
                  textAlign: "center",
                  lineHeight: 20,
                  marginBottom: 24,
                }}
              >
                {selectedTab === "upcoming"
                  ? "You don't have any upcoming appointments. Book a service to get started."
                  : `You don't have any ${selectedTab} bookings yet.`}
              </Text>
              {selectedTab === "upcoming" && (
                <TouchableOpacity
                  onPress={handleCreateBooking}
                  style={{
                    backgroundColor: "#000000",
                    borderRadius: 8,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                      color: "#FFFFFF",
                    }}
                  >
                    Book a Service
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
