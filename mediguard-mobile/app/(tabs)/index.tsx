import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { HeaderProfile } from '../../components/dashboard/HeaderProfile';
import { HeroSearch } from '../../components/dashboard/HeroSearch';
import { QuickActionGrid } from '../../components/dashboard/QuickActionGrid';
import { MedicineCarousel } from '../../components/dashboard/MedicineCarousel';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeaderProfile />
        <HeroSearch />
        <QuickActionGrid />
        <MedicineCarousel />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
});
