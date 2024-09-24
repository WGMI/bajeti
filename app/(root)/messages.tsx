import { View, Text, TouchableOpacity, SectionList, Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { router } from 'expo-router'
import { getMessagesOfTheDay, parseSMS, reload } from '@/lib/helpers'
import { FontAwesome } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import AddTransaction from '@/components/AddTransaction'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Messages = () => {

  const [messageData, setMessageData] = useState([])
  const [transactionType, setTransactionType] = useState('')
  const [smsDetails, setSmsDetails] = useState<{
    message: string,
    type: string,
    amount: number,
    date: string
  } | null>(null)

  const bottomSheetRef = useRef<BottomSheet>(null)

  useEffect(() => {
    fetchFilteredMessages()
  }, [])

  const reset = () => {
    saveSMS()
    fetchFilteredMessages()
  }

  const saveSMS = async () => {
    console.log('SMS:', smsDetails)
    if (smsDetails == null) return
    try {
      const existingTransactions = await AsyncStorage.getItem('addedTransactions')
      const transactions = existingTransactions ? JSON.parse(existingTransactions) : []
      transactions.push(smsDetails.message)
      await AsyncStorage.setItem('addedTransactions', JSON.stringify(transactions))
    } catch (e) {
      console.error('Error saving transaction', e)
    }
  };

  const fetchFilteredMessages = async () => {
    const messages = await getMessagesOfTheDay()

    const addedTransactions = await AsyncStorage.getItem('addedTransactions')
    console.log(addedTransactions)
    const addedMessages = addedTransactions ? JSON.parse(addedTransactions) : []

    const discardedTransactions = await AsyncStorage.getItem('discardedMessages')
    const discardedMessages = discardedTransactions ? JSON.parse(discardedTransactions) : []

    // Filter out both added and discarded messages
    const filteredMessages = messages.map((message) => {
      const sender = Object.keys(message)[0]
      console.log(sender)
      const filteredSenderMessages = message[sender].filter(
        (msg) => !addedMessages.includes(msg.message) && !discardedMessages.includes(msg.message)
      )
      return { [sender]: filteredSenderMessages }
    }).filter((msg) => Object.values(msg)[0].length > 0) // Remove empty sections

    setMessageData(filteredMessages)
  };

  const handleSMS = (sms: any) => {
    const result = parseSMS(sms)
    if (result.type == 'neither') {
      Alert.alert('Error', 'Failed to parse SMS message')
      return
    }
    setSmsDetails(result)
    bottomSheetRef.current?.expand()
    setTransactionType(result.type)
  }

  const discardSMS = async (item) => {
    try {
      const existingDiscards = await AsyncStorage.getItem('discardedMessages')
      const discardedMessages = existingDiscards ? JSON.parse(existingDiscards) : []

      // Add the current SMS's unique identifier (timestamp or message) to the list
      discardedMessages.push(item.message)

      // Save the updated list back to AsyncStorage
      await AsyncStorage.setItem('discardedMessages', JSON.stringify(discardedMessages))

      console.log('SMS discarded successfully!')
      fetchFilteredMessages()
      reset()
    } catch (e) {
      console.error('Error discarding SMS:', e)
    }
  }

  const sectionData = messageData.map(message => {
    const sender = Object.keys(message)[0];
    const messages = message[sender]

    return {
      title: sender,
      data: messages
    };
  });

  return (
    <SafeAreaView className='flex flex-1 bg-[#292929]'>
      <View>
        <View className='flex-row justify-between items-center bg-[#6034de] p-3'>
          <View className='flex flex-row justify-center items-center'>
            <TouchableOpacity onPress={() => router.back()} className='mr-2'>
              <View className='w-10 h-10 rounded-full bg-white items-center justify-center'>
                <FontAwesome name='angle-left' color={'#6034de'} size={24} className='p-1' />
              </View>
            </TouchableOpacity>
            <Text className='text-lg text-white font-PoppinsMedium'>Messages</Text>
          </View>
        </View>
      </View>
      <SectionList
        sections={sectionData}
        keyExtractor={(item, index) => item.message + index}
        renderItem={({ item }) => (
          <View className='p-2 border-b border-[#85d5ed]'>
            <Text className='text-white font-PoppinsBold'>{new Date(item.timestamp).toLocaleString()}</Text>
            <Text className='text-white font-Poppins'>{item.message}</Text>
            <View className='flex-row justify-between items-center my-2'>
              <TouchableOpacity onPress={() => handleSMS({ message: item.message, timestamp: item.timestamp })} className='flex flex-1 mx-2 justify-center items-center bg-[#009F00] p-2 rounded-full'>
                <View className='flex-row'>
                  <FontAwesome name="plus" size={24} color="#fff" />
                  <Text className='text-white font-Poppins ml-2'>Add Transaction</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => discardSMS(item)} className='flex flex-1 mx-2 justify-center items-center bg-[#BD1f29] p-2 rounded-full'>
                <View className='flex-row'>
                  <FontAwesome name="trash" size={24} color="#fff" />
                  <Text className='text-white font-Poppins ml-2'>Discard</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View className='flex items-center justify-center bg-[#575757] p-3'>
            <Text className='text-white font-PoppinsBold'>{title}</Text>
          </View>
        )}
      />
      <BottomSheet ref={bottomSheetRef} snapPoints={['70%', '85%']} index={-1} backgroundStyle={{ backgroundColor: '#6034de' }}>
        <BottomSheetScrollView style={{ flex: 1, padding: 10, backgroundColor: '#292929' }}>
          <AddTransaction details={smsDetails} transactionType={transactionType} close={(refresh) => reload(refresh, bottomSheetRef, reset)} allowSMS={false} />
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  )
}

export default Messages