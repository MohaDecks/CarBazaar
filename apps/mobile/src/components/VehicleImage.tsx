import { useState } from "react";
import { View, Image, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Car } from "lucide-react-native";
import { colors, radius } from "../theme";
import { mediaUrl } from "../lib/vehicle";

interface VehicleImageProps {
  uri?: string | null;
  style?: StyleProp<ViewStyle>;
  radiusSize?: number;
}

export function VehicleImage({
  uri,
  style,
  radiusSize = radius.lg,
}: VehicleImageProps) {
  const [failed, setFailed] = useState(false);
  const source = mediaUrl(uri);

  return (
    <View style={[styles.wrap, { borderRadius: radiusSize }, style]}>
      {source && !failed ? (
        <Image
          source={{ uri: source }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <View style={styles.placeholder}>
          <Car size={28} color={colors.gray400} strokeWidth={1.5} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    aspectRatio: 16 / 10,
    width: "100%",
    overflow: "hidden",
    backgroundColor: colors.muted,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.muted,
  },
});
