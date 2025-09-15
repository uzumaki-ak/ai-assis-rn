import color from "@/shared/color";
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
        backgroundColor: color.WHITE,
        borderRadius: 10,
        minHeight: 200,
        overflow: "hidden",
        padding: 15,
        position: "relative", // allow absolute children
      }}
    >
      {/* Text content stays in-flow */}
      <View style={{ paddingRight: 10 }}>
        <Text
          style={{
            fontSize: 20,
            fontFamily: "PoppinsRegular",
          }}
          numberOfLines={2}
        >
          {agent.name}
        </Text>
        <Text
          numberOfLines={2}
          style={{
            color: color.GRAY,
            marginTop: 6,
            fontFamily: "PoppinsLight",
          }}
        >
          {agent.desc}
        </Text>
      </View>

      {/* match AgentCard: image is absolute so it doesn't change measured height */}
      {agent.image && (
        <View style={{ position: "absolute", right: -5, bottom: 0 }}>
          <Image
            source={agent.image as ImageSourcePropType}
            style={{ width: 120, height: 120, resizeMode: "contain" }}
          />
        </View>
      )}
    </View>
  );
}
