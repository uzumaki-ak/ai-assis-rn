import color from "@/shared/color";
import { useNavigation } from "expo-router";
import { Cog } from "lucide-react-native";
import React, { useEffect } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text
          style={{
            fontFamily: "PoppinsRegular",
            fontSize: 19,
            color: color.WHITE,
          }}
        >
          AI-Poket-Agent
        </Text>
      ),
      headerTitleAlign: "center",
      headerLeft: () => (
        <TouchableOpacity
          style={{
            marginLeft: 15,
            display: "flex",
            flexDirection: "row",
            gap: 5,
            backgroundColor: color.WHITE,
            padding: 5,
            paddingHorizontal: 10,
            borderRadius: 10,
          }}
        >
          <Image
            source={require("../../assets/icons/premium.png")}
            style={{ width: 20, height: 20, borderColor: color.PRIMARY }}
          />
          <Text style={{ color: color.PRIMARY }}>Pro-Ϟ</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 15 }}>
          <Cog size={24} color={color.WHITE} />
        </TouchableOpacity>
      ),
    });
  }, []);

  return (
    <View>
      <Text>Home</Text>
    </View>
  );
}
