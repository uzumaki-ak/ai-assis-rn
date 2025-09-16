import color from "@/shared/color";
import { useLocalSearchParams, useNavigation } from "expo-router";
import {
  CloudUploadIcon,
  HeartPlus,
  LucidePlaneTakeoff,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const initialMssage = [
  { role: "user", text: "hi how are you?" },
  { role: "assistant", text: "fine thank you" },
  { role: "user", text: "How can you help me?" },
  { role: "assistant", text: "I can help with various tasks" },
  { role: "user", text: "Tell me about yourself" },
  { role: "assistant", text: "I'm an AI assistant" },
  { role: "user", text: "That's great" },
  { role: "assistant", text: "Thank you! How can I assist you today?" },
];

export default function ChatUi() {
  const navigation = useNavigation();
  const { agentName, agentId, agentPrompt, initialText } =
    useLocalSearchParams();
  const [messages, setMessages] = useState(initialMssage);
  const [inputText, setInputText] = useState("");
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

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage = { role: "user", text: inputText.trim() };
      setMessages((prev) => [...prev, newMessage]);
      setInputText("");

      // Scroll to bottom after sending message (keep the small timeout)
      setTimeout(() => {
        flatListRef.current?.scrollToEnd?.({ animated: true } as any);
      }, 100);
    }
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
            renderItem={({ item, index }) => (
              <View
                style={[
                  styles.messageContainer,
                  item.role === "user"
                    ? styles.userMessage
                    : styles.assistantMessage,
                ]}
              >
                <Text
                  style={
                    item.role === "user"
                      ? styles.userText
                      : styles.assistantText
                  }
                >
                  {item.text}
                </Text>
              </View>
            )}
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
              value={inputText}
              onChangeText={setInputText}
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
  },
  userText: {
    color: color.WHITE,
    fontSize: 16,
  },
  assistantText: {
    color: color.WHEAT,
    fontSize: 16,
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
});
