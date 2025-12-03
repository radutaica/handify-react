import React from "react";
import { Tabs, usePathname } from "expo-router";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import {
  Home,
  Search,
  Clock,
  MessageCircle,
  User,
} from "lucide-react-native";
import { colors } from "@/theme/colors";

const TAB_BAR_MARGIN = 24;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          paddingTop: 4,
          paddingBottom: 12,
          paddingHorizontal: 2,
          height: 70,
          position: "absolute",
          bottom: 20,
          marginHorizontal: TAB_BAR_MARGIN,
          alignSelf: "center",
          borderRadius: 20,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        },
        tabBarActiveTintColor: colors.primary.teal,
        tabBarInactiveTintColor: colors.gray[500],
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "400",
          marginTop: 2,
          marginBottom: 0,
          marginHorizontal: 0,
        },
        tabBarIconStyle: {
          marginTop: 0,
          marginBottom: 2,
          marginHorizontal: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
        },
        tabBarButton: (props) => (
          <CustomTabBarButton {...props} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Acasa",
          tabBarIcon: ({ color, size, focused }) => (
            <Home color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Cauta",
          tabBarIcon: ({ color, size, focused }) => (
            <Search color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Istoric",
          tabBarIcon: ({ color, size, focused }) => (
            <Clock color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Mesaje",
          tabBarIcon: ({ color, size, focused }) => (
            <MessageCircle
              color={color}
              size={24}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size, focused }) => (
            <User color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="provider/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="service-request"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="booking/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="providers"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

function CustomTabBarButton({ children, onPress, accessibilityState, style, href }) {
  const pathname = usePathname();
  const isFocused = accessibilityState?.selected || (href && pathname === href);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.tabButton,
        style,
      ]}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.tabContent,
          isFocused && styles.tabContentFocused,
        ]}
      >
        {children}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 10,
    borderRadius: 12,
    minWidth: 60,
    width: "100%",
    backgroundColor: "transparent",
  },
  tabContentFocused: {
    backgroundColor: "#E0F2F1", // Light teal/mint green background
  },
});
