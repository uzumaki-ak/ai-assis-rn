// Typewriter.js (or paste into your existing file)
import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";

/**
 * Simple typewriter that cycles through texts.
 * Props you can tune: typingSpeed (ms per char), pauseDuration (ms at full word),
 * deleteSpeed (ms per char deletion), spaceBetween (insert spaces between chars)
 */
export default function Typewriter({
  texts = ["Welcome", "स्वागत", "ようこそ"],
  typingSpeed = 120,
  deleteSpeed = 50,
  pauseDuration = 1000,
  spaceBetween = true,
  textStyle = {},
}) {
  const [langIndex, setLangIndex] = useState(0);
  const [raw, setRaw] = useState(""); // unspaced string under construction
  const [phase, setPhase] = useState("typing"); // 'typing' | 'pause' | 'deleting'
  const mounted = useRef(true);

  // Animated opacity for blinking cursor
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    mounted.current = true;
    // start cursor blink
    Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    ).start();

    return () => {
      mounted.current = false;
      cursorOpacity.stopAnimation();
    };
  }, [cursorOpacity]);

  useEffect(() => {
    if (!mounted.current) return;

    let timeout = null;
    const target = texts[langIndex] ?? "";

    // Use spread to better handle Unicode graphemes (simple approach)
    const chars = [...target];

    if (phase === "typing") {
      // type next char
      if (raw.length < chars.length) {
        timeout = setTimeout(() => {
          if (!mounted.current) return;
          // append next char
          const next = raw + chars[raw.length];
          setRaw(next);
        }, typingSpeed);
      } else {
        // finished typing -> pause then delete
        timeout = setTimeout(() => {
          if (!mounted.current) return;
          setPhase("deleting");
        }, pauseDuration);
      }
    } else if (phase === "deleting") {
      if (raw.length > 0) {
        timeout = setTimeout(() => {
          if (!mounted.current) return;
          setRaw(prev => prev.slice(0, prev.length - 1));
        }, deleteSpeed);
      } else {
        // move to next language
        timeout = setTimeout(() => {
          if (!mounted.current) return;
          setLangIndex((i) => (i + 1) % texts.length);
          setPhase("typing");
        }, 200);
      }
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [raw, phase, langIndex, texts, typingSpeed, deleteSpeed, pauseDuration]);

  // when langIndex changes, reset raw if currently empty and not typing
  useEffect(() => {
    if (!mounted.current) return;
    if (phase === "typing" && raw === "") {
      // safe, will start typing next word due to phase logic
    }
  }, [langIndex]);

  // Format displayed string: optionally insert spaces between characters
  const displayed = spaceBetween ? [...raw].join(" ") : raw;

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Text style={[{ fontSize: 24 }, textStyle]}>{displayed}</Text>
      <Animated.Text
        style={[
          { fontSize: 24, marginLeft: 4, opacity: cursorOpacity },
          textStyle,
        ]}
      >
        |
      </Animated.Text>
    </View>
  );
}
