import AddTransaction from '@/components/AddTransaction';
import Controls from '@/components/controls';
import EditTransaction from '@/components/EditTransaction';
import OverviewChart from '@/components/OverviewChart';
import { getSummaryData, getTransactions } from '@/db/db';
import { reload } from '@/lib/helpers';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Href, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, SectionList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SummaryItem { month: string; total_income: number; total_expenses: number }
const Summary = () => {
  const [summaryData, setSummaryData] = useState<SummaryItem[]>([]);
  const [transactionType, setTransactionType] = useState('')
  const [transactionToEdit, setTransactionToEdit] = useState(null)
  const bottomSheetRef = useRef<BottomSheet>(null)

  useFocusEffect(
    useCallback(() => {
      getSummarizedData()
    }, [])
  );

  const reset = () => {
    getSummarizedData()
  }
  
  const getSummarizedData = async () => {
    try {
      const data = await getSummaryData()
      setSummaryData(data)
    } catch (error) {
      Alert.alert('Error', (error as Error).message)
      console.log('Error', error)
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
          <TouchableOpacity onPress={() => router.push(`/monthtransactions?month=${item.month}` as Href<string | object>)}>
            <View className='flex-row bg-[#292929] border-b border-[#85d5ed] p-3 mb-2'>
              <View className='flex flex-1 justify-center items-start'>
                <Text className='text-sm text-white font-PoppinsMedium mb-1'>{formatMonth(item.month)}</Text>
                <OverviewChart income={item.total_income} expenses={item.total_expenses} radius={24} innerRadius={14} semiCirle={false} />
              </View>
              <View className='flex-1 justify-end'>
                <View className='flex-row justify-between items-center'>
                  <Text className='text-xs text-white font-PoppinsMedium'>Income: </Text>
                  <Text className='text-xs text-white font-PoppinsMedium'>{item.total_income}</Text>
                </View>
                <View className='text-xs flex-row justify-between items-center'>
                  <Text className='text-xs text-white font-PoppinsMedium'>Expenses: </Text>
                  <Text className='text-xs text-white font-PoppinsMedium'>{item.total_expenses}</Text>
                </View>
                <View className='text-xs flex-row justify-between items-center'>
                  <Text className='text-xs text-white font-PoppinsMedium'>Total: </Text>
                  <Text className={`${item.total_income > item.total_expenses ? 'text-red-500' : 'text-green-500'} text-xs font-PoppinsMedium`}>{item.total_income - item.total_expenses}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      <Controls
        onPress={(type: string) => {
          bottomSheetRef.current?.expand()
          setTransactionType(type)
        }}
      />
      <BottomSheet ref={bottomSheetRef} snapPoints={['70%', '85%']} index={-1} backgroundStyle={{ backgroundColor: '#6034de' }}>
        <BottomSheetScrollView style={{ flex: 1, padding: 10, backgroundColor: '#292929' }}>
          {transactionToEdit ?
            <EditTransaction close={(refresh) => { reload(refresh, bottomSheetRef, reset); setTransactionToEdit(null) }} transaction={transactionToEdit} />
            :
            <AddTransaction transactionType={transactionType} close={(refresh) => reload(refresh, bottomSheetRef, reset)} allowSMS={true} />
          }
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default Summary;
