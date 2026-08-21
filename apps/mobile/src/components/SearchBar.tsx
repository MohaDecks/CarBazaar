import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { Search } from "lucide-react-native";
import { useRouter } from "expo-router";
import { colors, radius, shadow, spacing } from "../theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search brand, model or keyword",
}: SearchBarProps) {
  const router = useRouter();

  function submit() {
    router.push({ pathname: "/search", params: { q: value } });
  }

  return (
    <View style={[styles.wrap, shadow.search]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.gray400}
        style={styles.input}
        returnKeyType="search"
        onSubmitEditing={submit}
        accessibilityLabel="Search vehicles"
      />
      <Pressable
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        onPress={submit}
        accessibilityLabel="Submit search"
      >
        <Search size={18} color={colors.white} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.dark,
    paddingVertical: 8,
    paddingRight: 8,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});
