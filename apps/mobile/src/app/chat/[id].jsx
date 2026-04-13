import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  useColorScheme,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  AppState,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { messagesApi } from "@/api";
import { useCurrentUser } from "@/utils/auth";
import {
  ChevronLeft,
  Send,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
} from "lucide-react-native";
import { Image } from "expo-image";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

const POLL_INTERVAL = 5000;

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { id, contextId, contextType, receiverId, receiverName, receiverImage, lastActiveAt } =
    useLocalSearchParams();
  const { user } = useCurrentUser();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const flatListRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const latestMessageTimeRef = useRef(null);
  const tempIdCounter = useRef(0);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  const getFilterParams = useCallback(() => {
    if (contextType === "direct_request") {
      return { direct_request_id: contextId };
    }
    return { task_id: contextId };
  }, [contextId, contextType]);

  // Load initial messages
  const loadMessages = useCallback(async () => {
    try {
      const response = await messagesApi.getMessages({
        ...getFilterParams(),
        per_page: 50,
      });
      const data = Array.isArray(response) ? response : response.data || [];
      setMessages(data);
      if (data.length > 0) {
        latestMessageTimeRef.current = data[data.length - 1].created_at;
      }
      setHasMore(data.length >= 50);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  }, [getFilterParams]);

  // Mark all as read on mount
  const markConversationRead = useCallback(async () => {
    try {
      await messagesApi.markAllAsRead(getFilterParams());
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  }, [getFilterParams]);

  // Poll for new messages
  const pollNewMessages = useCallback(async () => {
    if (!latestMessageTimeRef.current) return;

    try {
      const response = await messagesApi.getMessages({
        ...getFilterParams(),
        created_after: latestMessageTimeRef.current,
      });
      const newMessages = Array.isArray(response) ? response : response.data || [];

      if (newMessages.length > 0) {
        setMessages((prev) => {
          // Filter out any temp messages that now have server versions
          const serverIds = new Set(newMessages.map((m) => m.id));
          const filtered = prev.filter(
            (m) => !m._tempId || !serverIds.has(m.id)
          );
          return [...filtered, ...newMessages];
        });
        latestMessageTimeRef.current =
          newMessages[newMessages.length - 1].created_at;

        // Mark new incoming messages as read
        const hasIncoming = newMessages.some(
          (m) => m.sender?.id !== user?.id
        );
        if (hasIncoming) {
          markConversationRead();
        }
      }
    } catch (error) {
      console.error("Error polling messages:", error);
    }
  }, [getFilterParams, user?.id, markConversationRead]);

  // Load older messages (pagination)
  const loadOlderMessages = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await messagesApi.getMessages({
        ...getFilterParams(),
        page: nextPage,
        per_page: 50,
      });
      const olderMessages = Array.isArray(response)
        ? response
        : response.data || [];

      if (olderMessages.length > 0) {
        setMessages((prev) => [...olderMessages, ...prev]);
        setPage(nextPage);
      }
      setHasMore(olderMessages.length >= 50);
    } catch (error) {
      console.error("Error loading older messages:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, getFilterParams]);

  // Initial load
  useEffect(() => {
    loadMessages();
    markConversationRead();
  }, [loadMessages, markConversationRead]);

  // Polling with AppState awareness
  useEffect(() => {
    const startPolling = () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(pollNewMessages, POLL_INTERVAL);
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
        pollNewMessages();
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
  }, [pollNewMessages]);

  // Send message
  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    const tempId = `temp-${++tempIdCounter.current}`;
    const optimisticMessage = {
      id: tempId,
      _tempId: tempId,
      _status: "sending",
      message: text,
      sender: {
        id: user?.id,
        first_name: user?.first_name,
        last_name: user?.last_name,
        profile_image_url: user?.profile_image_url,
      },
      receiver: {
        id: receiverId,
      },
      task_id: contextType === "task" ? contextId : null,
      direct_request_id: contextType === "direct_request" ? contextId : null,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setInputText("");
    setMessages((prev) => [...prev, optimisticMessage]);
    setSending(true);

    try {
      const messageData = {
        receiver_id: receiverId,
        message: text,
      };
      if (contextType === "direct_request") {
        messageData.direct_request_id = contextId;
      } else {
        messageData.task_id = contextId;
      }

      const response = await messagesApi.sendMessage(messageData);
      const serverMessage = response.data || response;

      setMessages((prev) =>
        prev.map((m) =>
          m._tempId === tempId
            ? { ...serverMessage, _status: "sent" }
            : m
        )
      );

      latestMessageTimeRef.current =
        serverMessage.created_at || optimisticMessage.created_at;
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m._tempId === tempId ? { ...m, _status: "failed" } : m
        )
      );
    } finally {
      setSending(false);
    }
  }, [inputText, sending, user, receiverId, contextType, contextId]);

  // Retry failed message
  const handleRetry = useCallback(
    async (failedMessage) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._tempId === failedMessage._tempId
            ? { ...m, _status: "sending" }
            : m
        )
      );

      try {
        const messageData = {
          receiver_id: receiverId,
          message: failedMessage.message,
        };
        if (contextType === "direct_request") {
          messageData.direct_request_id = contextId;
        } else {
          messageData.task_id = contextId;
        }

        const response = await messagesApi.sendMessage(messageData);
        const serverMessage = response.data || response;

        setMessages((prev) =>
          prev.map((m) =>
            m._tempId === failedMessage._tempId
              ? { ...serverMessage, _status: "sent" }
              : m
          )
        );
        latestMessageTimeRef.current = serverMessage.created_at;
      } catch (error) {
        console.error("Error retrying message:", error);
        setMessages((prev) =>
          prev.map((m) =>
            m._tempId === failedMessage._tempId
              ? { ...m, _status: "failed" }
              : m
          )
        );
      }
    },
    [receiverId, contextType, contextId]
  );

  const getStatusIcon = (message) => {
    if (message._status === "sending") {
      return <Clock size={12} color="#93C5FD" />;
    }
    if (message._status === "failed") {
      return <AlertCircle size={12} color="#EF4444" />;
    }
    if (message.is_read) {
      return <CheckCheck size={12} color="#93C5FD" />;
    }
    return <Check size={12} color="#93C5FD" />;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateSeparator = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Azi";
    if (diffDays === 1) return "Ieri";
    return date.toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "long",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const shouldShowDateSeparator = (message, index, data) => {
    if (index === 0) return true;
    const prevDate = new Date(data[index - 1].created_at).toDateString();
    const currDate = new Date(message.created_at).toDateString();
    return prevDate !== currDate;
  };

  // Derive online status from the lastActiveAt param passed by conversations list
  const isOnline = lastActiveAt
    ? Date.now() - new Date(lastActiveAt).getTime() < 5 * 60 * 1000
    : false;

  const renderMessage = ({ item: message, index }) => {
    const isOutgoing = message.sender?.id === user?.id;
    const showDate = shouldShowDateSeparator(message, index, messages);

    return (
      <View>
        {showDate && (
          <View
            style={{
              alignItems: "center",
              marginVertical: 16,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                color: isDark ? "#8F8F8F" : "#9CA3AF",
                backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {formatDateSeparator(message.created_at)}
            </Text>
          </View>
        )}

        <View
          style={{
            alignSelf: isOutgoing ? "flex-end" : "flex-start",
            maxWidth: "80%",
            marginHorizontal: 16,
            marginVertical: 2,
          }}
        >
          <View
            style={{
              backgroundColor: isOutgoing
                ? "#3B82F6"
                : isDark
                  ? "#2D2D2D"
                  : "#F3F4F6",
              borderRadius: 16,
              borderTopRightRadius: isOutgoing ? 4 : 16,
              borderTopLeftRadius: isOutgoing ? 16 : 4,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 15,
                color: isOutgoing ? "#FFFFFF" : isDark ? "#FFFFFF" : "#111827",
                lineHeight: 21,
              }}
            >
              {message.message}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                marginTop: 4,
                gap: 4,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 11,
                  color: isOutgoing
                    ? "rgba(255,255,255,0.7)"
                    : isDark
                      ? "#8F8F8F"
                      : "#9CA3AF",
                }}
              >
                {formatTime(message.created_at)}
              </Text>
              {isOutgoing && getStatusIcon(message)}
            </View>
          </View>

          {message._status === "failed" && (
            <TouchableOpacity
              onPress={() => handleRetry(message)}
              style={{
                alignSelf: "flex-end",
                marginTop: 4,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: "#EF4444",
                }}
              >
                Trimiterea a esuat. Apasa pentru a reincerca.
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
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

        <View style={{ position: "relative", marginLeft: 12 }}>
          {receiverImage ? (
            <Image
              source={{ uri: receiverImage }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
              }}
              contentFit="cover"
              transition={100}
            />
          ) : (
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isDark ? "#3D3D3D" : "#E5E7EB",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: isDark ? "#FFFFFF" : "#6B7280",
                }}
              >
                {receiverName?.[0]?.toUpperCase() || "?"}
              </Text>
            </View>
          )}
        </View>

        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              color: isDark ? "#FFFFFF" : "#111827",
            }}
          >
            {receiverName || "Chat"}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id?.toString() || item._tempId}
          contentContainerStyle={{
            paddingVertical: 8,
            flexGrow: 1,
            justifyContent: messages.length === 0 ? "center" : "flex-end",
          }}
          onEndReached={loadOlderMessages}
          onEndReachedThreshold={0.1}
          ListHeaderComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 16, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#3B82F6" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingHorizontal: 20 }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: isDark ? "#B3B3B3" : "#6B7280",
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                Niciun mesaj inca
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: isDark ? "#8F8F8F" : "#9CA3AF",
                  textAlign: "center",
                }}
              >
                Trimite un mesaj pentru a incepe conversatia.
              </Text>
            </View>
          }
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
        />

        {/* Input Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            paddingHorizontal: 16,
            paddingVertical: 12,
            paddingBottom: insets.bottom + 12,
            backgroundColor: isDark ? "#121212" : "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: isDark ? "#2D2D2D" : "#E5E7EB",
          }}
        >
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Scrie un mesaj..."
            placeholderTextColor={isDark ? "#8F8F8F" : "#9CA3AF"}
            multiline
            maxLength={2000}
            style={{
              flex: 1,
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              color: isDark ? "#FFFFFF" : "#111827",
              backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
              borderRadius: 24,
              paddingHorizontal: 16,
              paddingTop: 10,
              paddingBottom: 10,
              maxHeight: 120,
              minHeight: 44,
            }}
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor:
                inputText.trim() && !sending ? "#3B82F6" : isDark ? "#2D2D2D" : "#E5E7EB",
              justifyContent: "center",
              alignItems: "center",
              marginLeft: 8,
            }}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send
                size={20}
                color={inputText.trim() ? "#FFFFFF" : isDark ? "#8F8F8F" : "#9CA3AF"}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
