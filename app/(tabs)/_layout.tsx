import { Tabs } from "expo-router";
import {
  CookingPot,
  MapPinHouse,
  ShieldUser,
  Telescope,
} from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "white", 
        tabBarInactiveTintColor: "gray", 
        tabBarStyle: {
          backgroundColor: "black",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          color: "white",
        },
        headerStyle: {
          backgroundColor: "black", 
        },
        headerTintColor: "white",
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MapPinHouse size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Explore"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Telescope color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="History"
        options={{
          tabBarIcon: ({ color, size }) => (
            <CookingPot color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <ShieldUser color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
