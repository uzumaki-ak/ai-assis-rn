import UserCreatedAgentList from "@/components/explore/UserCreatedAgentList";
import AgentListComp from "@/components/home/AgentListComp";
import CreateAgentBanner from "@/components/home/CreateAgentBanner";
import { useNavigation } from "expo-router";
import { Cog } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Explore() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => <Text style={styles.headerTitle}>Explore Agents</Text>,
      headerTitleAlign: "center",
      headerLeft: () => (
        <TouchableOpacity style={styles.proBadge} activeOpacity={0.85}>
          <Image
            source={require("../../assets/icons/premium.png")}
            style={styles.proIcon}
          />
          <Text style={styles.proText}>Pro</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 12 }} activeOpacity={0.85}>
          <Cog size={20} color={theme.accent} />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: theme.pageBg,
        borderBottomWidth: 0,
        elevation: 0,
        shadowColor: "transparent",
      },
      headerTintColor: theme.accent,
    });
  }, []);

  return (
    <View style={styles.screen}>
      {/* outer ScrollView owns vertical scrolling for the whole page */}
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <CreateAgentBanner />

        {/* user created agent list — disable its internal FlatList scrolling so outer ScrollView handles it */}
        <UserCreatedAgentList scrollEnabled={false} />

        {/* featured agents — also let outer ScrollView handle scrolling */}
        <AgentListComp isFeatured={true} scrollEnabled={false} />
      </ScrollView>
    </View>
  );
}

const theme = {
  pageBg: "#06070A",
  card: "#0b1116",
  accent: "#F5DEB3",
  border: "rgba(212,175,55,0.06)",
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.pageBg },
  container: {
    padding: 20,
    paddingBottom: 80, // room for bottom tabs/gesture area
    backgroundColor: theme.pageBg,
  },
  headerTitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 18,
    color: theme.accent,
    letterSpacing: 0.2,
    fontWeight: "700",
  },
  proBadge: {
    marginLeft: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.card,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  proIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
    tintColor: theme.accent,
  },
  proText: {
    color: theme.accent,
    fontWeight: "700",
    fontSize: 13,
  },
});
