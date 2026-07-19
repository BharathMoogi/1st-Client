import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, G, Line } from 'react-native-svg';
import { useCartQuery, useCreateOrderMutation, useRemoveFromCartMutation } from '../api/hooks';
import { auth } from '../api/firebase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- VECTOR ICONS FOR CHECKOUT FLOW ---
const ChevronLeftIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m15 18-6-6 6-6" />
  </Svg>
);

const CheckIcon = ({ color = '#80CBC4' }: { color?: string }) => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6 9 17l-5-5" />
  </Svg>
);

const PinIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="2">
    <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <Circle cx="12" cy="10" r="3" />
  </Svg>
);

const TruckIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="2">
    <Rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <Circle cx="5.5" cy="18.5" r="2.5" />
    <Circle cx="18.5" cy="18.5" r="2.5" />
  </Svg>
);

const CardIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="2">
    <Rect x="2" y="5" width="20" height="14" rx="2" />
    <Line x1="2" y1="10" x2="22" y2="10" />
  </Svg>
);

const CircleCheckIcon = () => (
  <Svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="2">
    <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </Svg>
);

export default function CheckoutScreen() {
  const router = useRouter();

  // Firebase hooks
  const { data: cartItems = [] } = useCartQuery();
  const createOrder = useCreateOrderMutation();
  const removeFromCart = useRemoveFromCartMutation();

  // Checkout Step state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Confirmed order data (shown in step 4)
  const [confirmedOrderId, setConfirmedOrderId] = useState('');
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Step 1: Address states
  const [selectedAddress, setSelectedAddress] = useState<'home' | 'office'>('home');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newZip, setNewZip] = useState('');

  // Step 2: Shipping states
  const [shippingMode, setShippingMode] = useState<'standard' | 'express'>('standard');

  // Step 3: Payment states
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'net' | 'cod'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Cart totals
  const itemsTotal = (cartItems as any[]).reduce((sum: number, item: any) => sum + (item.price ?? 0) * (item.quantity ?? 1), 0);
  const shippingFee = shippingMode === 'express' ? 15 : 0;
  const grandTotal = itemsTotal + shippingFee;

  // Animation values
  const stepLineWidth = useSharedValue(0);
  const successBadgeScale = useSharedValue(0.5);

  // Mount animation values
  const mountOpacity = useSharedValue(0);
  const mountTranslateY = useSharedValue(20);

  useEffect(() => {
    mountOpacity.value = withTiming(1, { duration: 600 });
    mountTranslateY.value = withSpring(0, { damping: 15 });
  }, []);

  const animatedMountStyle = useAnimatedStyle(() => ({
    opacity: mountOpacity.value,
    transform: [{ translateY: mountTranslateY.value }],
  }));

  useEffect(() => {
    // Map currentStep to width of stepper line
    let target = 0;
    if (currentStep === 2) target = 0.33;
    else if (currentStep === 3) target = 0.66;
    else if (currentStep === 4) target = 1.0;
    stepLineWidth.value = withTiming(target, { duration: 400 });

    if (currentStep === 4) {
      successBadgeScale.value = withSequence(
        withSpring(1.4, { damping: 5 }),
        withSpring(1.0, { damping: 10 })
      );
    }
  }, [currentStep]);

  // Next and Back controls
  const handleNext = () => {
    if (currentStep < 3) setCurrentStep((prev) => (prev + 1) as any);
  };

  const handleBack = () => {
    if (currentStep > 1 && currentStep < 4) {
      setCurrentStep((prev) => (prev - 1) as any);
    } else if (currentStep === 1) {
      router.back();
    }
  };

  // ── FIREBASE: PLACE ORDER ──
  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const user = auth.currentUser;
      const addressText = selectedAddress === 'home'
        ? 'Flat 302, Golden Monogram Heights, Bandra West, Mumbai - 400050'
        : 'Aurum Labs Inc, Corporate Hub Sector 4, BKC Bandra East - 400051';

      const orderId = await createOrder.mutateAsync({
        userId: user?.uid ?? 'guest',
        userEmail: user?.email ?? 'guest',
        items: cartItems,
        address: addressText,
        shippingMode,
        paymentMethod,
        itemsTotal,
        shippingFee,
        total: grandTotal,
        status: 'Pending',
      });

      // Clear all cart items
      for (const item of cartItems as any[]) {
        await removeFromCart.mutateAsync(item.id);
      }

      setConfirmedOrderId(orderId);
      setConfirmedTotal(grandTotal);
      setCurrentStep(4);
    } catch (e) {
      console.error('Order failed:', e);
    }
    setIsPlacingOrder(false);
  };

  // Reanimated style bindings
  const animatedLineStyle = useAnimatedStyle(() => ({
    width: `${stepLineWidth.value * 100}%`,
  }));

  const animatedSuccessStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successBadgeScale.value }],
  }));

  // Stepper Header Label
  const getStepTitle = () => {
    if (currentStep === 1) return 'DELIVERY ADDRESS';
    if (currentStep === 2) return 'SHIPPING METHOD';
    if (currentStep === 3) return 'PAYMENT METHODS';
    return 'ORDER CONFIRMATION';
  };

  return (
    <View style={styles.container}>
      {/* Background Gradients */}
      <LinearGradient
        colors={['#1A1A1A', '#0F0D0A', '#1A1A1A']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Ambient gold glow */}
      <View style={{ position: 'absolute', top: -80, right: -80, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(212,175,55,0.04)' }} />

      {/* --- TOP HEADER APP BAR --- */}
      <Animated.View style={[styles.header, animatedMountStyle]}>
        {currentStep < 4 ? (
          <TouchableOpacity onPress={handleBack} activeOpacity={0.7} style={styles.backButton}>
            <ChevronLeftIcon />
          </TouchableOpacity>
        ) : <View style={{ width: 36 }} />}
        <Text style={styles.headerTitle}>{getStepTitle()}</Text>
        <Text style={styles.stepIndicatorText}>STEP {currentStep} OF 4</Text>
      </Animated.View>

      {/* --- PROGRESS STEPPER TRACKER --- */}
      <Animated.View style={[styles.stepperContainer, animatedMountStyle]}>
        {/* Connector Line Background */}
        <View style={styles.stepperLineBackground} />
        {/* Connector Line Active */}
        <Animated.View style={[styles.stepperLineActive, animatedLineStyle]} />

        {/* Step Circles */}
        <View style={styles.stepperStepsRow}>
          {[1, 2, 3, 4].map((step) => {
            const isActive = currentStep === step;
            const isCompleted = currentStep > step;
            return (
              <View
                key={step}
                style={[
                  styles.stepCircle,
                  isActive ? styles.stepCircleActive : isCompleted ? styles.stepCircleCompleted : null,
                ]}
              >
                {isCompleted ? (
                  <CheckIcon color="#1A1A1A" />
                ) : (
                  <Text style={[styles.stepCircleText, isActive ? styles.stepCircleTextActive : null]}>
                    {step === 1 ? <PinIcon /> : step === 2 ? <TruckIcon /> : step === 3 ? <CardIcon /> : '✔'}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* --- STEP FLOW VIEWER --- */}
      <Animated.ScrollView style={[styles.scrollContainer, animatedMountStyle]} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* STEP 1: ADDRESS DETAILS */}
        {currentStep === 1 && (
          <View style={styles.stepBody}>
            <Text style={styles.stepTitle}>Select Delivery Address</Text>
            
            {/* Existing Address List */}
            <TouchableOpacity
              onPress={() => setSelectedAddress('home')}
              activeOpacity={0.8}
              style={[styles.addressCard, selectedAddress === 'home' ? styles.addressCardActive : null]}
            >
              <View style={selectedAddress === 'home' ? styles.radioChecked : styles.radioUnchecked}>
                {selectedAddress === 'home' && <View style={styles.radioCore} />}
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressName}>Home Address</Text>
                <Text style={styles.addressText}>
                  Flat 302, Golden Monogram Heights, Bandra West, Mumbai, MH - 400050.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedAddress('office')}
              activeOpacity={0.8}
              style={[styles.addressCard, selectedAddress === 'office' ? styles.addressCardActive : null]}
            >
              <View style={selectedAddress === 'office' ? styles.radioChecked : styles.radioUnchecked}>
                {selectedAddress === 'office' && <View style={styles.radioCore} />}
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressName}>Office Address</Text>
                <Text style={styles.addressText}>
                  Aurum Labs Inc, Corporate Hub Sector 4, BKC Bandra East, MH - 400051.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Add Address Collapsible form */}
            <TouchableOpacity
              onPress={() => setShowNewAddressForm(!showNewAddressForm)}
              activeOpacity={0.8}
              style={styles.addAddressToggleBtn}
            >
              <Text style={styles.addAddressToggleText}>+ Add New Delivery Address</Text>
            </TouchableOpacity>

            {showNewAddressForm && (
              <View style={styles.newAddressForm}>
                <TextInput
                  placeholder="Street / Flat Number"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={newStreet}
                  onChangeText={setNewStreet}
                  style={styles.formInput}
                />
                <TextInput
                  placeholder="City"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={newCity}
                  onChangeText={setNewCity}
                  style={styles.formInput}
                />
                <TextInput
                  placeholder="ZIP / Postal Code"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={newZip}
                  onChangeText={setNewZip}
                  keyboardType="numeric"
                  style={styles.formInput}
                />
              </View>
            )}

            <TouchableOpacity onPress={handleNext} activeOpacity={0.85} style={styles.stepButton}>
              <LinearGradient colors={['#009688', '#00796B']} style={StyleSheet.absoluteFill} />
              <Text style={styles.stepButtonText}>CONTINUE TO SHIPPING</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: SHIPPING METHODS */}
        {currentStep === 2 && (
          <View style={styles.stepBody}>
            <Text style={styles.stepTitle}>Select Shipping Option</Text>

            <TouchableOpacity
              onPress={() => setShippingMode('standard')}
              activeOpacity={0.8}
              style={[styles.shippingCard, shippingMode === 'standard' ? styles.shippingCardActive : null]}
            >
              <View style={shippingMode === 'standard' ? styles.radioChecked : styles.radioUnchecked}>
                {shippingMode === 'standard' && <View style={styles.radioCore} />}
              </View>
              <View style={styles.shippingInfo}>
                <Text style={styles.shippingName}>Standard Delivery (3-5 Days)</Text>
                <Text style={styles.shippingPriceText}>FREE Shipping</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShippingMode('express')}
              activeOpacity={0.8}
              style={[styles.shippingCard, shippingMode === 'express' ? styles.shippingCardActive : null]}
            >
              <View style={shippingMode === 'express' ? styles.radioChecked : styles.radioUnchecked}>
                {shippingMode === 'express' && <View style={styles.radioCore} />}
              </View>
              <View style={styles.shippingInfo}>
                <Text style={styles.shippingName}>Express VIP Delivery (1-2 Days)</Text>
                <Text style={styles.shippingPriceText}>+$15.00 Delivery Fee</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleNext} activeOpacity={0.85} style={styles.stepButton}>
              <LinearGradient colors={['#009688', '#00796B']} style={StyleSheet.absoluteFill} />
              <Text style={styles.stepButtonText}>CONTINUE TO PAYMENT</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 3: PAYMENT METHODS */}
        {currentStep === 3 && (
          <View style={styles.stepBody}>
            <Text style={styles.stepTitle}>Select Payment Method</Text>

            {/* UPI Accordion Tab */}
            <View style={styles.paymentMethodWrapper}>
              <TouchableOpacity
                onPress={() => setPaymentMethod('upi')}
                activeOpacity={0.8}
                style={[styles.paymentHeader, paymentMethod === 'upi' ? styles.paymentHeaderActive : null]}
              >
                <Text style={styles.paymentHeaderTitle}>UPI (GPay / PhonePe)</Text>
              </TouchableOpacity>
              {paymentMethod === 'upi' && (
                <View style={styles.paymentBody}>
                  <TextInput
                    placeholder="Enter UPI ID (e.g. user@okhdfcbank)"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={upiId}
                    onChangeText={setUpiId}
                    autoCapitalize="none"
                    style={styles.formInput}
                  />
                </View>
              )}
            </View>

            {/* Credit/Debit Card Accordion Tab */}
            <View style={styles.paymentMethodWrapper}>
              <TouchableOpacity
                onPress={() => setPaymentMethod('card')}
                activeOpacity={0.8}
                style={[styles.paymentHeader, paymentMethod === 'card' ? styles.paymentHeaderActive : null]}
              >
                <Text style={styles.paymentHeaderTitle}>Credit / Debit Card</Text>
              </TouchableOpacity>
              {paymentMethod === 'card' && (
                <View style={styles.paymentBody}>
                  <TextInput
                    placeholder="16-Digit Card Number"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    keyboardType="numeric"
                    style={styles.formInput}
                  />
                  <View style={styles.cardInputRow}>
                    <TextInput
                      placeholder="MM/YY"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={cardExpiry}
                      onChangeText={setCardExpiry}
                      style={[styles.formInput, { flex: 1 }]}
                    />
                    <TextInput
                      placeholder="CVV"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={cardCvv}
                      onChangeText={setCardCvv}
                      keyboardType="numeric"
                      secureTextEntry
                      style={[styles.formInput, { flex: 1 }]}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Net Banking Tab */}
            <View style={styles.paymentMethodWrapper}>
              <TouchableOpacity
                onPress={() => setPaymentMethod('net')}
                activeOpacity={0.8}
                style={[styles.paymentHeader, paymentMethod === 'net' ? styles.paymentHeaderActive : null]}
              >
                <Text style={styles.paymentHeaderTitle}>Net Banking</Text>
              </TouchableOpacity>
              {paymentMethod === 'net' && (
                <View style={styles.paymentBody}>
                  <Text style={styles.netBankingText}>Select bank from options at checkout gateway.</Text>
                </View>
              )}
            </View>

            {/* Cash on Delivery Tab */}
            <View style={styles.paymentMethodWrapper}>
              <TouchableOpacity
                onPress={() => setPaymentMethod('cod')}
                activeOpacity={0.8}
                style={[styles.paymentHeader, paymentMethod === 'cod' ? styles.paymentHeaderActive : null]}
              >
                <Text style={styles.paymentHeaderTitle}>Cash on Delivery (COD)</Text>
              </TouchableOpacity>
              {paymentMethod === 'cod' && (
                <View style={styles.paymentBody}>
                  <Text style={styles.codText}>Pay cash/UPI at the door upon supplement delivery.</Text>
                </View>
              )}
            </View>

            <TouchableOpacity onPress={handlePlaceOrder} activeOpacity={0.85} style={[styles.stepButton, isPlacingOrder && { opacity: 0.7 }]} disabled={isPlacingOrder}>
              <LinearGradient colors={['#009688', '#00796B']} style={StyleSheet.absoluteFill} />
              {isPlacingOrder
                ? <ActivityIndicator color="#1A1A1A" />
                : <Text style={styles.stepButtonText}>PLACE ORDER & PAY</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 4: ORDER CONFIRMATION */}
        {currentStep === 4 && (
          <View style={[styles.stepBody, { alignItems: 'center' }]}>
            {/* Success badge */}
            <Animated.View style={[styles.successBadge, animatedSuccessStyle]}>
              <CircleCheckIcon />
            </Animated.View>

            <Text style={styles.successTitle}>Order Placed Successfully!</Text>
            <Text style={styles.successSubtitle}>Thank you for choosing Aurum Wellness</Text>

            {/* Receipt details */}
            <View style={styles.receiptBox}>
              <LinearGradient
                colors={['rgba(0,150,136,0.05)', 'rgba(255,255,255,0.01)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Order ID</Text>
                <Text style={styles.receiptValue}>#{confirmedOrderId.slice(-8).toUpperCase()}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Total Amount</Text>
                <Text style={styles.receiptValue}>₹{confirmedTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Estimated Delivery</Text>
                <Text style={styles.receiptValue}>{shippingMode === 'express' ? '1-2 Business Days' : '3-5 Business Days'}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Payment</Text>
                <Text style={styles.receiptValue}>{paymentMethod.toUpperCase()}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => router.replace('/')} activeOpacity={0.85} style={styles.stepButton}>
              <LinearGradient colors={['#009688', '#00796B']} style={StyleSheet.absoluteFill} />
              <Text style={styles.stepButtonText}>RETURN TO HOME</Text>
            </TouchableOpacity>
          </View>
        )}

      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 60,
    height: 48,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(0,150,136,0.08)',
    paddingBottom: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1A1A1A',
    letterSpacing: 2,
  },
  stepIndicatorText: {
    fontSize: 9,
    color: '#009688',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  
  // Stepper styles
  stepperContainer: {
    height: 40,
    width: SCREEN_WIDTH - 80,
    alignSelf: 'center',
    marginVertical: 20,
    position: 'relative',
    justifyContent: 'center',
  },
  stepperLineBackground: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'rgba(0,150,136,0.12)',
    width: '100%',
  },
  stepperLineActive: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#009688',
  },
  stepperStepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E1B15',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    borderColor: '#009688',
    shadowColor: '#009688',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  stepCircleCompleted: {
    backgroundColor: '#80CBC4',
    borderColor: '#80CBC4',
  },
  stepCircleText: {
    fontSize: 9,
    color: 'rgba(0,0,0,0.35)',
    fontWeight: '700',
  },
  stepCircleTextActive: {
    color: '#80CBC4',
  },

  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  stepBody: {
    gap: 16,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  
  // Step 1: Address Card
  addressCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(0,150,136,0.10)',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.01)',
    gap: 14,
    alignItems: 'center',
  },
  addressCardActive: {
    borderColor: '#009688',
    backgroundColor: 'rgba(224, 176, 52, 0.04)',
  },
  radioChecked: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#009688',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioUnchecked: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  radioCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#80CBC4',
  },
  addressInfo: {
    flex: 1,
    gap: 4,
  },
  addressName: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  addressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 16,
    fontWeight: '300',
  },
  addAddressToggleBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  addAddressToggleText: {
    color: '#80CBC4',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  newAddressForm: {
    gap: 12,
  },
  formInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,150,136,0.10)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingHorizontal: 16,
    color: '#1A1A1A',
    fontSize: 13,
  },

  // Step 2: Shipping Card
  shippingCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(0,150,136,0.10)',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.01)',
    gap: 14,
    alignItems: 'center',
  },
  shippingCardActive: {
    borderColor: '#009688',
    backgroundColor: 'rgba(224, 176, 52, 0.04)',
  },
  shippingInfo: {
    flex: 1,
    gap: 4,
  },
  shippingName: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  shippingPriceText: {
    fontSize: 12,
    color: '#80CBC4',
    fontWeight: '600',
  },
  
  // Step 3: Payment Method
  paymentMethodWrapper: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,150,136,0.10)',
    backgroundColor: 'rgba(255,255,255,0.01)',
    overflow: 'hidden',
  },
  paymentHeader: {
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  paymentHeaderActive: {
    backgroundColor: 'rgba(224, 176, 52, 0.06)',
    borderBottomWidth: 0.5,
    borderColor: 'rgba(224,176,52,0.2)',
  },
  paymentHeaderTitle: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '400',
  },
  paymentBody: {
    padding: 16,
    gap: 12,
  },
  cardInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  netBankingText: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.35)',
    fontWeight: '300',
  },
  codText: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.35)',
    fontWeight: '300',
  },

  // Checkout Wizard Button
  stepButton: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 20,
  },
  stepButtonText: {
    color: '#1A1A1A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // Step 4: Success confirmation screen
  successBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(224, 176, 52, 0.08)',
    borderWidth: 2,
    borderColor: '#80CBC4',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: '#1A1A1A',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 20,
  },
  receiptBox: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(0,150,136,0.10)',
    padding: 16,
    gap: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '300',
  },
  receiptValue: {
    fontSize: 12,
    color: '#80CBC4',
    fontWeight: '600',
  },
});
