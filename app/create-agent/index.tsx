import { firestoreDb } from "@/config/FirebaseConfig";
import { useUser } from "@clerk/clerk-expo";
import { useNavigation, useRouter } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import EmojiPicker from "rn-emoji-keyboard";

export default function CreateAgent() {
  const [emoji, setEmoji] = useState("🐽");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [agentName, setAgentName] = useState<string>("");
  const [instruction, setInstruction] = useState<string>("");
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultModalPayload, setResultModalPayload] = useState<{
    title: string;
    message: string;
    agentId?: string;
    agentName?: string;
    agentPrompt?: string;
  } | null>(null);

  const navigation = useNavigation();
  const router = useRouter();
  const { user } = useUser();

  // animations
  const containerFade = useRef(new Animated.Value(0)).current;
  const formTranslate = useRef(new Animated.Value(18)).current;
  const emojiPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: "Create Agent",
      headerStyle: {
        backgroundColor: stylesTheme.pageBackground.backgroundColor,
        borderBottomWidth: 0,
        shadowColor: "transparent",
        elevation: 0,
      },
      headerTintColor: stylesTheme.accent,
      headerTitleStyle: {
        color: stylesTheme.accent,
        fontWeight: "700",
        letterSpacing: 0.2,
      },
    });

    Animated.sequence([
      Animated.timing(containerFade, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.parallel([
        Animated.timing(formTranslate, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(emojiPulse, {
              toValue: 1.06,
              duration: 700,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.quad),
            }),
            Animated.timing(emojiPulse, {
              toValue: 0.98,
              duration: 700,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.quad),
            }),
          ])
        ),
      ]),
    ]).start();
  }, []);

  const CreateAgent = async () => {
    if (!agentName || !emoji || !instruction) {
      // show our custom modal instead of native Alert
      setResultModalPayload({
        title: "Missing fields",
        message: "bro write something",
      });
      setResultModalVisible(true);
      return;
    }
    const agentId = Date.now().toString();
    await setDoc(doc(firestoreDb, "agents", agentId), {
      emoji: emoji,
      agentId: agentId,
      agentName: agentName,
      prompt: instruction,
      userEmail: user?.primaryEmailAddress?.emailAddress,
    });

    // open the custom confirmation modal with the exact two choices (OK and Try now)
    setResultModalPayload({
      title: "confirmation",
      message: "done-sensei🫡",
      agentId,
      agentName,
      agentPrompt: instruction,
    });
    setResultModalVisible(true);

    // keep form values cleared after creating (same as before)
    setAgentName("");
    setInstruction("");
  };

  // handler for modal button "Try now"
  const handleTryNow = (payload: any) => {
    setResultModalVisible(false);
    if (payload?.agentId) {
      router.push({
        pathname: "/chat",
        params: {
          agentName: payload.agentName,
          initialText: "",
          agentPrompt: payload.agentPrompt,
          agentId: payload.agentId,
          emoji: emoji,
        },
      });
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: containerFade,
          transform: [
            {
              translateY: containerFade.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Animated.View style={{ transform: [{ translateY: formTranslate }] }}>
        <View style={styles.emojiRow}>
          <Animated.View style={{ transform: [{ scale: emojiPulse }] }}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.emojiButton}
              onPress={() => setIsOpen(true)}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          </Animated.View>

          <EmojiPicker
            onEmojiSelected={(event) => setEmoji(event.emoji)}
            open={isOpen}
            onClose={() => setIsOpen(false)}
            // theme override: makes the picker's modal dark + wheat accents
            theme={{
              backdrop: "#000000AA",
              knob: "#D4AF37",
              container: "#0b0f14",
              header: "#071019",
              category: {
                icon: "#F5DEB3",
                iconActive: "#D4AF37",
                container: "#0b0f14",
                containerActive: "#10131a",
              },
              search: {
                text: stylesTheme.accent,
                placeholder: "rgba(245,222,179,0.45)",
                icon: "rgba(245,222,179,0.45)",
                background: "#060709",
              },
            }}
            // you can also pass customButtons, styles, etc. (docs allow this)
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Agent / Assist name</Text>
          <TextInput
            placeholder="agent-name"
            placeholderTextColor={stylesTheme.placeholder}
            style={styles.input}
            value={agentName}
            onChangeText={(v) => setAgentName(v)}
            selectionColor={stylesTheme.accent}
            keyboardAppearance="dark"
          />
        </View>

        <View style={[styles.field, { paddingTop: 15 }]}>
          <Text style={styles.label}>Instruction</Text>
          <TextInput
            placeholder="ex. you are my girlfriend help my mental health"
            placeholderTextColor={stylesTheme.placeholder}
            style={[styles.input, styles.textArea]}
            multiline={true}
            value={instruction}
            onChangeText={(v) => setInstruction(v)}
            selectionColor={stylesTheme.accent}
            keyboardAppearance="dark"
          />
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={CreateAgent}
          activeOpacity={0.85}
        >
          <Text style={styles.createButtonText}>Create agent</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ----- Custom result modal (styled dark/wheat) ----- */}
      <Modal
        visible={resultModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResultModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Animated.View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{resultModalPayload?.title}</Text>
            <Text style={styles.modalMessage}>
              {resultModalPayload?.message}
            </Text>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { borderColor: "rgba(245,222,179,0.12)" },
                ]}
                onPress={() => setResultModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>

              {resultModalPayload?.agentId ? (
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalPrimary]}
                  onPress={() => handleTryNow(resultModalPayload)}
                >
                  <Text style={[styles.modalButtonText, { fontWeight: "700" }]}>
                    Try now
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </Animated.View>
  );
}

