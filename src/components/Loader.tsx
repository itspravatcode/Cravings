import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';

type LoaderProps = {
  size?: 'small' | 'large';
  color?: string;
  containerStyle?: any;
};

export function Loader({ size = 'small', color, containerStyle }: LoaderProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <ActivityIndicator
        size={size === 'large' ? 'large' : 'small'}
        color={color ?? colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
