import { firestoreDb } from "@/config/FirebaseConfig";
import color from "@/shared/color";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { FileStack, Search } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";

type History = {
  docId?: string;
  agentId?: string;
  agentName?: string;
  agentPrompt?: string;
  emoji?: string;
  messages: any[];
  lastModified?: any;
};

export default function History() {
  const { user } = useUser();
  const [historyList, setHistoryList] = useState<History[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      GetChatHistory();
    }
  }, [user]);

  const GetChatHistory = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    setLoading(true);
    try {
      const q = query(
        collection(firestoreDb, "chats"),
        where("userEmail", "==", user.primaryEmailAddress.emailAddress),
        orderBy("lastModified", "desc")
      );
      const querySnapshot = await getDocs(q);
      const newHistoryList: History[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const historyItem: History = {
          docId: data.docId || doc.id, // Use docId from data, fallback to document ID
          agentId: data.agentId || doc.id,
          agentName: data.agentName || "Unnamed Agent",
          agentPrompt: data.agentPrompt || "",
          emoji: data.emoji || "",
          messages: data.messages || [],
          lastModified: data.lastModified || 0,
        };

        // Only add if it has messages (avoid empty chats)
        if (historyItem.messages.length > 0) {
          newHistoryList.push(historyItem);
        }
      });

      // Sort by lastModified in descending order (newest first)
      newHistoryList.sort(
        (a, b) => (b.lastModified || 0) - (a.lastModified || 0)
      );

      setHistoryList(newHistoryList);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely get message content for display
  const getDisplayContent = (message: any): string => {
    if (!message || !message.content) return "No content";

    try {
      // Handle array content (messages with images/text)
      if (Array.isArray(message.content)) {
        const textContent = message.content.find(
          (c: any) => c?.type === "text"
        );
        return textContent?.text || "Media message";
      }

      // Handle string content
      if (typeof message.content === "string") {
        // Skip system messages and loading messages
        if (message.role === "system" || message.content === "...loading") {
          return "Chat started";
        }
        return message.content;
      }

      return "Message";
    } catch (error) {
      console.error("Error parsing message content:", error);
      return "Error loading message";
    }
  };

  const getLastUserMessage = (messages: any[]): string => {
    // Find the last non-system message
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role !== "system") {
        return getDisplayContent(msg);
      }
    }
    return "No messages yet...";
  };

  // Filtered data based on searchTerm
  const filteredHistory = historyList.filter((item) => {
    if (!searchTerm.trim()) return true;

    const text = searchTerm.toLowerCase();
    const messages = item.messages || [];

    // Check agent name
    const agentNameMatch =
      item.agentName?.toLowerCase().includes(text) ?? false;

    // Check message contents
    const messageMatch = messages.some((msg: any) => {
      const content = getDisplayContent(msg);
      return content.toLowerCase().includes(text);
    });

    return agentNameMatch || messageMatch;
  });

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#000" }}>
      {/* Header + Search Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "white",
          }}
        >
          Chat History
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#1a1a1a",
            borderRadius: 8,
            paddingHorizontal: 10,
          }}
        >
          <Search color="white" size={18} />
          <TextInput
            placeholder="Search..."
            placeholderTextColor="#aaa"
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={{
              color: "white",
              marginLeft: 6,
              minWidth: 120,
              paddingVertical: 8,
            }}
          />
        </View>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "#666", fontSize: 16 }}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item, index) =>
            item.docId || `${item.agentId}-${index}` || index.toString()
          }
          renderItem={({ item, index }) => {
            const lastMessage = getLastUserMessage(item.messages);

            return (
              <Animated.View entering={FadeInRight.delay(index * 100)}>
                <TouchableOpacity
                  onPress={() => {
                    try {
                      router.push({
                        pathname: "/chat",
                        params: {
                          chatId:
                            item.docId || item.agentId || Date.now().toString(),
                          agentId: item.agentId || "",
                          agentName: item.agentName || "Unnamed Agent",
                          initialText: "",
                          agentPrompt: item.agentPrompt || "",
                          emoji: item.emoji || "",
                          messagesList: JSON.stringify(item.messages),
                        },
                      });
                    } catch (error) {
                      console.error("Navigation error:", error);
                    }
                  }}
                  style={{
                    flexDirection: "row",
                    padding: 12,
                    backgroundColor: color.WHEAT,
                    marginBottom: 12,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      padding: 10,
                      backgroundColor: "#fff",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 8,
                      marginRight: 12,
                    }}
                  >
                    {item.emoji ? (
                      <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                    ) : (
                      <FileStack color="black" size={22} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ fontWeight: "600", fontSize: 16, color: "#000" }}
                    >
                      {item.agentName || "Unnamed Agent"}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={{ color: "#333", marginTop: 4 }}
                    >
                      {lastMessage}
                    </Text>
                    <Text style={{ color: "#666", fontSize: 12, marginTop: 2 }}>
                      {item.messages.length} messages •{" "}
                      {item.lastModified
                        ? new Date(item.lastModified).toLocaleDateString()
                        : "Unknown date"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          }}
          ListEmptyComponent={
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: "#666", fontSize: 16 }}>
                No chat history found
              </Text>
              <Text style={{ color: "#666", fontSize: 14, marginTop: 4 }}>
                Start a conversation to see it here
              </Text>
            </View>
          }
          refreshing={loading}
          onRefresh={GetChatHistory}
        />
      )}
    </View>
  );
}
