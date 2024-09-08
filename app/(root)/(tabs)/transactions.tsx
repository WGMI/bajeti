import { View, Text, TouchableOpacity, Image, Alert, SectionList } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { getTransactions } from '@/db/db'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlatList } from 'react-native-gesture-handler'
import { imageMap } from '@/lib/images'
import { formatDate, handleAction, reload } from '@/lib/helpers'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import DetailsModal from '@/components/DetailsModal'
import Controls from '@/components/controls'
import EditTransaction from '@/components/EditTransaction'
import AddTransaction from '@/components/AddTransaction'
import { FontAwesome } from '@expo/vector-icons'
import { SingleTransaction } from '@/components/SingleTransaction'
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types'

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [transactionType, setTransactionType] = useState('')
  const [detailData, setDetailData] = useState(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [transactionToEdit, setTransactionToEdit] = useState(null)
  const bottomSheetRef = useRef<BottomSheet>(null)

  useEffect(() => {
    getTransactionData()
  }, [])

  const getTransactionData = async () => {
    try {
      const transactions = await getTransactions()
      setTransactions(groupTransactionsByMonth(transactions))
    } catch (error) {
      console.log(error)
    }
  }

  const groupTransactionsByMonth = (transactions) => {
    // Helper function to format date as "Month YYYY"
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'long' };
      return date.toLocaleDateString('en-US', options);
    };

    // Grouping transactions by formatted month-year
    const groupedTransactions = transactions.reduce((acc, transaction) => {
      const dateKey = formatDate(transaction.date || transaction.created_at);

      // If the group for the current month-year doesn't exist, create it
      if (!acc[dateKey]) acc[dateKey] = [];

      // Push the current transaction to the relevant group
      acc[dateKey].push(transaction);

      return acc;
    }, {});

    // Convert the grouped transactions into the desired format
    return Object.entries(groupedTransactions).map(([title, data]) => ({
      title,
      data
    }));
  };

  return (
    <SafeAreaView className='flex flex-1 bg-[#292929]'>
      <View>
        <View className='flex-row justify-between items-center bg-[#6034de] p-3 mb-2'>
          <Text className='text-lg text-white font-PoppinsMedium'>Transactions </Text>
          <TouchableOpacity>
            <FontAwesome name='search' color={'white'} size={24} />
          </TouchableOpacity>
        </View>
        <SectionList
          sections={transactions}
          keyExtractor={(item) => item.uuid}
          renderItem={({ item }) => (
            <View className='mx-2'>
              <SingleTransaction item={item} onPress={() => { setDetailData(item); setDetailVisible(true); }} />
            </View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View className='flex items-center justify-center bg-[#575757] p-3'>
              <Text className='text-white font-PoppinsBold'>{title}</Text>
            </View>
          )}
        />
      </View>
      <DetailsModal transaction={detailData} visible={detailVisible} onClose={() => { setDetailData(null); setDetailVisible(false); }} action={(transaction, action) => handleAction(transaction, action, bottomSheetRef, setTransactionToEdit, getTransactionData)} />
      <Controls
        onPress={(type: string) => {
          bottomSheetRef.current?.expand()
          setTransactionType(type)
        }}
      />
      <BottomSheet ref={bottomSheetRef} snapPoints={['70%', '85%']} index={-1} backgroundStyle={{ backgroundColor: '#6034de' }}>
        <BottomSheetScrollView style={{ flex: 1, padding: 10, backgroundColor: '#292929' }}>
          {transactionToEdit ?
            <EditTransaction close={(refresh) => { reload(refresh,bottomSheetRef,getTransactionData); setTransactionToEdit(null) }} transaction={transactionToEdit} />
            :
            <AddTransaction transactionType={transactionType} close={(refresh) => reload(refresh,bottomSheetRef,getTransactionData)} />
          }
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  )
}

export default Transactions