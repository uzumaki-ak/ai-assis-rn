import color from "@/shared/color";
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
        backgroundColor: color.WHITE,
        borderRadius: 10,
        minHeight: 200,
        overflow: "hidden",
      }}
    >
      <View style={{ padding: 15 }}>
        <Text
          style={{
            fontSize: 20,
            fontFamily: "PoppinsRegular",
          }}
        >
          {agent.name}
        </Text>
        <Text
          numberOfLines={2}
          style={{
            color: color.GRAY,
            marginTop: 2,
            fontFamily: "PoppinsLight",
          }}
        >
          {agent.desc}
        </Text>
      </View>
      <View style={{ position: "absolute", right: -5, bottom: 0 }}>
        {agent.image && (
          <Image
            source={agent.image as ImageSourcePropType}
            style={{ width: 120, height: 120, resizeMode: "contain" }}
          />
        )}
      </View>
    </View>
  );
}
