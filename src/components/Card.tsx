import { View, StyleSheet, ViewProps } from 'react-native';
import React from 'react';

type CardProps = ViewProps & {
  children: React.ReactNode;
  padded?: boolean;
};

export const Card: React.FC<CardProps> = ({ children, padded = true, style, ...props }) => {
  return (
    <View
      style={[
        styles.container,
        padded && styles.padded,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  padded: {
    padding: 16,
  },
});