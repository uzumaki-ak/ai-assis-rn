import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";

export default function RootLayout() {
  const [loaded] = useFonts({
    PoppinsRegular:require("../assets/fonts/Poppins/Poppins-Regular.ttf"),
  });

  return (
    <ClerkProvider tokenCache={tokenCache}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </ClerkProvider>
  );
}
