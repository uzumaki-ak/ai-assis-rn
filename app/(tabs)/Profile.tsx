// app/ProfileScreen.tsx
import color from "@/shared/color";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Clock, Compass, LogOut, PlusCircle } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
  const [pendingLogout, setPendingLogout] = useState(false);

  // handle menu actions; opens themed animated confirmation for logout
  const onMenuLink = async (menuItem: { title: string; path?: any }) => {
    if (!menuItem?.path) return;

    if (menuItem.path === "logout") {
      // open our themed modal
      setShowConfirm(true);
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
});
