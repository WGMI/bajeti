import { View, Text, TouchableOpacity, SectionList, Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { router } from 'expo-router'
import { getMessagesOfTheDay, parseSMS, reload } from '@/lib/helpers'
import { FontAwesome } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import AddTransaction from '@/components/AddTransaction'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Category, Details, Message, Transaction } from '@/lib/types'
import uuid from 'react-native-uuid';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { createTransaction, getCategoriesByName } from '@/db/db'

const Messages = () => {

  const [messageData, setMessageData] = useState([])
  const [transactionType, setTransactionType] = useState('')
  const [smsDetails, setSmsDetails] = useState<Details | null>(null)
  const [showEmptyMessage, setShowEmptyMessage] = useState(false)
  const [startDate, setStartDate] = useState(new Date())
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)

  const bottomSheetRef = useRef<BottomSheet>(null)

  /*useEffect(() => {
    checkForSenders()
    fetchFilteredMessages()
  }, [])*/

  useEffect(() => {
    checkForSenders()
    fetchFilteredMessages()
  }, [startDate])

  const checkForSenders = async () => {
    const storedSenders = await AsyncStorage.getItem('selectedSenders');
    if (!storedSenders) {
      Alert.alert('Error', 'No senders set. Go to settings to set the SMS senders you want to monitor for transactions');
    }
  }

  const reset = () => {
    saveSMS()
    fetchFilteredMessages()
  }

  const onStartDateChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    setShowStartDatePicker(false);
    setStartDate(selectedDate ?? new Date());
  };

  const saveSMS = async (details?: any) => {
    if (smsDetails == null && details == null) return
    const data = details || smsDetails
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
    console.log('Start date:',startDate.toISOString().split('T')[0])
    const messages = await getMessagesOfTheDay(startDate.toISOString().split('T')[0]);

    const addedTransactions = await AsyncStorage.getItem('addedTransactions');
    const addedMessages = addedTransactions ? JSON.parse(addedTransactions) : [];

    const discardedTransactions = await AsyncStorage.getItem('discardedMessages');
    const discardedMessages = discardedTransactions ? JSON.parse(discardedTransactions) : [];

    // Filter out both added and discarded messages
    const filteredMessages = messages
      .map((message: Message[]) => {
        const sender = (Object.keys(message)[0] as keyof Message);
        const filteredSenderMessages = (message as { [key: string]: any })[sender].filter(

          (msg: Message) => !addedMessages.includes(msg.message) && !discardedMessages.includes(msg.message)
        );
        return { [sender]: filteredSenderMessages };
      }).filter((msg: Message) => Object.values(msg)[0].length > 0); // Remove empty sections
    if (filteredMessages.length == 0) {
      setShowEmptyMessage(true)
    } else {
      setShowEmptyMessage(false)
    }
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
    if (messageData.length == 0) return;

    let income = 0;
    let expense = 0;

    // Step 1: Fetch categories and set income/expense values before moving forward
    try {
      const otherCategory: Category[] = (await getCategoriesByName('Other')) as Category[];

      otherCategory.forEach(el => {
        if (el.type == 'income') income = el.id as number;
        if (el.type == 'expense') expense = el.id as number;
      });
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
      console.log(e);
      return;  // Exit if an error occurs
    }

    // Step 2: Process the messages after income and expense are set
    const promises = messageData.map(async (message) => {
      const sender = Object.keys(message)[0];
      const messages: Message[] = message[sender];

      return Promise.all(
        messages.map(async (msg) => {
          const result = parseSMS({ message: msg.message, timestamp: msg.timestamp });

          // If the SMS type is 'neither', skip the message
          if (result.type == 'neither') {
            return;
          }

          // Define the category based on the result type
          const category_id = result.type === 'income' ? income : expense;

          const transaction: Transaction = {
            uuid: uuid.v4() as string,
            category_id: category_id, // Use income or expense category
            amount: result.amount,
            description: result.message,
            date: result.date,
            source_id: 0,
            created_at: new Date().toDateString(),
            updated_at: new Date().toDateString(),
          };

          try {
            await createTransaction(transaction);
            await saveSMS({
              message: result.message,
              type: result.type,
              amount: result.amount,
              date: result.date
            });
          } catch (e) {
            console.log(e);
            Alert.alert('Error', 'Something went wrong');
          }
        })
      );
    });

    // Step 3: Wait for all messages to be processed
    await Promise.all(promises);

    // Step 4: Fetch the filtered messages
    fetchFilteredMessages();
  };


  const discardAllSMS = async () => {
    try {
      // Fetch the current discarded messages from AsyncStorage
      const existingDiscards = await AsyncStorage.getItem('discardedMessages')
      const discardedMessages = existingDiscards ? JSON.parse(existingDiscards) : []

      // Loop through all message data and add each message to discardedMessages
      messageData.forEach(message => {
        const sender = Object.keys(message)[0];
        const messages: Message[] = message[sender];

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


  const discardSMS = async (item: Details) => {
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
      <View className='p-2'>
        <Text className='mt-10 w-full text-center text-white font-Poppins p-2'>Showing messages from {startDate.toDateString()} to now.</Text>
        <TouchableOpacity className='flex-row justify-center items-centermb-2 p-3 rounded-full border border-[#85d5ed]' onPress={() => setShowStartDatePicker(true)}>
          <FontAwesome name="calendar" size={24} color="#fff" />
          <Text className='ml-2 text-white text-center font-Poppins'>Select Date</Text>
        </TouchableOpacity>
      </View>
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          themeVariant='dark'
          maximumDate={new Date()}
          onChange={onStartDateChange}
        />
      )}
      {
        showEmptyMessage ?
          <Text className='mt-10 w-full text-center text-lg text-white font-PoppinsBold p-2'>All messages have been added or discarded. Widen your search to add more messages.</Text>
          :
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
      }
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