import React from "react";
import { Image, ImageSourcePropType, Text, View } from "react-native";

type Props = {
  agent: Agent;
};

export type Agent = {
  id: number;
  name: string;
  desc: string;
  image: ImageSourcePropType; // <- local require or remote object
  initialText: string;
  prompt: string;
  type: string;
  featured?: boolean;
};

export default function AgentCard({ agent }: Props) {
  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 12,
        minHeight: 200,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(212,175,55,0.06)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 6,
      }}
    >
      <View style={{ padding: 14 }}>
        <Text
          style={{
            fontSize: 20,
            fontFamily: "PoppinsRegular",
            color: theme.accent,
          }}
        >
          {agent.name}
        </Text>
        <Text
          numberOfLines={2}
          style={{
            color: theme.muted,
            marginTop: 6,
            fontFamily: "PoppinsLight",
            fontSize: 13,
          }}
        >
          {agent.desc}
        </Text>
      </View>

      <View style={{ position: "absolute", right: -6, bottom: 0 }}>
        {agent.image && (
          <Image
            source={agent.image as ImageSourcePropType}
            style={{
              width: 120,
              height: 120,
              resizeMode: "contain",
            }}
          />
        )}
      </View>
    </View>
  );
}

const theme = {
  card: "#0b1116",
  accent: "#F5DEB3",
  muted: "rgba(245,222,179,0.55)",
};
