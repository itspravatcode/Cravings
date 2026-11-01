import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import React from 'react';
import { Text } from 'react-native';
import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

type ButtonProps = TouchableOpacityProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  disabled,
  loading,
  style,
  ...props
}) => {
  const baseStyles = [
    styles.container,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'outline' && styles.outline,
    disabled && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity
      style={baseStyles}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <Text style={[styles.text, variant === 'outline' && styles.outlineText]}>
          Loading...
        </Text>
      ) : (
        <Text style={[styles.text, variant === 'outline' && styles.outlineText]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disabled: {
    backgroundColor: colors.textMuted,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    color: colors.primary,
  },
});