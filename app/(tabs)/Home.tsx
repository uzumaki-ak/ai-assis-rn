import AgentListComp from "@/components/home/AgentListComp";
import CreateAgentBanner from "@/components/home/CreateAgentBanner";
import { useNavigation, useRouter } from "expo-router";
import { Cog } from "lucide-react-native";
import React, { useEffect } from "react";
import { Image, ScrollView, Text, TouchableOpacity } from "react-native";

export default function Home() {
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text
          style={{
            fontFamily: "PoppinsRegular",
            fontSize: 19,
            color: theme.accent,
          }}
        >
          AI-Poket-Agent
        </Text>
      ),
      headerTitleAlign: "center",
      headerLeft: () => (
        <TouchableOpacity
          style={{
            marginLeft: 15,
            display: "flex",
            flexDirection: "row",
            gap: 8,
            backgroundColor: theme.card,
            padding: 6,
            paddingHorizontal: 12,
            borderRadius: 10,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "rgba(212,175,55,0.08)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.18,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Image
            source={require("../../assets/icons/premium.png")}
            style={{
              width: 20,
              height: 20,
              marginRight: 6,
              tintColor: theme.accent,
            }}
          />
          <Text style={{ color: theme.accent, fontWeight: "700" }}>Pro-Ϟ</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 15 }}
          onPress={() => router.push("(tabs)/Profile" as any)} // ← cast to any to satisfy TS
        >
          <Cog size={22} color={theme.accent} />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: theme.pageBackground.backgroundColor,
        borderBottomWidth: 0,
        elevation: 0,
        shadowColor: "transparent",
      },
    });
  }, [navigation, router]);

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 15,
        backgroundColor: theme.pageBackground.backgroundColor,
      }}
    >
      {/* featured list (disabled inner scroll so parent handles scrolling) */}
      <AgentListComp isFeatured={true} scrollEnabled={false} />

      {/* banner in between */}
      <CreateAgentBanner />

      {/* non-featured list */}
      <AgentListComp isFeatured={false} scrollEnabled={false} />
    </ScrollView>
  );
}

/* local theme for UI-only changes */
const theme = {
  pageBackground: { backgroundColor: "#06070A" },
  card: "#0b1116",
  accent: "#F5DEB3",
  muted: "rgba(245,222,179,0.45)",
};