/* ---------- Theme + styles (dark + wheat/gold) ---------- */
const stylesTheme = {
  pageBackground: { backgroundColor: "#06070A" }, // deep almost-black
  card: "#0f1722",
  inputCard: "#0b1116",
  accent: "#F5DEB3", // wheat
  gold: "#D4AF37",
  placeholder: "rgba(245,222,179,0.45)",
  muted: "rgba(245,222,179,0.22)",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    minHeight: "100%",
    ...stylesTheme.pageBackground,
  },
  emojiRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emojiButton: {
    padding: 18,
    borderWidth: 1,
    borderRadius: 16,
    borderColor: "rgba(212,175,55,0.18)",
    backgroundColor: "#0b0f14",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8,
  },
  emojiText: {
    fontSize: 34,
    lineHeight: Platform.OS === "ios" ? 38 : 36,
    textShadowColor: "rgba(212,175,55,0.06)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  field: {
    marginBottom: 6,
  },
  label: {
    color: stylesTheme.accent,
    fontSize: 13,
    marginBottom: 6,
    opacity: 0.95,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: stylesTheme.inputCard,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: stylesTheme.accent,
    marginTop: 4,
    paddingTop: 14,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  textArea: {
    height: 180,
    textAlignVertical: "top",
  },
  createButton: {
    paddingVertical: 14,
    marginTop: 18,
    borderRadius: 12,
    backgroundColor: "#0f1724",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.14)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 8,
  },
  createButtonText: {
    color: stylesTheme.accent,
    fontSize: 17,
    textAlign: "center",
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  /* modal styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 26,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#0b0f14",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.32,
    shadowRadius: 30,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 16,
    color: stylesTheme.accent,
    marginBottom: 8,
    fontWeight: "700",
  },
  modalMessage: {
    color: stylesTheme.accent,
    opacity: 0.95,
    fontSize: 15,
    marginBottom: 16,
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "transparent",
    marginLeft: 8,
  },
  modalPrimary: {
    backgroundColor: "#142029",
    borderColor: "rgba(212,175,55,0.12)",
  },
  modalButtonText: {
    color: stylesTheme.accent,
    fontSize: 15,
  },
});
