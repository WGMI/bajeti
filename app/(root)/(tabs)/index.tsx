import { View, Text, FlatList, Image, Alert, TouchableOpacity } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import OverviewChart from '@/components/OverviewChart'
import { formatDate, formatMoney } from '@/lib/helpers'
import TopCategories from '@/components/TopCategories'
import Controls from '@/components/controls';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet'
import AddTransaction from '@/components/AddTransaction';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { deleteTransaction, getCategories, getDataByCategory, getExpenditureByCategory, getSevenDaysTransactions, getTotalExpenses, getTotalIncome, getTransactions } from '@/db/db';
import { imageMap } from '@/lib/images';
import DetailsModal from '@/components/DetailsModal'
import EditTransaction from '@/components/EditTransaction'

const MoneyDisplay = ({ amount, type, textSize }: { amount: number, type?: string, textSize?: string }) => {
  const [large, small] = formatMoney(amount)
  return (
    <View className={`flex-row ${textSize ? '' : 'items-end'}`}>
      <Text className={`${textSize ? textSize : 'text-lg'} text-white font-Poppins`}>{large}</Text>
      {
        (small !== '00') ?
          <Text className={`${textSize ? 'text-lg' : 'text-sm'} text-white font-Poppins`}>.{small}</Text>
          :
          <></>
      }
      {type ? <View className={`ml-1 w-1 h-full ${type! == 'income' ? 'bg-[#009F00]' : 'bg-[#BD1f29]'}`} /> : <></>}
    </View>
  )
}

const index = () => {

  const [transactionType, setTransactionType] = useState('')
  const [transactions, setTransactions] = useState([])
  const [income, setIncome] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [monthIncome, setMonthIncome] = useState(0)
  const [monthExpenses, setMonthExpenses] = useState(0)
  const [categoryData, setCategoryData] = useState([])
  const [detailData, setDetailData] = useState(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [transactionToEdit, setTransactionToEdit] = useState(null)
  const bottomSheetRef = useRef<BottomSheet>(null)

  useEffect(() => {
    fetchTransactions()
    reset()
  }, [])

  const reset = () => {
    fetchWeekTransactions()
    getUserMonthTotal()
    getCategoryData()
    getUserTotal()
  }

  const fetchWeekTransactions = async () => {
    await getSevenDaysTransactions().then((res) => setTransactions(res)).catch((e) => {
      Alert.alert('Error fetching transactions', e)
      console.log(e)
    })
  }

  const fetchTransactions = async () => {
    await getTransactions().then((res) => console.log(res)).catch((e) => {
      Alert.alert('Error fetching transactions', e)
      console.log(e)
    })
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

  const reload = (refresh: boolean) => {
    bottomSheetRef.current?.close()
    if (refresh) reset()
  }

  const handleAction = async (uuid: string, action: string) => {
    switch (action) {
      case 'edit':
        bottomSheetRef.current?.expand()
        const transaction = transactions.find(item => (item.uuid == uuid))
        setTransactionToEdit(transaction as any)
        break;
      case 'duplicate':
        //Later
        break;
      case 'delete':
        try {
          deleteTransaction(uuid)
          reset()
        }
        catch (e) {
          Alert.alert('Error', e as string)
        }
        break;

      default:
        break;
    }
  }

  return (
    <GestureHandlerRootView>
      <SafeAreaView className='flex flex-1 bg-[#292929] p-3'>
        <View className='flex flex-row justify-between items-center rounded-lg my-5'>
          <View className='flex flex-col'>
            <Text className='text-white text-lg font-Poppins'>{new Date().toLocaleString('default', { month: 'long' })}</Text>
            <View className='flex-row'>
              <MoneyDisplay amount={monthIncome - monthExpenses} textSize={'text-4xl'} />
            </View>
          </View>
          <View>
            <OverviewChart income={monthIncome} expenses={monthExpenses} />
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
              <View className='flex-row'>
                <Text className='text-lg text-white font-PoppinsMedium'>Transactions </Text>
                <Text className='text-lg text-white font-PoppinsLight'>Last 7 days</Text>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.uuid}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => { setDetailData(item); setDetailVisible(true); }}>
              <View key={item.uuid} className='flex-row justify-between items-center my-1'>
                <View className='flex-row justify-between items-center'>
                  <Image source={imageMap[item.image]} className='w-10 h-10 rounded-full object-cover' />
                  <View className='flex-col ml-2'>
                    <Text className='text-white text-[16px] font-Poppins'>{item.name}</Text>
                    <Text className='text-white text-[12px] font-Poppins'>{formatDate(item.date)}</Text>
                  </View>
                </View>
                <View className='flex-row justify-between items-center'>
                  <View className='flex-col ml-2'>
                    <MoneyDisplay amount={item.amount} type={item.type} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
        <DetailsModal transaction={detailData} visible={detailVisible} onClose={() => { setDetailData(null); setDetailVisible(false); }} action={(uuid, action) => handleAction(uuid, action)} />
        <Controls
          onPress={(type: string) => {
            bottomSheetRef.current?.expand()
            setTransactionType(type)
          }}
        />
        <BottomSheet ref={bottomSheetRef} snapPoints={['70%', '85%']} index={-1} backgroundStyle={{ backgroundColor: '#6034de' }}>
          <BottomSheetScrollView style={{ flex: 1, padding: 10, backgroundColor: '#292929' }}>
            {transactionToEdit ?
              <EditTransaction close={(refresh) =>{ reload(refresh); setTransactionToEdit(null)}} transaction={transactionToEdit} />
              :
              <AddTransaction transactionType={transactionType} close={(refresh) => reload(refresh)} transactionToEdit={transactionToEdit} />
            }
          </BottomSheetScrollView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

export default index