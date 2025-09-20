import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CreateAgentBanner() {
  const router = useRouter();
  return (
    <View style={styles.banner}>
      {/* subtle wheat halo behind the image for premium feel */}
      <View style={styles.imageHalo} pointerEvents="none" />
      <Image
        source={require("./../../assets/agents-img/banners.png")}
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Create Your Own Agent</Text>

        <TouchableOpacity
          style={styles.cta}
          activeOpacity={0.86}
          // @ts-ignore
          onPress={() => router.push("/create-agent")}
        >
          <Text style={styles.ctaText}>Create now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const theme = {
  card: "#0b1116", // dark card
  panel: "#071019", // slightly different dark for inner panels
  accent: "#F5DEB3", // wheat
  gold: "#D4AF37",
  muted: "rgba(245,222,179,0.55)",
  border: "rgba(212,175,55,0.06)",
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: theme.card,
    borderRadius: 50,
    display: "flex",
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 15,
    minHeight: 140,
    alignItems: "center",
    padding: 12,
    paddingLeft: 18,
    paddingRight: 18,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
    position: "relative",
  },
  imageHalo: {
    position: "absolute",
    left: 12,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(212,175,55,0.06)",
    transform: [{ scale: 1.05 }],
    zIndex: 0,
  },
  image: {
    width: 120,
    height: 140,
    resizeMode: "contain",
    marginRight: 12,
    zIndex: 2,
  },
  content: {
    padding: 6,
    flex: 1,
    justifyContent: "center",
    zIndex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: "PoppinsRegular",
    color: theme.accent,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  cta: {
    backgroundColor: "transparent",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaText: {
    color: theme.accent,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
