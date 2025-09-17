import color from "@/shared/color";
import { AIChatmodel } from "@/shared/GlobalApi";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useNavigation } from "expo-router";
import {
  CloudUploadIcon,
  HeartPlus,
  Layers2,
  LucidePlaneTakeoff,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Message = {
  role: string;
  content: string;
};

export default function ChatUi() {
  const navigation = useNavigation();
  const { agentName, agentId, agentPrompt, initialText } =
    useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // keyboard state to slightly raise input when keyboard opens
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: agentName,
      headerRight: () => <HeartPlus color={color.WHITE} />,
      headerStyle: {
        backgroundColor: color.BLACK,
      },
      headerTintColor: color.WHITE,
      headerTitleStyle: {
        color: color.WHITE,
      },
    });
  }, []);

  useEffect(() => {
    // Listen to keyboard show/hide to nudge the input area a little bit.
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      // e.endCoordinates.height available on most platforms
      setKeyboardHeight(e.endCoordinates?.height || 0);
      // small extra nudge only (you asked for "just little bit")
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  //setting up prompt
  useEffect(() => {
    if (agentPrompt) {
      setMessages((prev) => [
        ...prev,
        { role: "system", content: agentPrompt.toString() },
      ]);
    }
  }, [agentPrompt]);

  const sendMessage = async () => {
    if (!input?.trim()) return;

    const newMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Add loading message
    const loadingMessage = { role: "assistant", content: "...loading" };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const result = await AIChatmodel([...messages, newMessage]);
      console.log(result.aiResponse);

      // Create proper message object for the AI response
      const aiMessage = {
        role: "assistant",
        content: result.aiResponse,
      };

      // Replace the loading message with the actual response
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = aiMessage;
        return updated;
      });

      // Scroll to bottom after sending message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd?.({ animated: true } as any);
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      // Replace loading message with error message
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        };
        return updated;
      });
    }
  };

  // Claude-style typing indicator
  const TypingIndicator = () => {
    const [currentDot, setCurrentDot] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentDot((prev) => (prev + 1) % 4); // 0, 1, 2, 3 (pause), repeat
      }, 500);

      return () => clearInterval(interval);
    }, []);

    return (
      <View style={styles.typingContainer}>
        <View
          style={[styles.typingDot, { opacity: currentDot >= 1 ? 1 : 0.3 }]}
        />
        <View
          style={[styles.typingDot, { opacity: currentDot >= 2 ? 1 : 0.3 }]}
        />
        <View
          style={[styles.typingDot, { opacity: currentDot >= 3 ? 1 : 0.3 }]}
        />
      </View>
    );
  };

  const copyToClipboard = async (message: string) => {
    await Clipboard.setStringAsync(message);
    ToastAndroid.show("done sensei", ToastAndroid.BOTTOM);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 50}
      >
        <View style={{ flex: 1 }}>
          {/* Messages FlatList handles scrolling/windowing itself*/}
          <FlatList
            ref={flatListRef}
            data={messages}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            //@ts-ignore
            renderItem={({ item, index }) =>
              item.role !== "system" && (
                <View
                  style={[
                    styles.messageContainer,
                    item.role === "user"
                      ? styles.userMessage
                      : styles.assistantMessage,
                  ]}
                >
                  {item.content === "...loading" ? (
                    <TypingIndicator />
                  ) : (
                    <Text
                      style={
                        item.role === "user"
                          ? styles.userText
                          : styles.assistantText
                      }
                    >
                      {item.content}
                    </Text>
                  )}

                  {/* Show clipboard only for assistant AND only when it's not the loading placeholder */}
                  {item.role === "assistant" &&
                    item.content !== "...loading" && (
                      <Pressable
                        style={styles.clipboardButton}
                        onPress={() => copyToClipboard(item.content)}
                      >
                        <Layers2 color={color.WHITE} size={15} />
                      </Pressable>
                    )}
                </View>
              )
            }
            keyExtractor={(item, index) => index.toString()}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd?.({ animated: true } as any)
            }
            keyboardShouldPersistTaps="handled"
            // keep a footer space so last message isn't hidden under the input
            ListFooterComponent={<View style={{ height: 8 }} />}
          />
        </View>

        {/* Input Container - Outside any ScrollView*/}
        <View
          style={[
            styles.inputWrapper,
            // small extra padding when keyboard is visible —
            { paddingBottom: keyboardHeight ? 40 : 10 },
          ]}
        >
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.uploadButton}>
              <CloudUploadIcon color={"#DAA520"} size={24} />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Ask a query"
              placeholderTextColor="#999"
              value={input}
              onChangeText={(v) => setInput(v)}
              multiline={true}
              maxLength={500}
              textAlignVertical="top"
              scrollEnabled={false}
            />

            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <LucidePlaneTakeoff color={color.BLACK} size={18} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.LITTLEBLACK,
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  messagesContainer: {
    paddingVertical: 10,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: "75%",
    marginVertical: 4,
    padding: 12,
    position: "relative", // allow absolute-positioned children (clipboard icon)
  },
  userMessage: {
    backgroundColor: color.GRAY,
    alignSelf: "flex-end",
    borderRadius: 12,
  },
  assistantMessage: {
    backgroundColor: color.BLACK,
    borderRadius: 12,
    alignSelf: "flex-start",
    paddingRight: 44, // leave space for the clipboard icon on the right
  },
  userText: {
    color: color.WHITE,
    fontSize: 16,
  },
  assistantText: {
    color: color.WHEAT,
    fontSize: 16,
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: color.WHEAT,
    marginHorizontal: 3,
  },
  inputWrapper: {
    backgroundColor: color.LITTLEBLACK,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#333",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#555",
  },
  uploadButton: {
    marginRight: 10,
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    color: color.WHITE,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  sendButton: {
    backgroundColor: color.WHEAT,
    padding: 10,
    borderRadius: 20,
    marginLeft: 8,
    marginBottom: 4,
  },
  clipboardButton: {
    position: "absolute",
    right: 8,
    bottom: 6,
    padding: 6,
    borderRadius: 20,
    // backgroundColor: color.WHEAT, // small pill around icon so it's visible
    justifyContent: "center",
    alignItems: "center",
  },
});
