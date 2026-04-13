import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { useCurrentUser } from "@/utils/auth";
import { tasksApi, bidsApi, reviewsApi } from "@/api";
import {
  TASK_STATUS_CONFIG,
  URGENCY_CONFIG,
  mapBidToCard,
  formatTaskDate,
} from "@/utils/mapTaskData";
import StatusTimeline from "@/components/StatusTimeline";
import {
  ChevronLeft,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  User,
  Star,
  MessageCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Inbox,
} from "lucide-react-native";
import { Image } from "expo-image";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

function SectionCard({ title, children, isDark }) {
  return (
    <View
      style={{
        backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: isDark ? "#2D2D2D" : "#E5E7EB",
      }}
    >
      {title && (
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 14,
            color: isDark ? "#8F8F8F" : "#6B7280",
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}

function InfoRow({ icon: Icon, label, value, isDark }) {
  if (!value) return null;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: isDark ? "#2D2D2D" : "#F3F4F6",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        <Icon size={16} color={isDark ? "#8F8F8F" : "#6B7280"} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 12,
            color: isDark ? "#8F8F8F" : "#9CA3AF",
            marginBottom: 2,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 15,
            color: isDark ? "#FFFFFF" : "#111827",
          }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function BidCard({ bid, isDark, onAccept }) {
  return (
    <View
      style={{
        backgroundColor: isDark ? "#2D2D2D" : "#F9FAFB",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      }}
    >
      {/* Tasker info */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: isDark ? "#4B5563" : "#E5E7EB",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          {bid.taskerAvatar ? (
            <Image
              source={{ uri: bid.taskerAvatar }}
              style={{ width: 44, height: 44, borderRadius: 22 }}
              contentFit="cover"
            />
          ) : (
            <User size={22} color={isDark ? "#9CA3AF" : "#6B7280"} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              color: isDark ? "#FFFFFF" : "#111827",
            }}
          >
            {bid.taskerName}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
            <Star size={12} color="#F59E0B" />
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: isDark ? "#B3B3B3" : "#6B7280",
                marginLeft: 4,
              }}
            >
              {bid.rating > 0 ? bid.rating.toFixed(1) : "Nou"} • {bid.tasksCompleted} sarcini
            </Text>
          </View>
        </View>
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 18,
            color: "#16A34A",
          }}
        >
          {parseFloat(bid.amount).toFixed(0)} lei
        </Text>
      </View>

      {/* Message */}
      {bid.message && (
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            color: isDark ? "#B3B3B3" : "#6B7280",
            lineHeight: 20,
            marginBottom: 12,
          }}
        >
          "{bid.message}"
        </Text>
      )}

      {/* Bid details */}
      <View style={{ flexDirection: "row", gap: 16, marginBottom: 12 }}>
        {bid.estimatedHours && (
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              color: isDark ? "#8F8F8F" : "#9CA3AF",
            }}
          >
            ~{bid.estimatedHours}h estimat
          </Text>
        )}
        {bid.proposedDate && (
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              color: isDark ? "#8F8F8F" : "#9CA3AF",
            }}
          >
            Propus: {formatTaskDate(bid.proposedDate)}
          </Text>
        )}
      </View>

      {/* Accept button */}
      {bid.status === "pending" && (
        <TouchableOpacity
          onPress={onAccept}
          style={{
            backgroundColor: "#10B981",
            borderRadius: 10,
            paddingVertical: 12,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 14,
              color: "#FFFFFF",
            }}
          >
            Accepta oferta
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function BookingDetail() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { id } = useLocalSearchParams();
  const { user } = useCurrentUser();

  const [task, setTask] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  const loadTask = useCallback(async () => {
    if (!id) return;

    try {
      const response = await tasksApi.getTask(id);
      const taskData = response.data?.task || response.data || response;
      setTask(taskData);

      // Check if user already reviewed this task
      if (taskData.status === "completed" && user?.id) {
        try {
          const reviewsResponse = await reviewsApi.getReviews({ task_id: id, reviewer_id: user.id });
          const reviews = reviewsResponse.data?.reviews || reviewsResponse.data || reviewsResponse || [];
          if (Array.isArray(reviews) && reviews.length > 0) {
            setHasReviewed(true);
          }
        } catch (e) {
          // Ignore — just show the review button
        }
      }

      // Load bids if task is open + open_bidding
      if (taskData.status === "open" && taskData.booking_type === "open_bidding") {
        try {
          const bidsResponse = await bidsApi.getTaskBids(id);
          const bidsData = Array.isArray(bidsResponse)
            ? bidsResponse
            : bidsResponse.data || bidsResponse.bids || [];
          setBids((Array.isArray(bidsData) ? bidsData : []).map(mapBidToCard));
        } catch (e) {
          console.error("Error loading bids:", e);
        }
      }
    } catch (error) {
      console.error("Error loading task:", error);
      Alert.alert("Eroare", "Nu am putut incarca detaliile sarcinii");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const handleAcceptBid = (bid) => {
    Alert.alert(
      "Accepta oferta",
      `Esti sigur ca vrei sa accepti oferta de ${parseFloat(bid.amount).toFixed(0)} lei de la ${bid.taskerName}?`,
      [
        { text: "Anuleaza", style: "cancel" },
        {
          text: "Accepta",
          onPress: async () => {
            setAccepting(true);
            try {
              await bidsApi.acceptBid(bid.id);
              Alert.alert("Succes", "Oferta a fost acceptata!");
              loadTask(); // Refresh task (status becomes assigned)
            } catch (error) {
              console.error("Error accepting bid:", error);
              Alert.alert("Eroare", "Nu am putut accepta oferta");
            } finally {
              setAccepting(false);
            }
          },
        },
      ],
    );
  };

  const handleCancelTask = () => {
    Alert.alert(
      "Anuleaza sarcina",
      "Esti sigur ca vrei sa anulezi aceasta sarcina?",
      [
        { text: "Nu", style: "cancel" },
        {
          text: "Da, anuleaza",
          style: "destructive",
          onPress: async () => {
            try {
              await tasksApi.cancelTask(id, "Anulat de client");
              setTask((prev) => ({ ...prev, status: "cancelled" }));
              Alert.alert("Sarcina anulata");
            } catch (error) {
              Alert.alert("Eroare", "Nu am putut anula sarcina");
            }
          },
        },
      ],
    );
  };

  const handleMessage = () => {
    const tasker = task.assigned_tasker;
    router.push({
      pathname: `/chat/task-${task.id}`,
      params: {
        contextId: task.id,
        contextType: "task",
        receiverId: tasker?.id || "",
        receiverName: tasker
          ? `${tasker.first_name} ${tasker.last_name || ""}`.trim()
          : "",
        receiverImage: tasker?.profile_image_url || "",
      },
    });
  };

  const formatPrice = () => {
    if (!task) return null;
    if (task.fixed_price) {
      return `${parseFloat(task.fixed_price).toFixed(0)} lei (pret fix)`;
    }
    if (task.budget_min && task.budget_max) {
      return `${task.budget_min} - ${task.budget_max} lei`;
    }
    if (task.budget_min) {
      return `de la ${task.budget_min} lei`;
    }
    return null;
  };

  const getAddress = () => {
    if (!task?.address) return null;
    return task.address.full_address || task.address.city || null;
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

  if (!task) return null;

  const statusConfig = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.open;
  const showBids = task.status === "open" && task.booking_type === "open_bidding";
  const hasAssignedTasker =
    task.assigned_tasker &&
    ["assigned", "in_progress", "completed"].includes(task.status);

  const showCancel = ["open", "assigned"].includes(task.status);
  const showMessage = ["assigned", "in_progress"].includes(task.status) && task.assigned_tasker;
  const showReview = task.status === "completed";
  const showRepublish = task.status === "cancelled";

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

        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 20,
            color: isDark ? "#FFFFFF" : "#111827",
            marginLeft: 16,
            flex: 1,
          }}
        >
          Detalii sarcina
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom:
            insets.bottom + (showCancel || showMessage || showReview || showRepublish ? 100 : 16),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Status */}
        <SectionCard isDark={isDark}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 20,
                color: isDark ? "#FFFFFF" : "#111827",
                flex: 1,
                marginRight: 12,
              }}
            >
              {task.title}
            </Text>
            <View
              style={{
                backgroundColor: statusConfig.bg,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 13,
                  color: statusConfig.color,
                }}
              >
                {statusConfig.label}
              </Text>
            </View>
          </View>

          {task.category?.name && (
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 15,
                color: isDark ? "#B3B3B3" : "#6B7280",
              }}
            >
              {task.category.name}
            </Text>
          )}

          {task.urgency === "high" && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 12,
                backgroundColor: "#FEF2F2",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <AlertTriangle size={16} color="#EF4444" />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: "#EF4444",
                  marginLeft: 8,
                }}
              >
                Sarcina urgenta
              </Text>
            </View>
          )}
        </SectionCard>

        {/* Description */}
        {task.description && (
          <SectionCard title="Descriere" isDark={isDark}>
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: isDark ? "#2D2D2D" : "#F3F4F6",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <FileText size={16} color={isDark ? "#8F8F8F" : "#6B7280"} />
              </View>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: isDark ? "#FFFFFF" : "#374151",
                  flex: 1,
                  lineHeight: 22,
                }}
              >
                {task.description}
              </Text>
            </View>
          </SectionCard>
        )}

        {/* Schedule & Location */}
        <SectionCard title="Program si locatie" isDark={isDark}>
          <InfoRow
            icon={Calendar}
            label="Data"
            value={task.task_date ? formatTaskDate(task.task_date) : null}
            isDark={isDark}
          />
          {task.task_time && (
            <InfoRow icon={Calendar} label="Ora" value={task.task_time} isDark={isDark} />
          )}
          <InfoRow
            icon={MapPin}
            label="Locatie"
            value={getAddress()}
            isDark={isDark}
          />
        </SectionCard>

        {/* Pricing */}
        {formatPrice() && (
          <SectionCard title="Buget" isDark={isDark}>
            <InfoRow
              icon={DollarSign}
              label="Pret"
              value={formatPrice()}
              isDark={isDark}
            />
          </SectionCard>
        )}

        {/* Assigned Tasker */}
        {hasAssignedTasker && (
          <SectionCard title="Mester atribuit" isDark={isDark}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: isDark ? "#4B5563" : "#E5E7EB",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                {task.assigned_tasker.profile_image_url ? (
                  <Image
                    source={{ uri: task.assigned_tasker.profile_image_url }}
                    style={{ width: 50, height: 50, borderRadius: 25 }}
                    contentFit="cover"
                  />
                ) : (
                  <User size={24} color={isDark ? "#9CA3AF" : "#6B7280"} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: isDark ? "#FFFFFF" : "#111827",
                  }}
                >
                  {task.assigned_tasker.first_name}{" "}
                  {task.assigned_tasker.last_name}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 4,
                  }}
                >
                  {task.assigned_tasker.avg_rating > 0 && (
                    <>
                      <Star size={14} color="#F59E0B" />
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 14,
                          color: isDark ? "#B3B3B3" : "#6B7280",
                          marginLeft: 4,
                        }}
                      >
                        {parseFloat(task.assigned_tasker.avg_rating).toFixed(1)}
                      </Text>
                    </>
                  )}
                  {task.assigned_tasker.total_tasks_completed > 0 && (
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: isDark ? "#B3B3B3" : "#6B7280",
                        marginLeft: 8,
                      }}
                    >
                      {task.assigned_tasker.total_tasks_completed} sarcini
                    </Text>
                  )}
                </View>
              </View>

              {showMessage && (
                <TouchableOpacity
                  onPress={handleMessage}
                  style={{
                    backgroundColor: isDark ? "#2D2D2D" : "#F3F4F6",
                    borderRadius: 10,
                    padding: 10,
                  }}
                >
                  <MessageCircle
                    size={20}
                    color={isDark ? "#FFFFFF" : "#000000"}
                  />
                </TouchableOpacity>
              )}
            </View>
          </SectionCard>
        )}

        {/* Bids Section */}
        {showBids && (
          <SectionCard
            title={`Oferte primite (${bids.length})`}
            isDark={isDark}
          >
            {bids.length > 0 ? (
              bids.map((bid) => (
                <BidCard
                  key={bid.id}
                  bid={bid}
                  isDark={isDark}
                  onAccept={() => handleAcceptBid(bid)}
                />
              ))
            ) : (
              <View style={{ alignItems: "center", paddingVertical: 24 }}>
                <Inbox size={32} color={isDark ? "#4B5563" : "#D1D5DB"} />
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: isDark ? "#8F8F8F" : "#9CA3AF",
                    textAlign: "center",
                    marginTop: 12,
                    lineHeight: 20,
                  }}
                >
                  Nicio oferta inca. Mesterii din zona ta vor vedea sarcina.
                </Text>
              </View>
            )}
          </SectionCard>
        )}

        {/* Status Timeline */}
        <SectionCard title="Progres" isDark={isDark}>
          <StatusTimeline task={task} isDark={isDark} />
        </SectionCard>
      </ScrollView>

      {/* Action Buttons */}
      {(showCancel || showMessage || showReview || showRepublish) && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: isDark ? "#121212" : "#FFFFFF",
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: insets.bottom + 16,
            borderTopWidth: 1,
            borderTopColor: isDark ? "#2D2D2D" : "#E5E7EB",
          }}
        >
          {task.status === "open" && (
            <TouchableOpacity
              onPress={handleCancelTask}
              style={{
                backgroundColor: "#FEE2E2",
                borderRadius: 12,
                paddingVertical: 16,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <XCircle size={20} color="#DC2626" />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: "#DC2626",
                  marginLeft: 8,
                }}
              >
                Anuleaza sarcina
              </Text>
            </TouchableOpacity>
          )}

          {task.status === "assigned" && (
            <View style={{ gap: 8 }}>
              <TouchableOpacity
                onPress={handleMessage}
                style={{
                  backgroundColor: "#3B82F6",
                  borderRadius: 12,
                  paddingVertical: 16,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MessageCircle size={20} color="white" />
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: "white",
                    marginLeft: 8,
                  }}
                >
                  Trimite mesaj
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancelTask}
                style={{
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 14,
                    color: "#DC2626",
                  }}
                >
                  Anuleaza sarcina
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {task.status === "in_progress" && showMessage && (
            <TouchableOpacity
              onPress={handleMessage}
              style={{
                backgroundColor: "#3B82F6",
                borderRadius: 12,
                paddingVertical: 16,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MessageCircle size={20} color="white" />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: "white",
                  marginLeft: 8,
                }}
              >
                Trimite mesaj
              </Text>
            </TouchableOpacity>
          )}

          {showReview && !hasReviewed && (
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: `/review/${task.id}`,
                  params: {
                    revieweeId: task.assigned_tasker?.id || "",
                    revieweeName: task.assigned_tasker
                      ? `${task.assigned_tasker.first_name} ${task.assigned_tasker.last_name}`
                      : "",
                    revieweeImage: task.assigned_tasker?.profile_image_url || "",
                  },
                });
              }}
              style={{
                backgroundColor: "#10B981",
                borderRadius: 12,
                paddingVertical: 16,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Star size={20} color="white" />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: "white",
                  marginLeft: 8,
                }}
              >
                Lasa o recenzie
              </Text>
            </TouchableOpacity>
          )}

          {showReview && hasReviewed && (
            <View
              style={{
                backgroundColor: isDark ? "#1E1E1E" : "#F0FDF4",
                borderRadius: 12,
                paddingVertical: 16,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CheckCircle size={20} color="#16A34A" />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: "#16A34A",
                  marginLeft: 8,
                }}
              >
                Recenzia a fost trimisa
              </Text>
            </View>
          )}

          {showRepublish && (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/service-request")}
              style={{
                backgroundColor: "#000000",
                borderRadius: 12,
                paddingVertical: 16,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <RefreshCw size={20} color="white" />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: "white",
                  marginLeft: 8,
                }}
              >
                Publica din nou
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Accepting overlay */}
      {accepting && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
              borderRadius: 16,
              padding: 24,
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" color="#10B981" />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: isDark ? "#FFFFFF" : "#111827",
                marginTop: 12,
              }}
            >
              Se accepta oferta...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
