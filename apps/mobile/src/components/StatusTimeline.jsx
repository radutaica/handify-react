import React from "react";
import { View, Text } from "react-native";
import { CheckCircle, Clock, Circle, XCircle, AlertTriangle } from "lucide-react-native";
import { formatTaskDate } from "@/utils/mapTaskData";

const STEPS = [
  { key: "open", label: "Publicat", timestampField: "created_at" },
  { key: "assigned", label: "Atribuit", timestampField: "assigned_at" },
  { key: "in_progress", label: "In desfasurare", timestampField: null },
  { key: "completed", label: "Finalizat", timestampField: "completed_at" },
];

const STATUS_ORDER = {
  draft: -1,
  open: 0,
  assigned: 1,
  in_progress: 2,
  completed: 3,
  cancelled: -2,
  disputed: -2,
};

export default function StatusTimeline({ task, isDark = false }) {
  const currentIndex = STATUS_ORDER[task.status] ?? -1;
  const isCancelled = task.status === "cancelled";
  const isDisputed = task.status === "disputed";

  const getStepState = (stepIndex) => {
    if (isCancelled || isDisputed) {
      // Show completed steps before cancellation
      if (stepIndex === 0) return "complete"; // Was always published
      if (task.assigned_at && stepIndex <= 1) return "complete";
      if (task.status === "in_progress" && stepIndex <= 2) return "complete";
      return "future";
    }
    if (stepIndex < currentIndex) return "complete";
    if (stepIndex === currentIndex) return "current";
    return "future";
  };

  const getTimestamp = (step) => {
    if (!step.timestampField) return null;
    return task[step.timestampField];
  };

  const renderStepIcon = (state) => {
    if (state === "complete") {
      return <CheckCircle size={20} color="#10B981" />;
    }
    if (state === "current") {
      return <Clock size={20} color="#3B82F6" />;
    }
    return <Circle size={20} color={isDark ? "#4B5563" : "#D1D5DB"} />;
  };

  return (
    <View>
      {STEPS.map((step, index) => {
        const state = getStepState(index);
        const timestamp = getTimestamp(step);
        const isLast = index === STEPS.length - 1;

        return (
          <View key={step.key} style={{ flexDirection: "row" }}>
            {/* Icon + Line */}
            <View style={{ alignItems: "center", width: 32 }}>
              {renderStepIcon(state)}
              {!isLast && (
                <View
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 24,
                    backgroundColor:
                      state === "complete"
                        ? "#10B981"
                        : isDark
                          ? "#4B5563"
                          : "#D1D5DB",
                  }}
                />
              )}
            </View>

            {/* Label + Timestamp */}
            <View style={{ flex: 1, marginLeft: 12, paddingBottom: isLast ? 0 : 16 }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 15,
                  color:
                    state === "future"
                      ? isDark
                        ? "#6B7280"
                        : "#9CA3AF"
                      : isDark
                        ? "#FFFFFF"
                        : "#111827",
                }}
              >
                {step.label}
              </Text>
              {timestamp && (
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 13,
                    color: isDark ? "#8F8F8F" : "#9CA3AF",
                    marginTop: 2,
                  }}
                >
                  {formatTaskDate(timestamp)}
                </Text>
              )}
            </View>
          </View>
        );
      })}

      {/* Cancelled / Disputed special entry */}
      {(isCancelled || isDisputed) && (
        <View style={{ flexDirection: "row", marginTop: 8 }}>
          <View style={{ alignItems: "center", width: 32 }}>
            {isCancelled ? (
              <XCircle size={20} color="#EF4444" />
            ) : (
              <AlertTriangle size={20} color="#EF4444" />
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 15,
                color: "#EF4444",
              }}
            >
              {isCancelled ? "Anulat" : "Disputat"}
            </Text>
            {task.cancelled_at && (
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: isDark ? "#8F8F8F" : "#9CA3AF",
                  marginTop: 2,
                }}
              >
                {formatTaskDate(task.cancelled_at)}
              </Text>
            )}
            {task.cancellation_reason && (
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: "#EF4444",
                  marginTop: 4,
                }}
              >
                Motiv: {task.cancellation_reason}
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
