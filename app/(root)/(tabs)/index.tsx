import { View, Text, FlatList, Image } from 'react-native'
import React, { useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context'
import OverviewChart from '@/components/OverviewChart'
import { formatDate, formatMoney } from '@/lib/helpers'
import TopCategories from '@/components/TopCategories'
import Controls from '@/components/controls';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import AddTransaction from '@/components/AddTransaction';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const transactions = [
  {
    "id": 1,
    "category_id": 3,
    "amount": 50.75,
    "description": "Grocery shopping",
    "source_id": 1,
    "created_at": "2024-08-01T09:30:00",
    "updated_at": "2024-08-01T09:30:00"
  },
  {
    "id": 2,
    "category_id": 1,
    "amount": 120.00,
    "description": "Monthly subscription",
    "source_id": 2,
    "created_at": "2024-08-02T10:00:00",
    "updated_at": "2024-08-02T10:00:00"
  },
  {
    "id": 3,
    "category_id": 4,
    "amount": 25.00,
    "description": "Fuel",
    "source_id": 3,
    "created_at": "2024-08-03T11:15:00",
    "updated_at": "2024-08-03T11:15:00"
  },
  {
    "id": 4,
    "category_id": 2,
    "amount": 75.50,
    "description": "Dining out",
    "source_id": 4,
    "created_at": "2024-08-04T19:45:00",
    "updated_at": "2024-08-04T19:45:00"
  },
  {
    "id": 5,
    "category_id": 5,
    "amount": 150.00,
    "description": "Online shopping",
    "source_id": 5,
    "created_at": "2024-08-05T13:30:00",
    "updated_at": "2024-08-05T13:30:00"
  },
  {
    "id": 6,
    "category_id": 3,
    "amount": 60.25,
    "description": "Grocery shopping",
    "source_id": 1,
    "created_at": "2024-08-06T08:00:00",
    "updated_at": "2024-08-06T08:00:00"
  },
  {
    "id": 7,
    "category_id": 6,
    "amount": 30.00,
    "description": "Gym membership",
    "source_id": 2,
    "created_at": "2024-08-07T07:00:00",
    "updated_at": "2024-08-07T07:00:00"
  },
  {
    "id": 8,
    "category_id": 7,
    "amount": 200.00,
    "description": "Car maintenance",
    "source_id": 3,
    "created_at": "2024-08-08T14:20:00",
    "updated_at": "2024-08-08T14:20:00"
  },
  {
    "id": 9,
    "category_id": 8,
    "amount": 95.00,
    "description": "Medical expenses",
    "source_id": 4,
    "created_at": "2024-08-09T16:40:00",
    "updated_at": "2024-08-09T16:40:00"
  },
  {
    "id": 10,
    "category_id": 9,
    "amount": 45.15,
    "description": "Gift purchase",
    "source_id": 5,
    "created_at": "2024-08-10T18:10:00",
    "updated_at": "2024-08-10T18:10:00"
  }
]

const categories = [
  {
    "id": 1,
    "name": "Rent",
    "type": "expense",
    "created_at": "2024-08-01T09:00:00",
    "updated_at": "2024-08-01T09:00:00"
  },
  {
    "id": 2,
    "name": "Dining",
    "type": "expense",
    "created_at": "2024-08-01T09:05:00",
    "updated_at": "2024-08-01T09:05:00"
  },
  {
    "id": 3,
    "name": "Groceries",
    "type": "expense",
    "created_at": "2024-08-01T09:10:00",
    "updated_at": "2024-08-01T09:10:00"
  },
  {
    "id": 4,
    "name": "Transportation",
    "type": "expense",
    "created_at": "2024-08-01T09:15:00",
    "updated_at": "2024-08-01T09:15:00"
  },
  {
    "id": 5,
    "name": "Shopping",
    "type": "expense",
    "created_at": "2024-08-01T09:20:00",
    "updated_at": "2024-08-01T09:20:00"
  },
  {
    "id": 6,
    "name": "Fitness",
    "type": "expense",
    "created_at": "2024-08-01T09:25:00",
    "updated_at": "2024-08-01T09:25:00"
  },
  {
    "id": 7,
    "name": "Car Maintenance",
    "type": "expense",
    "created_at": "2024-08-01T09:30:00",
    "updated_at": "2024-08-01T09:30:00"
  },
  {
    "id": 8,
    "name": "Healthcare",
    "type": "expense",
    "created_at": "2024-08-01T09:35:00",
    "updated_at": "2024-08-01T09:35:00"
  },
  {
    "id": 9,
    "name": "Gifts",
    "type": "expense",
    "created_at": "2024-08-01T09:40:00",
    "updated_at": "2024-08-01T09:40:00"
  },
  {
    "id": 10,
    "name": "Salary",
    "type": "income",
    "created_at": "2024-08-01T09:45:00",
    "updated_at": "2024-08-01T09:45:00"
  },
  {
    "id": 11,
    "name": "Freelance",
    "type": "income",
    "created_at": "2024-08-01T09:50:00",
    "updated_at": "2024-08-01T09:50:00"
  },
  {
    "id": 12,
    "name": "Investments",
    "type": "income",
    "created_at": "2024-08-01T09:55:00",
    "updated_at": "2024-08-01T09:55:00"
  }
]

const MoneyDisplay = ({ amount }: { amount: number }) => {
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
    </View>
  )
}

