import { firestoreDb } from "@/config/FirebaseConfig";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ArrowUpRight } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Agent = {
  agentName: string;
  agentId: string;
  prompt: string;
  emoji: string;
};

export default function UserCreatedAgentList({
  scrollEnabled = true,
}: {
  scrollEnabled?: boolean;
}) {
  const { user } = useUser();
  const [agentList, setAgentList] = useState<Agent[]>([]);
  const router = useRouter();

  // container entrance animation
  const containerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // container fade/slide in
    Animated.timing(containerAnim, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    user && GetUserAgent();
  }, [user]);

  const GetUserAgent = async () => {
    const q = query(
      collection(firestoreDb, "agents"),
      where("userEmail", "==", user?.primaryEmailAddress?.emailAddress)
    );
    setAgentList([]);
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      //@ts-ignore
      setAgentList((prev) => [
        ...prev,
        {
          ...doc.data(),
          agentId: doc.id,
        },
      ]);
    });
  };

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          opacity: containerAnim,
          transform: [
            {
              translateY: containerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.header}>Your Agents</Text>

      {/* pass through scrollEnabled so parent ScrollView can own scrolling */}
      <FlatList
        data={agentList}
        keyExtractor={(it) => it.agentId}
        renderItem={({ item, index }) => (
          <AgentItem item={item} index={index} router={router} />
        )}
        contentContainerStyle={{ paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
      />
    </Animated.View>
  );
}

/* --- AgentItem (unchanged logic — navigation restored) --- */
const AgentItem = React.memo(function AgentItem({
  item,
  index,
  router,
}: {
  item: Agent;
  index: number;
  router: ReturnType<typeof useRouter>;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // staggered entrance
    Animated.timing(anim, {
      toValue: 1,
      duration: 420,
      delay: index * 70,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // continuous emoji pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.07,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.98,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.item,
        {
          opacity: anim,
          transform: [
            {
              translateX: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.86}
        style={styles.itemRow}
        onPress={() =>
          router.push({
            pathname: "/chat",
            params: {
              agentName: item.agentName,
              initialText: "",
              agentPrompt: item.prompt,
              agentId: item.agentId,
              emoji: item.emoji,
            },
          })
        }
      >
        {/* TOP-RIGHT ARROW */}
        <View style={styles.arrowWrap}>
          <ArrowUpRight size={26} color={theme.accent} />
        </View>

        <View style={styles.left}>
          <Animated.View
            style={[styles.emojiWrap, { transform: [{ scale: pulse }] }]}
          >
            <Text style={styles.emoji}>{item.emoji ?? "🤖"}</Text>
          </Animated.View>

          <View style={styles.meta}>
            <Text numberOfLines={1} style={styles.name}>
              {item.agentName}
            </Text>
            <Text numberOfLines={1} style={styles.sub}>
              {item.prompt}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const theme = {
  pageBg: "#06070A",
  card: "#0b1116",
  panel: "#071019",
  accent: "#F5DEB3",
  muted: "rgba(245,222,179,0.55)",
  border: "rgba(212,175,55,0.06)",
};

const styles = StyleSheet.create({
  wrap: {
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.accent,
    marginBottom: 10,
  },
  item: {
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  itemRow: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: Platform.OS === "ios" ? 8 : 4 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 4,
    position: "relative", // <-- allow absolute-position arrow
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  emojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(245,222,179,0.06)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  emoji: {
    fontSize: 22,
  },
  meta: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    color: theme.accent,
    fontSize: 16,
    fontWeight: "700",
  },
  sub: {
    color: theme.muted,
    marginTop: 2,
    fontSize: 12,
  },
  arrowWrap: {
    position: "absolute",
    right: 10,
    top: 8,
    // make arrow touch-friendly without moving layout
    padding: 6,
    borderRadius: 8,
    // subtle backdrop so arrow reads against card
    backgroundColor: "rgba(245,222,179,0.02)",
  },
});
