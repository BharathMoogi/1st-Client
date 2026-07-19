import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';

interface FloatingInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  Icon?: any; // To allow Lucide icons
  isPassword?: boolean;
}

export default function FloatingInput({
  label,
  value,
  onChangeText,
  Icon,
  isPassword = false,
  secureTextEntry,
  ...props
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Shared value representing float state: 0 is placeholder, 1 is floating
  const floatProgress = useSharedValue(0);

  useEffect(() => {
    // Float label if focused or contains text
    const shouldFloat = isFocused || value.length > 0;
    floatProgress.value = withTiming(shouldFloat ? 1 : 0, { duration: 180 });
  }, [isFocused, value]);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Animated style for the floating label text
  const animatedLabelStyle = useAnimatedStyle(() => {
    const translateY = interpolate(floatProgress.value, [0, 1], [16, -6]);
    const scale = interpolate(floatProgress.value, [0, 1], [1, 0.8]);
    const color = interpolateColor(
      floatProgress.value,
      [0, 1],
      ['rgba(255, 255, 255, 0.35)', '#D89A7C']
    );

    return {
      transform: [{ translateY }, { scale }],
      color,
    };
  });

  // Animated style for the container border highlight
  const animatedContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      floatProgress.value,
      [0, 1],
      ['rgba(255, 255, 255, 0.1)', 'rgba(216, 154, 124, 0.7)']
    );
    const shadowOpacity = interpolate(floatProgress.value, [0, 1], [0, 0.15]);

    return {
      borderColor,
      shadowOpacity,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      {/* Icon support */}
      {Icon && (
        <View style={styles.iconWrapper}>
          <Icon size={18} color={isFocused ? '#D89A7C' : 'rgba(0,0,0,0.35)'} />
        </View>
      )}

      <View style={styles.inputWrapper}>
        {/* Animated Floating Label */}
        <Animated.Text
          style={[
            styles.label,
            animatedLabelStyle,
            { left: Icon ? 0 : 4 } // Offset if icon is present
          ]}
          pointerEvents="none"
        >
          {label}
        </Animated.Text>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          placeholder=""
          style={[
            styles.textInput,
            { paddingLeft: Icon ? 0 : 4 }
          ]}
          placeholderTextColor="transparent"
          {...props}
        />
      </View>

      {/* Password toggle eye */}
      {isPassword && (
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          activeOpacity={0.7}
          style={styles.eyeButton}
        >
          <Animated.Text style={styles.eyeText}>
            {showPassword ? 'HIDE' : 'SHOW'}
          </Animated.Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 12,
    marginVertical: 8,
    // iOS shadow glow on focus
    shadowColor: '#D89A7C',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  iconWrapper: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
    height: '100%',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '400',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#2B2B2B',
    fontWeight: '400',
    marginTop: 10, // Push down to accommodate floating label
    textAlignVertical: 'center',
    paddingVertical: 0,
  },
  eyeButton: {
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  eyeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D89A7C',
    letterSpacing: 1.2,
  },
});
