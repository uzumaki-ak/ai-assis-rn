import { Agents } from "@/shared/AgentList";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import AgentCard from "./AgentCard";
import NonFeaturedAgentCard from "./NonFeaturedAgentCard";

export default function AgentListComp({
  isFeatured,
  scrollEnabled = true,
}: any) {
  // filter instead of assigning
  const data = Agents.filter((a: any) => !!a.featured === !!isFeatured);
  const router = useRouter();

  return (
    <View style={{ marginBottom: 12 }}>
      <FlatList
        data={data}
        numColumns={2}
        scrollEnabled={scrollEnabled} // pass false from Home when inside ScrollView
        keyExtractor={(item: any) => item.id.toString()}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: 10,
        }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={{ flex: 1, padding: 6 }}
            onPress={() =>
              router.push({
                pathname: "/chat" as any,
                params: {
                  agentName: item.name,
                  initialText: item.initialText,
                  agentPrompt: item.prompt,
                  agentId: item.id,
                },
              })
            }
            activeOpacity={0.86}
          >
            {isFeatured ? (
              <AgentCard agent={item} />
            ) : (
              <NonFeaturedAgentCard agent={item} />
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<View />}
      />
    </View>
  );
}
