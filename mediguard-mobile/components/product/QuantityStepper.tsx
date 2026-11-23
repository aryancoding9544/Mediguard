import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  onIncrement,
  onDecrement,
}) => {
  return (
    <View style={styles.stepperContainer}>
      <TouchableOpacity
        onPress={onDecrement}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.stepButton}
      >
        <Text style={styles.minusText}>{'\u2212'}</Text>
      </TouchableOpacity>

      <Text style={styles.quantityText}>{quantity}</Text>

      <TouchableOpacity
        onPress={onIncrement}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.plusButtonCircle}
      >
        <Text style={styles.plusText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 26,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 16,
  },
  stepButton: {
    paddingHorizontal: 6,
  },
  minusText: {
    fontSize: 22,
    color: Colors.textSecondary,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    lineHeight: 24,
  },
  quantityText: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.textPrimary,
  },
  plusButtonCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
    lineHeight: 18,
  },
});
