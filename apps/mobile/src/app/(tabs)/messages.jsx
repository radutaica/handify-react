import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  RefreshControl,
  ActivityIndicator,
  AppState,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import {
  MessageCircle,
  Search,
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
import { messagesApi } from "@/api";
import { useCurrentUser } from "@/utils/auth";

const POLL_INTERVAL = 15000;
const ONLINE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

export default function MessagesPage() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useCurrentUser();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const pollIntervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  const loadConversations = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const response = await messagesApi.getConversations();
      const data = Array.isArray(response) ? response : response.data || [];
      setConversations(data);
    } catch (err) {
      console.error("Error loading conversations:", err);
      setError("Nu am putut incarca mesajele. Trage in jos pentru a reincerca.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadConversations(true);
  }, [loadConversations]);

  // Polling with AppState awareness
  useEffect(() => {
    const startPolling = () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(() => loadConversations(false), POLL_INTERVAL);
    };

    const stopPolling = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };

    startPolling();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        loadConversations(false);
        startPolling();
      } else if (nextAppState.match(/inactive|background/)) {
        stopPolling();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      stopPolling();
      subscription.remove();
    };
  }, [loadConversations]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadConversations(false);
  }, [loadConversations]);

  const isUserOnline = (lastActiveAt) => {
    if (!lastActiveAt) return false;
    return Date.now() - new Date(lastActiveAt).getTime() < ONLINE_THRESHOLD;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes < 1 ? "acum" : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 ? "1z" : `${diffInDays}z`;
    }
  };

  const getMessageStatusIcon = (conversation) => {
    const lastMsg = conversation.last_message;
    if (!lastMsg || lastMsg.sender_id !== user?.id) return null;

    if (lastMsg.is_read) {
      return <CheckCheck size={12} color="#3B82F6" />;
    }
    return <Check size={12} color="#6B7280" />;
  };

  const handleConversationPress = (conversation) => {
    const otherUser = conversation.other_user;
    router.push({
      pathname: `/chat/${conversation.id}`,
      params: {
        contextId: conversation.context_id,
        contextType: conversation.type,
        receiverId: otherUser.id,
        receiverName: `${otherUser.first_name} ${otherUser.last_name}`.trim(),
        receiverImage: otherUser.profile_image_url || "",
      },
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  const unreadCount = conversations.reduce(
    (total, conv) => total + (conv.unread_count || 0),
    0
  );

  const renderConversation = ({ item: conversation }) => {
    const otherUser = conversation.other_user;
    const lastMsg = conversation.last_message;
    const online = isUserOnline(otherUser?.last_active_at);
    const hasUnread = (conversation.unread_count || 0) > 0;

    return (
      <TouchableOpacity
        onPress={() => handleConversationPress(conversation)}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#1E1E1E" : "#F3F4F6",
          backgroundColor: hasUnread
            ? isDark
              ? "#1A1A2E"
              : "#F8F9FF"
            : isDark
              ? "#121212"
              : "#FFFFFF",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Avatar */}
          <View style={{ position: "relative", marginRight: 12 }}>
            {otherUser?.profile_image_url ? (
              <Image
                source={{ uri: otherUser.profile_image_url }}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                }}
                contentFit="cover"
                transition={100}
              />
            ) : (
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: isDark ? "#3D3D3D" : "#E5E7EB",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 18,
                    color: isDark ? "#FFFFFF" : "#6B7280",
                  }}
                >
                  {otherUser?.first_name?.[0]?.toUpperCase() || "?"}
                </Text>
              </View>
            )}

            {/* Online Status */}
            {online && (
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

          {/* Content */}
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
                numberOfLines={1}
              >
                {otherUser
                  ? `${otherUser.first_name} ${otherUser.last_name}`.trim()
                  : "Unknown"}
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {getMessageStatusIcon(conversation)}
                {lastMsg && (
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: isDark ? "#8F8F8F" : "#9CA3AF",
                      marginLeft: 4,
                    }}
                  >
                    {formatTime(lastMsg.created_at)}
                  </Text>
                )}
              </View>
            </View>

            {/* Context Title */}
            {conversation.context_title && (
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: isDark ? "#8F8F8F" : "#9CA3AF",
                  marginBottom: 6,
                }}
                numberOfLines={1}
              >
                {conversation.context_title}
              </Text>
            )}

            {/* Last Message */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: hasUnread ? "Inter_600SemiBold" : "Inter_400Regular",
                  fontSize: 14,
                  color: hasUnread
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
                {lastMsg?.message || ""}
              </Text>

              {/* Unread Badge */}
              {hasUnread && (
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
                    {conversation.unread_count > 9
                      ? "9+"
                      : conversation.unread_count}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
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
            Mesaje
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
              {unreadCount} mesaje necitite
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
            borderRadius: 8,
            padding: 8,
          }}
        >
          <Search size={20} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading && (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}

      {/* Error State */}
      {!loading && error && conversations.length === 0 && (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: isDark ? "#8F8F8F" : "#9CA3AF",
              textAlign: "center",
            }}
          >
            {error}
          </Text>
        </View>
      )}

      {/* Conversations List */}
      {!loading && (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
            />
          }
          contentContainerStyle={{
            paddingBottom: insets.bottom + 20,
            flexGrow: conversations.length === 0 ? 1 : undefined,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !error ? (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 80,
                  paddingHorizontal: 20,
                }}
              >
                <MessageCircle
                  size={64}
                  color={isDark ? "#3D3D3D" : "#E5E5E5"}
                />
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
                  Niciun mesaj
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
                  Cand rezervi servicii, vei putea trimite mesaje direct
                  prestatorilor pentru a coordona detaliile.
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
                    Cauta servicii
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
