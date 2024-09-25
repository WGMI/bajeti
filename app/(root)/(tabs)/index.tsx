import { View, Text, FlatList, Alert, TouchableOpacity } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import OverviewChart from '@/components/OverviewChart'
import { fetchSenders, getMessagesOfTheDay, handleAction, reload } from '@/lib/helpers'
import TopCategories from '@/components/TopCategories'
import Controls from '@/components/controls';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import AddTransaction from '@/components/AddTransaction';
import { getDataByCategory, getSevenDaysTransactions, getTotalExpenses, getTotalIncome, Transaction } from '@/db/db';
import DetailsModal from '@/components/DetailsModal'
import EditTransaction from '@/components/EditTransaction'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import { SingleTransaction } from '@/components/SingleTransaction'
import { Href, router, useFocusEffect } from 'expo-router'
import SenderChips from '@/components/SenderChips'
import { FontAwesome } from '@expo/vector-icons'

const index = () => {

  const [transactionType, setTransactionType] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [income, setIncome] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [monthIncome, setMonthIncome] = useState(0)
  const [monthExpenses, setMonthExpenses] = useState(0)
  const [categoryData, setCategoryData] = useState([])
  const [detailData, setDetailData] = useState(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [transactionToEdit, setTransactionToEdit] = useState(null)
  const [messagesOfTheDay, setMessagesOfTheDay] = useState([])
  const [senders, setSenders] = useState([])
  const bottomSheetRef = useRef<BottomSheet>(null)

  useFocusEffect(
    useCallback(() => {
      reset();  // Call reset() to refresh the data when the screen is focused
    }, [])
  );

  const reset = async () => {
    fetchWeekTransactions()
    getUserMonthTotal()
    getCategoryData()
    getUserTotal()
    getSenders()
    const messages = await getMessagesOfTheDay()
    setMessagesOfTheDay(messages)
  }

  const getSenders = async () => {
    const senderList = await fetchSenders()
    setSenders(senderList)
  }

  const fetchWeekTransactions = async () => {
    try {
      const transactions = await getSevenDaysTransactions()
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setTransactions(transactions)
    }
    catch (e) {
      Alert.alert('Error fetching transactions', (e as Error).message)
      console.log(e)
    }
  }

  const getUserMonthTotal = async () => {
    try {
      const income = await getTotalIncome(true)
      const expenses = await getTotalExpenses(true)
      setMonthIncome(income)
      setMonthExpenses(expenses)
    }
    catch (e) {
      console.log(e)
      Alert.alert('Error', e as string)
    }
  }

  const getUserTotal = async () => {
    try {
      const income = await getTotalIncome(false)
      const expenses = await getTotalExpenses(false)
      setIncome(income)
      setExpenses(expenses)
    }
    catch (e) {
      console.log(e)
      Alert.alert('Error', e as string)
    }
  }

  const getCategoryData = async () => {
    try {
      const categoryData = await getDataByCategory()
      setCategoryData(categoryData as any)
    }
    catch (e) {
      console.log(e)
      Alert.alert('Error', e as string)
    }
  }

  const viewMessagesOfTheDay = () => {
    router.push(`/messages` as Href<string>)
  }

  return (
    <SafeAreaView className='flex flex-1 bg-[#292929] p-3'>
      <View className='flex flex-row justify-between items-center rounded-lg my-5'>
        <View className='flex flex-col'>
          <Text className='text-white text-lg font-Poppins'>{new Date().toLocaleString('default', { month: 'long' })}</Text>
          <View className='flex-row'>
            <MoneyDisplay amount={monthIncome - monthExpenses} textSize={'text-4xl'} />
          </View>
        </View>
        <View>
          <TouchableOpacity onPress={() => router.push('/summary')}>
            <OverviewChart income={monthIncome} expenses={monthExpenses} />
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex-row justify-between items-center mb-5">
        <Text className="flex-1 mr-1 bg-[#009F00] text-white text-center font-PoppinsBold rounded-lg p-2">
          Income: {monthIncome}
        </Text>
        <Text className="flex-1 ml-1 bg-[#BD1f29] text-white text-center font-PoppinsBold rounded-lg p-2">
          Expenses: {monthExpenses}
        </Text>
      </View>
      <View className="flex-row justify-between items-center mb-5">
        <Text className="flex-1 mr-1 border border-[#85d5ed]  text-white text-center font-PoppinsBold rounded-lg p-2">
          Wallet: {income - expenses}
        </Text>
      </View>

      <FlatList
        data={transactions}
        ListHeaderComponent={() => (
          <View>
            <TopCategories categoryData={categoryData} />
            <View className='flex-row'>{
              messagesOfTheDay.some(obj => {
                const value: any = Object.values(obj)[0]; // Get the list (value) from the object
                return value.length > 0; // Check if the list has elements
              }) ?
                <TouchableOpacity onPress={viewMessagesOfTheDay}>
                  <View className={`border border-[#85d5ed] flex-row items-center rounded-full px-3 py-1 mr-2 mb-2`}>
                    <FontAwesome name='envelope' size={18} color='#fff' /><Text className='text-white ml-2 font-Poppins'>Add From SMS Messages</Text>
                  </View>
                </TouchableOpacity>
                :
                <></>
            }
            </View>
            <View className='flex-row'>
              <Text className='text-lg text-white font-PoppinsMedium'>Transactions </Text>
              <Text className='text-lg text-white font-PoppinsLight'>Last 7 days</Text>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.uuid}
        renderItem={({ item }) => (
          <SingleTransaction item={item} onPress={() => { setDetailData(item); setDetailVisible(true); }} />
        )}
      />
      <DetailsModal transaction={detailData} visible={detailVisible} onClose={() => { setDetailData(null); setDetailVisible(false); }} action={(transaction, action) => handleAction(transaction, action, bottomSheetRef, setTransactionToEdit, reset)} />
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
  )
}

export default index