const sampleImages = [
  require('@/assets/images/cup.jpg'),
  require('@/assets/images/case.jpg'),
  require('@/assets/images/plate.jpg'),
  require('@/assets/images/house.jpg')
]

const index = () => {

  const [transactionType, setTransactionType] = useState('')
  const bottomSheetRef = useRef<BottomSheet>(null)

  return (
    <GestureHandlerRootView>
      <SafeAreaView className='flex flex-1 bg-[#292929] p-3'>
        <View className='flex flex-row justify-between items-center rounded-lg my-5'>
          <View className='flex flex-col'>
            <Text className='text-white text-lg font-Poppins'>August</Text>
            <View className='flex-row'>
              <Text className='text-white text-4xl font-PoppinsMedium'>15000</Text><Text className='text-white text-lg font-Poppins'>.00</Text>
            </View>
          </View>
          <View>
            <OverviewChart />
          </View>
        </View>
        <View className="flex-row justify-between items-center mb-5">
          <Text className="flex-1 mr-1 bg-[#009F00] text-white text-center font-PoppinsBold rounded-lg p-2">
            Income: 50000
          </Text>
          <Text className="flex-1 ml-1 bg-[#BD1f29] text-white text-center font-PoppinsBold rounded-lg p-2">
            Expenses: 35000
          </Text>
        </View>

        <FlatList
          data={transactions}
          ListHeaderComponent={() => (
            <View>
              <TopCategories />
              <View className='flex-row'>
                <Text className='text-lg text-white font-PoppinsMedium'>Transactions </Text>
                <Text className='text-lg text-white font-PoppinsLight'>Last 7 days</Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <View className='flex-row justify-between items-center my-1'>
              <View className='flex-row justify-between items-center'>
                <Image source={(sampleImages[Math.floor(Math.random() * 4)])} className='w-10 h-10 rounded-full object-cover' />
                <View className='flex-col ml-2'>
                  <Text className='text-white text-[16px] font-Poppins'>{categories[item.category_id].name}</Text>
                  <Text className='text-white text-[12px] font-Poppins'>{formatDate(item.created_at)}</Text>
                </View>
              </View>
              <View className='flex-row justify-between items-center'>
                <View className='flex-col ml-2'>
                  <Text className='text-white text-2xl font-Poppins'> <MoneyDisplay amount={item.amount} /></Text>
                </View>
              </View>
            </View>
          )}
        />
        <Controls
          onPress={(type:string) => {
            bottomSheetRef.current?.expand()
            setTransactionType(type)
          }}
        />
        <BottomSheet ref={bottomSheetRef} snapPoints={['55%', '80%']} index={-1} backgroundStyle={{ backgroundColor: '#6034de' }}>
          <BottomSheetView style={{ flex: 1, padding: 10, backgroundColor: '#292929'}}>
            <AddTransaction transactionType={transactionType} close={() => bottomSheetRef.current?.close()} />
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

export default index