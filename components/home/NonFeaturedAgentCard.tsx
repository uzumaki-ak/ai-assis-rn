import React from "react";
import { Image, ImageSourcePropType, Text, View } from "react-native";
import { Agent } from "./AgentCard";

type Props = {
  agent: Agent;
};

export default function NonFeaturedAgentCard({ agent }: Props) {
  return (
    <View
      style={{
        backgroundColor: "#071019",
        borderRadius: 12,
        minHeight: 200,
        overflow: "hidden",
        padding: 14,
        position: "relative",
        borderWidth: 1,
        borderColor: "rgba(212,175,55,0.05)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 16,
        elevation: 4,
      }}
    >
      {/* Text content stays in-flow */}
      <View style={{ paddingRight: 10 }}>
        <Text
          style={{
            fontSize: 20,
            fontFamily: "PoppinsRegular",
            color: theme.accent,
          }}
          numberOfLines={2}
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

      {/* match AgentCard: image is absolute so it doesn't change measured height */}
      {agent.image && (
        <View style={{ position: "absolute", right: -6, bottom: 0 }}>
          <Image
            source={agent.image as ImageSourcePropType}
            style={{ width: 120, height: 120, resizeMode: "contain" }}
          />
        </View>
      )}
    </View>
  );
}

const theme = {
  accent: "#F5DEB3",
  muted: "rgba(245,222,179,0.55)",
};
