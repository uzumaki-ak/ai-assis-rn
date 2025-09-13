import { firestoreDb } from "@/config/FirebaseConfig";
import color from "@/shared/color";
import { useAuth, useSSO, useUser } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { doc, setDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Typewriter from "./../components/login-anima/Typewriter.js";

export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function Index() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    console.log("Auth state changed:", { isSignedIn });
    
    if (isSignedIn) {
      router.replace("/(tabs)/Home");
    }
    if (isSignedIn !== undefined) {
      setLoading(false);
    }
  }, [isSignedIn]);

  useWarmUpBrowser();

  const { startSSOFlow } = useSSO();

  const onLoginPress = useCallback(async () => {
    console.log("Login button pressed");
    setLoginLoading(true);
    
    try {
      console.log("Starting SSO flow...");
      
      const result = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: "your-app-scheme", // Replace with your actual scheme
        }),
      });

      console.log("SSO flow result:", result);

      const { createdSessionId, setActive, signIn, signUp } = result;

      // Handle new user signup
      if (signUp) {
        console.log("New user signup detected");
        try {
          await setDoc(doc(firestoreDb, "users", signUp?.emailAddress ?? ""), {
            email: signUp.emailAddress,
            name: signUp.firstName + " " + signUp.lastName,
            joinedDate: Date.now(),
            credits: 20,
          });
          console.log("User document created successfully");
        } catch (firestoreError) {
          console.error("Error creating user document:", firestoreError);
        }
      }

      // Set active session if login was successful
      if (createdSessionId) {
        console.log("Setting active session...");
        if (typeof setActive === "function") {
          await setActive({
            session: createdSessionId,
          });
        } else {
          console.warn("setActive is undefined, cannot set active session.");
        }
        // Navigation will be handled by the useEffect hook above
      } else if (signIn) {
        // Handle incomplete sign in
        console.log("Sign in incomplete, additional steps required");
        Alert.alert(
          "Additional Verification Required", 
          "Please complete the verification process."
        );
      }
    } catch (err) {
      console.error("Login error:", JSON.stringify(err, null, 2));
      
      // Show user-friendly error message
      let errorMessage = "Something went wrong. Please try again.";

      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        typeof (err as { code?: unknown }).code === "string"
      ) {
        const errorCode = (err as { code: string }).code;
        if (errorCode === "form_identifier_not_found") {
          errorMessage = "Account not found. Please check your email or sign up.";
        } else if (errorCode === "session_exists") {
          errorMessage = "You're already signed in.";
        }
      }

      Alert.alert("Login Error", errorMessage);
    } finally {
      setLoginLoading(false);
    }
  }, [startSSOFlow, router]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={color.WHITE} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Image block */}
      <View style={styles.imageWrap}>
        <Image
          source={require("./../assets/images/login.png")}
          style={styles.image}
        />
      </View>

      {/* Text & animation */}
      <View style={styles.content}>
        <Typewriter
          texts={[
            "Welcome to The Ai Assistant",
            "AI- सहायक में आपका स्वागत है",
            "AI-アシスタントへようこそ",
          ]}
          typingSpeed={100}
          deleteSpeed={100}
          pauseDuration={1200}
          spaceBetween={false}
          textStyle={[styles.title, { color: color.WHITE }]}
        />

        <Text style={styles.subtitle}>
          Your smart AI assistant — completely free, always here to help.
        </Text>
      </View>

      {/* Login Button */}
      <TouchableOpacity 
        style={[styles.button, loginLoading && styles.buttonDisabled]} 
        onPress={onLoginPress}
        disabled={loginLoading}
      >
        {loginLoading ? (
          <ActivityIndicator size="small" color={color.WHITE} />
        ) : (
          <Text style={styles.buttonText}>Try it now</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const IMAGE_WIDTH = Dimensions.get("screen").width * 0.89;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 20 : 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: color?.BLACK ?? "#111010ff",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrap: {
    marginBottom: 14,
    alignItems: "center",
  },
  image: {
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH * 0.6,
    resizeMode: "contain",
  },
  content: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: color.GRAY,
    marginBottom: 18,
    lineHeight: 22,
    paddingHorizontal: 6,
  },
  button: {
    alignSelf: "center",
    width: 160,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: color.WHITE ?? "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});