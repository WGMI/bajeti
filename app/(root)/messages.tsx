import { View, Text, TouchableOpacity, SectionList, Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { router } from 'expo-router'
import { getMessagesOfTheDay, parseSMS, reload } from '@/lib/helpers'
import { FontAwesome } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import AddTransaction from '@/components/AddTransaction'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Transaction } from '@/lib/types'
import uuid from 'react-native-uuid';
import { createTransaction, getCategoriesByName } from '@/db/db'

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

  const saveSMS = async (details?: any) => {
    console.log('saveSMS')
    if (smsDetails == null && details == null) return
    const data = details || smsDetails
    console.log('SMSDetails:', smsDetails)
    console.log('Details:', details)
    try {
      const existingTransactions = await AsyncStorage.getItem('addedTransactions')
      const transactions = existingTransactions ? JSON.parse(existingTransactions) : []
      transactions.push(data.message)
      await AsyncStorage.setItem('addedTransactions', JSON.stringify(transactions))
      setSmsDetails(null)
    } catch (e) {
      console.error('Error saving transaction', e)
    }
  };

  const fetchFilteredMessages = async () => {
    const extra = [
      {
        message: "SHT0OLF29Y Confirmed. Ksh250.00 sent to FORTUNE SACCO C2B for account 66950 on 29/8/24 at 12:42 PM. New M-PESA balance is Ksh10,538.87. Transaction cost, Ksh0.00.",
        sender: "MPESA",
        timestamp: 1724924546036,
      },
      {
        message: "ESHT8OKN8VW Confirmed. Ksh500.00 sent to SAFARICOM DATA BUNDLES for account SAFARICOM DATA BUNDLES on 29/8/24 at 12:36 PM. New M-PESA balance is Ksh10,788.87. Transaction cost, Ksh0.00.",
        sender: "MPESA",
        timestamp: 1724924204197,
      },
      {
        message: "ESHS4M7WUK8 Confirmed.You have received Ksh969.00 from KCB 1 501901 on 28/8/24 at 7:08 PM. New M-PESA balance is Ksh11,288.87.",
        sender: "MPESA",
        timestamp: 1724861338035,
      },
      {
        message: "ESHS1LEBJO7 Confirmed. Ksh1,002.98 sent to M-PESA CARD for account ZOHO-WORKPLACE +6596866118 SG on 28/8/24 at 4:17 PM. New M-PESA balance is Ksh10,319.87. Transaction cost, Ksh0.00.",
        sender: "MPESA",
        timestamp: 1724851173901,
      },
    ];

    const messages = await getMessagesOfTheDay();
    
    // Combine filtered messages with extra messages
    const data = [...messages, ...extra.map(msg => ({ [msg.sender]: [msg] }))];
  
    const addedTransactions = await AsyncStorage.getItem('addedTransactions');
    const addedMessages = addedTransactions ? JSON.parse(addedTransactions) : [];
  
    const discardedTransactions = await AsyncStorage.getItem('discardedMessages');
    const discardedMessages = discardedTransactions ? JSON.parse(discardedTransactions) : [];
  
    // Filter out both added and discarded messages
    const filteredMessages = data
      .map((message) => {
        const sender = Object.keys(message)[0];
        const filteredSenderMessages = message[sender].filter(
          (msg) => !addedMessages.includes(msg.message) && !discardedMessages.includes(msg.message)
        );
        return { [sender]: filteredSenderMessages };
      })
      .filter((msg) => Object.values(msg)[0].length > 0); // Remove empty sections
  
    setMessageData(filteredMessages);
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

  const handleAllSMS = async () => {
    if (messageData.length == 0) return
  
    let other = 0
    try {
      const otherCategory = await getCategoriesByName('Other');
      other = otherCategory[0].id
    } catch (e) {
      Alert.alert('e', (e as Error).message)
      console.log(e)
    }
  
    const promises = messageData.map(async (message) => {
      const sender = Object.keys(message)[0]
      const messages: [] = message[sender]
      return Promise.all(messages.map(async (msg) => {
        const result = parseSMS({ message: msg.message, timestamp: msg.timestamp })
        if (result.type == 'neither') {
          return
        }
        console.log('Result is valid')
        const transaction: Transaction = {
          uuid: uuid.v4(),
          category_id: other,
          amount: result.amount,
          description: result.message,
          date: result.date,
          source_id: 0,
          created_at: new Date().toDateString(),
          updated_at: new Date().toDateString(),
        }
        console.log('T:\n', transaction)
        try {
          await createTransaction(transaction);
          console.log('save:', {
            message: result.message,
            type: result.type,
            amount: result.amount,
            date: result.date
          })
          await saveSMS({
            message: result.message,
            type: result.type,
            amount: result.amount,
            date: result.date
          })
        } catch (e) {
          console.log(e);
          Alert.alert('Error', 'Something went wrong');
        }
      }))
    })
  
    // Wait for all messages to be processed
    await Promise.all(promises)
  
    console.log('Done')
    fetchFilteredMessages()
  }
  
  const discardAllSMS = async () => {
    try {
      // Fetch the current discarded messages from AsyncStorage
      const existingDiscards = await AsyncStorage.getItem('discardedMessages')
      const discardedMessages = existingDiscards ? JSON.parse(existingDiscards) : []
  
      // Loop through all message data and add each message to discardedMessages
      messageData.forEach(message => {
        const sender = Object.keys(message)[0];
        const messages = message[sender];
  
        messages.forEach((msg) => {
          discardedMessages.push(msg.message); // Add each message to the discarded list
        });
      });
  
      // Save the updated discarded messages list back to AsyncStorage
      await AsyncStorage.setItem('discardedMessages', JSON.stringify(discardedMessages));
  
      // Fetch updated messages after discarding
      fetchFilteredMessages();
    } catch (e) {
      console.error('Error discarding all SMS:', e);
      Alert.alert('Error', 'Something went wrong while discarding all SMS');
    }
  };
  

  const discardSMS = async (item) => {
    console.log(item)
    try {
      const existingDiscards = await AsyncStorage.getItem('discardedMessages')
      const discardedMessages = existingDiscards ? JSON.parse(existingDiscards) : []

      // Add the current SMS's unique identifier (timestamp or message) to the list
      discardedMessages.push(item.message)

      // Save the updated list back to AsyncStorage
      await AsyncStorage.setItem('discardedMessages', JSON.stringify(discardedMessages))

      fetchFilteredMessages()
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
      <View className='flex-row justify-between items-center my-2'>
        <TouchableOpacity onPress={() => handleAllSMS()} className='flex flex-1 mx-2 justify-center items-center bg-[#009F00] p-2 rounded-full'>
          <View className='flex-row'>
            <FontAwesome name="plus" size={24} color="#fff" />
            <Text className='text-white font-Poppins ml-2'>Add All</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => discardAllSMS()} className='flex flex-1 mx-2 justify-center items-center bg-[#BD1f29] p-2 rounded-full'>
          <View className='flex-row'>
            <FontAwesome name="trash" size={24} color="#fff" />
            <Text className='text-white font-Poppins ml-2'>Discard All</Text>
          </View>
        </TouchableOpacity>
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