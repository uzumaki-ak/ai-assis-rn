// ChatUi.tsx
import color from "@/shared/color";
import { AIChatmodel } from "@/shared/GlobalApi";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useNavigation } from "expo-router";

import { decode as base64Decode } from "base64-arraybuffer";
import {
  Axe,
  CloudUploadIcon,
  HeartPlus,
  Layers2,
  LucidePlaneTakeoff,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
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

// supabase client + bucket from config
import { supabase, SUPABASE_BUCKET } from "@/config/supabase";

type Message = {
  role: string;
  content: string | any[];
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
  // file state info (local URI from Expo ImagePicker)
  const [file, setFile] = useState<string | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates?.height || 0);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // setting up prompt
  useEffect(() => {
    if (agentPrompt) {
      setMessages((prev) => [
        ...prev,
        { role: "system", content: agentPrompt.toString() },
      ]);
    }
  }, [agentPrompt]);

  // ---------- Upload function (Supabase) using base64 -> ArrayBuffer ----------
  /**
   * Upload local file URI (Expo ImagePicker result) to Supabase Storage.
   * - Enforces 5 MB limit
   * - Uses expo-file-system to read base64 and base64-arraybuffer to decode.
   * - Returns public URL (if bucket public) or null.
   */
  // Fixed UploadImageToStorage function
  // Alternative method using fetch and Blob (more reliable for React Native)
  const UploadImageToStorage = async (
    localUri: string
  ): Promise<string | null> => {
    try {
      if (!localUri) {
        console.log("UploadImageToStorage: no file provided");
        return null;
      }

      console.log("UploadImageToStorage: localUri:", localUri);

      // Handle content:// URIs on Android by copying/downloading into cache
      let fileUri = localUri;
      if (localUri.startsWith("content://")) {
        const destPath = `${FileSystem.cacheDirectory}upload-${Date.now()}.jpg`;
        try {
          console.log("Copying content:// URI to cache path:", destPath);
          if ((FileSystem as any).copyAsync) {
            await (FileSystem as any).copyAsync({
              from: localUri,
              to: destPath,
            });
          } else {
            await FileSystem.downloadAsync(localUri, destPath);
          }
          fileUri = destPath;
          console.log("Copied content:// ->", fileUri);
        } catch (copyErr) {
          console.warn(
            "Failed to copy content:// -> will try original URI. err:",
            copyErr
          );
          fileUri = localUri;
        }
      }

      // Confirm file info (size)
      //@ts-ignore
      const info = await FileSystem.getInfoAsync(fileUri, { size: true });
      console.log("File info:", info);
      if (!info.exists && !fileUri.startsWith("content://")) {
        ToastAndroid.show("Selected file not accessible.", ToastAndroid.LONG);
        console.warn("File does not exist:", fileUri);
        return null;
      }

      // Read as base64 (use string 'base64' to avoid TS issues)
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: "base64" as any,
      });

      if (!base64) {
        console.warn("No base64 returned for file:", fileUri);
        return null;
      }

      const approxBytes = Math.floor((base64.length * 3) / 4);
      const MAX_BYTES = 5 * 1024 * 1024;
      if (approxBytes > MAX_BYTES) {
        ToastAndroid.show("Image too large (max 5 MB).", ToastAndroid.LONG);
        console.warn(`Upload aborted: approx size ${approxBytes} > 5MB`);
        return null;
      }

      // Decode & upload
      const arrayBuffer = base64Decode(base64);
      if (!arrayBuffer) {
        console.warn("base64Decode returned falsy value");
        return null;
      }

      const extCandidate = fileUri.split(".").pop() || "jpg";
      const ext = extCandidate.split("?")[0].toLowerCase();
      const normalizedExt = ext === "heic" ? "jpg" : ext;
      const filename = `${Date.now()}.${normalizedExt}`;
      const path = filename;
      const contentType = `image/${
        normalizedExt === "jpg" ? "jpeg" : normalizedExt
      }`;

      console.log("Uploading", { path, contentType, approxBytes });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(path, arrayBuffer, { contentType });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        ToastAndroid.show("Upload failed.", ToastAndroid.SHORT);
        return null;
      }

      console.log("Upload success:", uploadData);

      const publicRes = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(path);
      const publicUrl = publicRes?.data?.publicUrl ?? null;
      console.log("Public URL:", publicUrl);

      if (!publicUrl) {
        ToastAndroid.show(
          "Uploaded but URL unavailable (private bucket).",
          ToastAndroid.LONG
        );
      }

      return publicUrl;
    } catch (err) {
      console.error("UploadImageToStorage caught:", err);
      ToastAndroid.show("Upload failed (exception).", ToastAndroid.SHORT);
      return null;
    }
  };

  // ---------- sendMessage (only small changes: await upload and attach URL if needed) ----------
  const sendMessage = async () => {
    if (!input?.trim()) return;

    let newMessage: Message;

    // If an image is selected, upload first and get URL
    let uploadedImageUrl: string | null = null;
    if (file) {
      console.log("Starting upload for file:", file);
      uploadedImageUrl = await UploadImageToStorage(file);
      console.log("uploadedImageUrl:", uploadedImageUrl);
      newMessage = {
        role: "user",
        content: [
          {
            type: "text",
            text: input,
          },
          {type:'image_url',image_url:{url:uploadedImageUrl}}
        ],
      };
      setInput('');
      setFile(null);
    } else {
      newMessage = { role: "user", content: input.trim() };
      setInput('');
    }

    setMessages((prev) => [...prev, newMessage]);

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

  // TypingIndicator & other UI functions (unchanged)
  const TypingIndicator = () => {
    const [currentDot, setCurrentDot] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentDot((prev) => (prev + 1) % 4);
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

  // select image with expo img picker
  const imagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "livePhotos"],
      allowsEditing: true,
      quality: 0.5,
    });
    if (!result.canceled) {
      setFile(result.assets[0].uri);
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
          <FlatList
            ref={flatListRef}
            data={messages}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            // @ts-ignore
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
                  {typeof item.content === 'string' ? (
                    item.content === "...loading" ? (
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
                    )
                  ) : (
                    <>
                      {item.content.find((c: any) => c.type === 'text') && (
                        <Text
                          style={
                            item.role === "user"
                              ? styles.userText
                              : styles.assistantText
                          }
                        >
                          {item.content.find((c: any) => c.type === 'text').text}
                        </Text>
                      )}
                      {item.content.find((c: any) => c.type === 'image_url') && (
                        <Image 
                          source={{ uri: item.content.find((c: any) => c.type === 'image_url').image_url?.url }}
                          style={{ width: 180, height: 180, borderRadius: 15, marginTop: 8 }}
                        />
                      )}
                    </>
                  )}

                  {item.role === "assistant" &&
                    item.content !== "...loading" && (
                      <Pressable
                        style={styles.clipboardButton}
                        onPress={() => copyToClipboard(item?.content.toString())}
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
            ListFooterComponent={<View style={{ height: 8 }} />}
          />
        </View>

        <View
          style={[
            styles.inputWrapper,
            { paddingBottom: keyboardHeight ? 40 : 10 },
          ]}
        >
          <View>
            {file && (
              <View
                style={{
                  marginBottom: 2,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Image
                  source={{ uri: file }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 15,
                    marginRight: 8,
                  }}
                />
                <TouchableOpacity onPress={() => setFile(null)}>
                  <Axe color={color.WHEAT} size={20} />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={imagePicker}
              >
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// styles unchanged (paste your existing styles)
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
    position: "relative",
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
    paddingRight: 44,
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
    justifyContent: "center",
    alignItems: "center",
  },
});