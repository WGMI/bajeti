import { getSummaryData, getTransactions } from '@/db/db';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, SectionList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SummaryItem { month: string; total_income: number; total_expenses: number }
const Summary = () => {
  const [summaryData, setSummaryData] = useState<SummaryItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      getSummarizedData()
    }, [])
  );

  const getSummarizedData  = async () => {
    try {
      const data = await getSummaryData()
      setSummaryData(data)
    } catch (error) {
      Alert.alert('Error',(error as Error).message)
      console.log('Error',error)
    }
  }

  function formatMonth(monthYear: string) {
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1); // JavaScript months are zero-indexed, so subtract 1
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };

    return new Intl.DateTimeFormat('en-US', options).format(date);
}

  return (
    <SafeAreaView className='flex flex-1 bg-[#292929]'>
      <View>
        <View className='flex-row justify-between items-center bg-[#6034de] p-3 mb-2'>
          <Text className='text-lg text-white font-PoppinsMedium'>Summary </Text>
        </View>
      </View>
      <FlatList
        data={summaryData}
        keyExtractor={(item: SummaryItem) => item.month}
        renderItem={({ item }) => (
          <View className='bg-[#6034de] p-3 mb-2'>
            <Text className='text-lg text-white font-PoppinsMedium'>{formatMonth(item.month)}</Text>
            <View className='flex-row justify-between items-center'>
              <Text className='text-white font-PoppinsMedium'>Total Income: </Text>
              <Text className='text-white font-PoppinsMedium'>{item.total_income}</Text>
            </View>
            <View className='flex-row justify-between items-center'>
              <Text className='text-white font-PoppinsMedium'>Total Expenses: </Text>
              <Text className='text-white font-PoppinsMedium'>{item.total_expenses}</Text>
            </View>
            <View className='flex-row justify-between items-center'>
              <Text className='text-white font-PoppinsMedium'>Total: </Text>
              <Text className='text-white font-PoppinsMedium'>{item.total_income - item.total_expenses}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Summary;
