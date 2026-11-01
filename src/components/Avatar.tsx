import { View, StyleSheet, Image, ImageProps, ViewProps, Text } from 'react-native';
import React from 'react';
import { colors } from '@/theme/colors';

type AvatarProps = ViewProps & {
  src?: string;
  size?: number;
  name?: string;
};

export const Avatar: React.FC<AvatarProps> = ({ src, size = 40, name, style, ...props }) => {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2, backgroundColor: '#ecf0f1', alignItems: 'center', justifyContent: 'center' },
        style,
      ]}
      {...props}
    >
      {src ? (
        <Image
          source={{ uri: src }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : null}
      {!src && (
        <View style={styles.initialContainer}>
          <Text style={styles.initialText}>{initials}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  initialContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
});