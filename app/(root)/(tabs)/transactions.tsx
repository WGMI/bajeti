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
import { deleteTransaction, getCategories, getDataByCategory, getExpenditureByCategory, getTotalExpenses, getTotalIncome, getTransactions } from '@/db/db';
import { imageMap } from '@/lib/images';
import DetailsModal from '@/components/DetailsModal'
import EditTransaction from '@/components/EditTransaction'

const MoneyDisplay = ({ amount, type }: { amount: number, type: string }) => {
  const [large, small] = formatMoney(amount)

  return (
    <View className='flex-row items-end'>
      <Text className='text-xl text-white font-Poppins'>{large}</Text>
      {
        (small !== '00') ?
          <Text className='text-sm text-white font-Poppins'>.{small}</Text>
          :
          <></>
      }
      <View className={`ml-1 w-1 h-full ${type! == 'income' ? 'bg-[#009F00]' : 'bg-[#BD1f29]'}`} />
    </View>
  )
}

const Transactions = () => {

  const [transactionType, setTransactionType] = useState('')
  const [transactions, setTransactions] = useState([])
  const [income, setIncome] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [categoryData, setCategoryData] = useState([])
  const [detailData, setDetailData] = useState(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [transactionToEdit, setTransactionToEdit] = useState(null)
  const bottomSheetRef = useRef<BottomSheet>(null)

  useEffect(() => {
    reset()
  }, [])

  const reset = () => {
    fetchTransactions()
    getUserTotal()
    getCategoryData()
  }

  const fetchTransactions = async () => {
    await getTransactions().then((res) => {console.log(res);setTransactions(res)}).catch((e) => {
      Alert.alert('Error fetching transactions', e)
      console.log(e)
    })
  }

  const getUserTotal = async () => {
    try {
      const income = await getTotalIncome()
      const expenses = await getTotalExpenses()
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
            <Text className='text-white text-lg font-Poppins'>August</Text>
            <View className='flex-row'>
              <Text className='text-white text-4xl font-PoppinsMedium'>{income - expenses}</Text><Text className='text-white text-lg font-Poppins'>.00</Text>
            </View>
          </View>
          <View>
            <OverviewChart income={income} expenses={expenses} />
          </View>
        </View>
        <View className="flex-row justify-between items-center mb-5">
          <Text className="flex-1 mr-1 bg-[#009F00] text-white text-center font-PoppinsBold rounded-lg p-2">
            Income: {income}
          </Text>
          <Text className="flex-1 ml-1 bg-[#BD1f29] text-white text-center font-PoppinsBold rounded-lg p-2">
            Expenses: {expenses}
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
              <EditTransaction close={(refresh) => reload(refresh)} transaction={transactionToEdit} />
              :
              <AddTransaction transactionType={transactionType} close={(refresh) => reload(refresh)} transactionToEdit={transactionToEdit} />
            }
          </BottomSheetScrollView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

export default Transactions