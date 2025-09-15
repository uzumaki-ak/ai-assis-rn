import color from "@/shared/color";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function CreateAgentBanner() {
  return (
    <View
      style={{
        backgroundColor: color.WHITE,
        borderRadius: 50,
        display: "flex",
        flexDirection: "row",
        marginTop: 10,
        marginBottom:15,
        minHeight: 140, 
        alignItems: "center",
      }}
    >
      <Image
        source={require("./../../assets/agents-img/banners.png")}
        style={{ width: 120, height: 140, resizeMode: "contain" }} 
      />
      <View
        style={{
          padding: 15,
          flex: 1, 
          justifyContent: "center", 
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontFamily:"PoppinsRegular",
            color: color.BLACK,
            marginBottom: 10, 
            
          }}
        >
          Create Your Own Agent
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: color.BLACK,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 5,
            alignSelf: "flex-start", 
          }}
        >
          <Text
            style={{
              color: color.WHITE,
              textAlign: "center",
              fontSize: 12,
            }}
          >
            Create now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
