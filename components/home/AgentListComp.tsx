// import { Agents } from "@/shared/AgentList";
// import { FlatList, View } from "react-native";
// import AgentCard from "./AgentCard";
// import NonFeaturedAgentCard from "./NonFeaturedAgentCard";

// export default function AgentListComp({ isFeatured }: any) {
//   return (
//     <View>
//       <FlatList
//         data={Agents}
//         numColumns={2}
//         //@ts-ignore
//         renderItem={({ item, index }) =>
//           (item.featured = isFeatured && (
//             <View style={{ flex: 1, padding: 5 }}>
//               {item.featured ? (
//                 <AgentCard agent={item} key={index} />
//               ) : (
//                 <NonFeaturedAgentCard agent={item} key={index} />
//               )}
//             </View>
//           ))
//         }
//       />
//     </View>
//   );
// }

//
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
    <View style={{ marginBottom: 10 }}>
      <FlatList
        data={data}
        numColumns={2}
        scrollEnabled={scrollEnabled} // pass false from Home when inside ScrollView
        keyExtractor={(item: any) => item.id.toString()}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={{ flex: 1, padding: 5 }}
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
