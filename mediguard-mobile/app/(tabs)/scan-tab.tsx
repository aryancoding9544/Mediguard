import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

export default function ScanTab() {
  const router = useRouter();
  useEffect(() => {
    router.push('/scan');
  }, []);
  return <View style={{ flex: 1, backgroundColor: '#F0F4F8' }} />;
}
