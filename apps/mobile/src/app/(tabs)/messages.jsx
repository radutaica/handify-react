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
  MessageCircle,
  Search,
  Clock,
  CheckCheck,
  Check,
} from "lucide-react-native";
import { Image } from "expo-image";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function MessagesPage() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [conversations, setConversations] = useState([]);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    // Mock conversations data - will be replaced with API call
    const mockConversations = [
      {
        id: "1",
        providerId: "1",
        providerName: "Mike's Plumbing",
        providerImage: "https://via.placeholder.com/50",
        category: "Plumbing",
        lastMessage:
          "I'll be there at 10 AM sharp tomorrow. Please make sure the area under the sink is clear.",
        lastMessageTime: "2024-11-26T18:30:00Z",
        unreadCount: 2,
        isRead: false,
        status: "delivered", // sent, delivered, read
        isOnline: true,
        bookingId: "1",
      },
      {
        id: "2",
        providerId: "2",
        providerName: "Elite Auto Repair",
        providerImage: "https://via.placeholder.com/50",
        category: "Car Repair",
        lastMessage:
          "Your car is ready for pickup! Oil change completed successfully.",
        lastMessageTime: "2024-11-26T15:45:00Z",
        unreadCount: 0,
        isRead: true,
        status: "read",
        isOnline: false,
        lastOnline: "2024-11-26T16:00:00Z",
        bookingId: "2",
      },
      {
        id: "3",
        providerId: "3",
        providerName: "Bella Hair Studio",
        providerImage: "https://via.placeholder.com/50",
        category: "Hair Salon",
        lastMessage:
          "Thank you for your business! Please rate your experience.",
        lastMessageTime: "2024-11-25T19:20:00Z",
        unreadCount: 0,
        isRead: true,
        status: "read",
        isOnline: false,
        lastOnline: "2024-11-25T20:00:00Z",
        bookingId: "3",
      },
      {
        id: "4",
        providerId: "4",
        providerName: "Quick Fix Electrical",
        providerImage: "https://via.placeholder.com/50",
        category: "Electrical",
        lastMessage:
          "Unfortunately, I need to reschedule our appointment due to an emergency call.",
        lastMessageTime: "2024-11-24T12:15:00Z",
        unreadCount: 1,
        isRead: false,
        status: "delivered",
        isOnline: true,
        bookingId: "4",
      },
    ];
    setConversations(mockConversations);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes < 1 ? "now" : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 ? "1d" : `${diffInDays}d`;
    }
  };

  const getMessageStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return <Check size={12} color="#6B7280" />;
      case "delivered":
        return <CheckCheck size={12} color="#6B7280" />;
      case "read":
        return <CheckCheck size={12} color="#3B82F6" />;
      default:
        return null;
    }
  };

  const handleConversationPress = (conversation) => {
    router.push({
      pathname: "/chat",
      params: {
        conversationId: conversation.id,
        providerId: conversation.providerId,
        providerName: conversation.providerName,
        bookingId: conversation.bookingId,
      },
    });
  };

  const handleSearchPress = () => {
    // Open search modal or navigate to search page
    console.log("Search pressed");
  };

  if (!fontsLoaded) {
    return null;
  }

  // Sort conversations by last message time
  const sortedConversations = [...conversations].sort(
    (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime),
  );

  const unreadCount = conversations.reduce(
    (total, conv) => total + conv.unreadCount,
    0,
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
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#2D2D2D" : "#E5E7EB",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 28,
              color: isDark ? "#FFFFFF" : "#000000",
            }}
          >
            Messages
          </Text>
          {unreadCount > 0 && (
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: isDark ? "#B3B3B3" : "#6B7280",
                marginTop: 4,
              }}
            >
              {unreadCount} unread message{unreadCount > 1 ? "s" : ""}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleSearchPress}
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
            borderRadius: 8,
            padding: 8,
          }}
        >
          <Search size={20} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Conversations List */}
        <View>
          {sortedConversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              onPress={() => handleConversationPress(conversation)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "#1E1E1E" : "#F3F4F6",
                backgroundColor:
                  conversation.unreadCount > 0
                    ? isDark
                      ? "#1A1A2E"
                      : "#F8F9FF"
                    : isDark
                      ? "#121212"
                      : "#FFFFFF",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {/* Provider Avatar */}
                <View style={{ position: "relative", marginRight: 12 }}>
                  <Image
                    source={{ uri: conversation.providerImage }}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                    }}
                    contentFit="cover"
                    transition={100}
                  />

                  {/* Online Status Indicator */}
                  {conversation.isOnline && (
                    <View
                      style={{
                        position: "absolute",
                        bottom: 2,
                        right: 2,
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: "#10B981",
                        borderWidth: 2,
                        borderColor: isDark ? "#121212" : "#FFFFFF",
                      }}
                    />
                  )}
                </View>

                {/* Conversation Content */}
                <View style={{ flex: 1 }}>
                  {/* Header Row */}
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
                      {conversation.providerName}
                    </Text>

                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      {getMessageStatusIcon(conversation.status)}
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: isDark ? "#8F8F8F" : "#9CA3AF",
                          marginLeft: 4,
                        }}
                      >
                        {formatTime(conversation.lastMessageTime)}
                      </Text>
                    </View>
                  </View>

                  {/* Category */}
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: isDark ? "#8F8F8F" : "#9CA3AF",
                      marginBottom: 6,
                    }}
                  >
                    {conversation.category}
                  </Text>

                  {/* Last Message */}
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        fontFamily:
                          conversation.unreadCount > 0
                            ? "Inter_600SemiBold"
                            : "Inter_400Regular",
                        fontSize: 14,
                        color:
                          conversation.unreadCount > 0
                            ? isDark
                              ? "#FFFFFF"
                              : "#000000"
                            : isDark
                              ? "#B3B3B3"
                              : "#6B7280",
                        flex: 1,
                        lineHeight: 20,
                      }}
                      numberOfLines={2}
                    >
                      {conversation.lastMessage}
                    </Text>

                    {/* Unread Badge */}
                    {conversation.unreadCount > 0 && (
                      <View
                        style={{
                          backgroundColor: "#3B82F6",
                          borderRadius: 12,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          marginLeft: 12,
                          minWidth: 20,
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
                          {conversation.unreadCount > 9
                            ? "9+"
                            : conversation.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Last Online (if not online) */}
                  {!conversation.isOnline && conversation.lastOnline && (
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 11,
                        color: isDark ? "#8F8F8F" : "#9CA3AF",
                        marginTop: 4,
                      }}
                    >
                      Last seen {formatTime(conversation.lastOnline)}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Empty State */}
          {conversations.length === 0 && (
            <View
              style={{
                alignItems: "center",
                paddingVertical: 80,
                paddingHorizontal: 20,
              }}
            >
              <MessageCircle size={64} color={isDark ? "#3D3D3D" : "#E5E5E5"} />
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
                No messages yet
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
                When you book services, you'll be able to message providers
                directly to coordinate details.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/search")}
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
                  Find Services
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
