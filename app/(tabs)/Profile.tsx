// app/ProfileScreen.tsx
import color from "@/shared/color";
import { API_KEYS, getApiKey, saveApiKey } from "@/shared/KeyManagement";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
    Clock,
    Compass,
    Eye,
    EyeOff,
    Key,
    LogOut,
    PlusCircle,
    Settings,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ----- Theme (uses shared color plus a gold accent) -----
const THEME = {
  background: color?.LITTLEBLACK ?? "#050505", // made darker
  primary: color?.WHEAT ?? "#EAD9B0",
  accentGold: "#D4AF37",
  danger: "#FF4C4C",
  divider: "#191919",
  overlay: "rgba(0,0,0,0.75)", // stronger overlay
};

// ----- Menu Item Type -----
type MenuItemProps = {
  title: string;
  icon: React.ReactNode;
  path?: any; // flexible for expo-router union types; cast when pushing
  onPress?: () => void;
};

// ----- Animated Confirmation Modal Component -----
const ConfirmModal: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}> = ({
  visible,
  onCancel,
  onConfirm,
  title = "Logout",
  message = "Do you want to logout?",
}) => {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // animate in
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // animate out
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.95,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacity, scale]);

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalCard,
            {
              transform: [{ scale }],
              opacity,
            },
          ]}
        >
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>

          <View style={styles.modalActions}>
            <Pressable style={styles.modalButtonCancel} onPress={onCancel}>
              <Text style={styles.modalButtonCancelText}>Cancel</Text>
            </Pressable>

            <Pressable style={styles.modalButtonConfirm} onPress={onConfirm}>
              <Text style={styles.modalButtonConfirmText}>Logout</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ----- API Settings Modal Component -----
const ApiSettingsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const [keys, setKeys] = useState({
    google: "",
    euron: "",
    openrouter: "",
    mistral: "",
    openai: "",
  });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (visible) {
      loadKeys();
    }
  }, [visible]);

  const loadKeys = async () => {
    const google = await getApiKey(API_KEYS.GOOGLE_AI);
    const euron = await getApiKey(API_KEYS.EURON);
    const openrouter = await getApiKey(API_KEYS.OPENROUTER);
    const mistral = await getApiKey(API_KEYS.MISTRAL);
    const openai = await getApiKey(API_KEYS.OPENAI);
    setKeys({
      google: google || "",
      euron: euron || "",
      openrouter: openrouter || "",
      mistral: mistral || "",
      openai: openai || "",
    });
  };

  const handleSave = async () => {
    await saveApiKey(API_KEYS.GOOGLE_AI, keys.google);
    await saveApiKey(API_KEYS.EURON, keys.euron);
    await saveApiKey(API_KEYS.OPENROUTER, keys.openrouter);
    await saveApiKey(API_KEYS.MISTRAL, keys.mistral);
    await saveApiKey(API_KEYS.OPENAI, keys.openai);
    Alert.alert("Success", "API Keys saved successfully!");
    onClose();
  };

  const toggleVisibility = (name: string) => {
    setShowKeys((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const renderKeyInput = (
    label: string,
    name: keyof typeof keys,
    placeholder: string,
  ) => (
    <View style={styles.apiKeyInputContainer}>
      <Text style={styles.apiKeyLabel}>{label}</Text>
      <View style={styles.apiKeyInputWrapper}>
        <TextInput
          style={styles.apiKeyInput}
          placeholder={placeholder}
          placeholderTextColor="#666"
          value={keys[name]}
          onChangeText={(text) =>
            setKeys((prev) => ({ ...prev, [name]: text }))
          }
          secureTextEntry={!showKeys[name]}
        />
        <TouchableOpacity
          onPress={() => toggleVisibility(name as string)}
          style={styles.eyeIcon}
        >
          {showKeys[name] ? (
            <EyeOff size={20} color={THEME.primary} />
          ) : (
            <Eye size={20} color={THEME.primary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { maxHeight: "80%" }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>API Keys</Text>
            <TouchableOpacity onPress={onClose}>
              <LogOut
                size={20}
                color={THEME.primary}
                transform={[{ rotate: "90deg" }]}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ width: "100%" }}
            showsVerticalScrollIndicator={false}
          >
            {renderKeyInput("Google AI", "google", "Enter Google AI API key")}
            {renderKeyInput("Euron", "euron", "Enter Euron API key")}
            {renderKeyInput(
              "OpenRouter",
              "openrouter",
              "Enter OpenRouter API key",
            )}
            {renderKeyInput("Mistral", "mistral", "Enter Mistral API key")}
            {renderKeyInput("OpenAI", "openai", "Enter OpenAI API key")}
          </ScrollView>

          <TouchableOpacity style={styles.saveKeysButton} onPress={handleSave}>
            <Settings size={20} color="#111" />
            <Text style={styles.saveKeysButtonText}>Save Keys</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ----- Profile Header Component -----
const ProfileHeader: React.FC<{ user: ReturnType<typeof useUser>["user"] }> = ({
  user,
}) => (
  <View style={styles.profileSection}>
    <Image
      source={{
        uri:
          (user?.imageUrl as string) ||
          "https://randomuser.me/api/portraits/men/75.jpg",
      }}
      style={styles.profileImage}
    />
    <Text style={styles.username}>{user?.firstName || "Guest"}</Text>
    <Text style={styles.email}>
      {user?.primaryEmailAddress?.emailAddress ?? "no-email@example.com"}
    </Text>
  </View>
);

// ----- Menu Item Component -----
const MenuItem: React.FC<MenuItemProps> = ({ title, icon, onPress }) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.75}
  >
    {icon}
    <Text style={styles.menuText}>{title}</Text>
  </TouchableOpacity>
);

// ----- Menu List Component -----
const MenuList: React.FC<{
  onMenuLink: (item: { title: string; path?: any }) => void;
}> = ({ onMenuLink }) => {
  const menuItems: MenuItemProps[] = [
    {
      title: "Create Agent",
      icon: <PlusCircle size={22} color={THEME.primary} />,
      path: "/create-agent",
    },
    {
      title: "Explore",
      icon: <Compass size={22} color={THEME.primary} />,
      path: "(tabs)/Explore",
    },
    {
      title: "My History",
      icon: <Clock size={22} color={THEME.primary} />,
      path: "(tabs)/History",
    },
    {
      title: "API Settings",
      icon: <Key size={22} color={THEME.primary} />,
      path: "api_settings",
    },
    {
      title: "Logout",
      icon: <LogOut size={22} color={THEME.danger} />,
      path: "logout",
    },
  ];

  return (
    <View style={styles.menu}>
      {menuItems.map((item, index) => (
        <MenuItem
          key={index}
          title={item.title}
          icon={item.icon}
          onPress={() => onMenuLink({ title: item.title, path: item.path })}
        />
      ))}
    </View>
  );
};

// ----- Main Profile Screen -----
export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [showConfirm, setShowConfirm] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [pendingLogout, setPendingLogout] = useState(false);

  // handle menu actions; opens themed animated confirmation for logout
  const onMenuLink = async (menuItem: { title: string; path?: any }) => {
    if (!menuItem?.path) return;

    if (menuItem.path === "logout") {
      // open our themed modal
      setShowConfirm(true);
      return;
    } else if (menuItem.path === "api_settings") {
      setShowApiSettings(true);
      return;
    } else {
      // Cast to any to satisfy expo-router's strict union route types
      router.push(menuItem.path as any);
    }
  };

  const handleConfirmCancel = () => {
    setShowConfirm(false);
  };

  const handleConfirmLogout = async () => {
    setPendingLogout(true);
    try {
      await signOut();
      router.replace("/");
    } catch (err) {
      console.warn("Sign out failed", err);
      // fallback small feedback: close modal and reset
      setPendingLogout(false);
      setShowConfirm(false);
    }
  };

  return (
    <View style={{ backgroundColor: color.BLACK }}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Info */}
        <ProfileHeader user={user} />

        {/* Menu */}
        <MenuList onMenuLink={onMenuLink} />
      </ScrollView>

      {/* Themed animated confirmation modal */}
      <ConfirmModal
        visible={showConfirm}
        onCancel={handleConfirmCancel}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out from your account?"
      />

      <ApiSettingsModal
        visible={showApiSettings}
        onClose={() => setShowApiSettings(false)}
      />

      {/* Optional loader overlay when pending logout */}
      {pendingLogout && (
        <View style={styles.pendingOverlay}>
          <View style={styles.pendingBox}>
            <Text style={styles.pendingText}>Signing out…</Text>
          </View>
        </View>
      )}
    </View>
  );
}

// ----- Styles -----
const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  // slightly darkened image so content is readable
  bgImage: {
    opacity: 0.85,
  },
  container: {
    flexGrow: 1,
    minHeight: "100%",
    backgroundColor: "transparent",
    alignItems: "center",
    paddingVertical: 72,
    paddingHorizontal: 20,
    justifyContent: "flex-start",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 36,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingVertical: 18,
    borderRadius: 14,
    width: "95%",
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 60,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: THEME.primary,
    backgroundColor: "#000",
  },
  username: {
    fontSize: 18,
    color: THEME.primary,
    fontWeight: "700",
  },
  email: {
    fontSize: 14,
    color: "#D9D9D9",
    marginTop: 6,
  },
  menu: {
    width: "95%",
    marginTop: 16,
    backgroundColor: "rgba(0,0,0,0.28)",
    borderRadius: 12,
    paddingVertical: 6,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.divider,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 14,
    color: THEME.primary,
    fontWeight: "600",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: THEME.overlay,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  modalCard: {
    backgroundColor: THEME.background,
    borderRadius: 14,
    padding: 20,
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.primary,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: "#D0D0D0",
    textAlign: "center",
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  modalButtonCancel: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  modalButtonCancelText: {
    color: "#D0D0D0",
    fontWeight: "600",
  },
  modalButtonConfirm: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: THEME.accentGold,
  },
  modalButtonConfirmText: {
    color: "#111",
    fontWeight: "700",
  },

  // pending overlay
  pendingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  pendingBox: {
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },
  pendingText: {
    color: THEME.primary,
    fontWeight: "600",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  apiKeyInputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  apiKeyLabel: {
    color: THEME.primary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  apiKeyInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
  },
  apiKeyInput: {
    flex: 1,
    height: 48,
    color: "#fff",
    fontSize: 14,
  },
  eyeIcon: {
    padding: 8,
  },
  saveKeysButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.primary,
    width: "100%",
    height: 50,
    borderRadius: 12,
    marginTop: 20,
    gap: 10,
  },
  saveKeysButtonText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "700",
  },
});
