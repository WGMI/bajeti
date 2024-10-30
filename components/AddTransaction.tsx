import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import CategoryModal from './CategoryModal';
import { imageMap } from '@/lib/images';
import { createTransaction, Transaction } from '@/db/db';
import DateTimePicker from '@react-native-community/datetimepicker';
import uuid from 'react-native-uuid';
import { parseSMS } from '@/lib/helpers';

const AddTransaction = ({ details, close, transactionType, allowSMS }: { details?:any, close: (refresh: boolean) => void, transactionType: string, allowSMS: boolean }) => {
  const initialState = {
    amount: 0,
    amountValidation: true,
    notes: '',
    source: '',
    modalVisible: false,
    date: new Date(),
    show: false,
    selectedCategory: {
      image: 'default.jpg',
      name: 'Category',
      default: true,
    },
    categoryValidation: true,
    showSMSInput: false,
    sms: ''
  };

  // Initialize state variables using useState
  const [typeOfTransaction, setTypeOfTransaction] = useState(transactionType);
  const [amount, setAmount] = useState(initialState.amount);
  const [amountValidation, setAmountValidation] = useState(initialState.amountValidation);
  const [notes, setNotes] = useState(initialState.notes);
  const [source, setSource] = useState(initialState.source);
  const [modalVisible, setModalVisible] = useState(initialState.modalVisible);
  const [date, setDate] = useState(initialState.date);
  const [show, setShow] = useState(initialState.show);
  const [selectedCategory, setSelectedCategory] = useState<any>(initialState.selectedCategory);
  const [categoryValidation, setCategoryValidation] = useState(initialState.categoryValidation);
  const [showSMSInput, setShowSMSInput] = useState(initialState.showSMSInput)
  const [sms, setSms] = useState(initialState.sms)

  useEffect(() => {
    setTypeOfTransaction(transactionType)
  }, [transactionType])

  useEffect(() => {
    if(details){
      setAmount(details.amount.toString())
      setDate(new Date(details.date))
      setNotes(details.message)
    }
  },[details])

  // Define resetState function
  const resetState = () => {
    setAmount(initialState.amount);
    setAmountValidation(initialState.amountValidation);
    setNotes(initialState.notes);
    setSource(initialState.source);
    setModalVisible(initialState.modalVisible);
    setDate(initialState.date);
    setShow(initialState.show);
    setSelectedCategory(initialState.selectedCategory);
    setCategoryValidation(initialState.categoryValidation);
    setShowSMSInput(initialState.showSMSInput)
    setSms(initialState.sms)
  };

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    let currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const showDatepicker = () => {
    setShow(true);
  };

  const handleAddTransaction = async () => {
    if (!amount || !selectedCategory.id ||amount == 0) {
      setAmountValidation(amount > 0);
      setCategoryValidation(selectedCategory.id);
      return;
    }

    const transaction: Transaction = {
      uuid: uuid.v4().toString(),
      category_id: selectedCategory.id,
      amount: amount,
      description: notes,
      date: date.toISOString().split('T')[0],
      source_id: 0,
      created_at: new Date().toDateString(),
      updated_at: new Date().toDateString(),
    }

    try {
      await createTransaction(transaction);
      resetState();
      close(true);
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const closeAndReset = () => {
    resetState()
    close(false)
  }

  const handleSMS = (data:any) => {
    const result = parseSMS(data)
    if (result.amount !== 0) {
      setAmount(result.amount);
    }
  
    if (result.date) {
      setDate(new Date(result.date));  // Ensure date is valid before updating state
    }
  
    if (result.type) {
      setTypeOfTransaction(result.type);
    }
    setNotes(result.message)
  }

  return (
    <View className='bg-[#333] flex-1 p-4'>
      <View className='flex-row justify-between items-start my-5'>
        <Text className='text-white text-xl font-PoppinsBold mb-4 capitalize'>Add {typeOfTransaction}</Text>
        <TouchableOpacity onPress={closeAndReset} className='w-8 h-8 rounded-full bg-red-500 justify-center items-center'>
          <FontAwesome name='close' size={24} color='#fff' />
        </TouchableOpacity>
      </View>

      {allowSMS ?
      <TouchableOpacity onPress={() => setShowSMSInput(!showSMSInput)} className='flex-row justify-center items-center w-fit my-3 border border-blue-500 rounded-md p-2'>
        <FontAwesome name={showSMSInput ? 'close' : 'envelope'} size={18} color='#fff' /><Text className='mx-3 w-fit text-white font-Poppins'>{showSMSInput ? 'Close' : 'Paste SMS message'}</Text>
      </TouchableOpacity>
      :
      <></>
      }
      {showSMSInput ?
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View className={`flex-row items-center border ${typeOfTransaction === 'income' ? 'border-green-500' : 'border-red-500'} rounded-md p-2 mb-4`}>
            <TextInput
              className={`flex-1 text-white font-Poppins`}
              value={sms}
              multiline={true}
              numberOfLines={4}
              placeholder='(Enter SMS message)'
              placeholderTextColor={'white'}
              onChangeText={setSms}
            />
          </View>
          <View className='flex-row mb-4'>
            {/* Income Option */}
            <TouchableOpacity
              onPress={() => setTypeOfTransaction('income')}
              className='flex-row items-center mr-4'
            >
              <View
                className={`h-5 w-5 rounded-full border-2 ${typeOfTransaction === 'income' ? 'bg-white' : 'border-white'}`}
              />
              <Text className='text-white ml-2'>Income</Text>
            </TouchableOpacity>

            {/* Expense Option */}
            <TouchableOpacity
              onPress={() => setTypeOfTransaction('expense')}
              className='flex-row items-center'
            >
              <View
                className={`h-5 w-5 rounded-full border-2 ${typeOfTransaction === 'expense' ? 'bg-white' : 'border-white'}`}
              />
              <Text className='text-white ml-2'>Expense</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className='bg-blue-500 rounded-md p-2 mb-3'
            onPress={() => handleSMS({
              message: sms,
              sender: "",
              timestamp: 0
            })}
          >
            <Text className='text-white font-Poppins text-center'>Submit</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
        :
        <></>
      }

      {/* Amount Input */}
      <Text className='text-white font-Poppins'>Amount</Text>
      <View className={`flex-row items-center border ${typeOfTransaction === 'income' ? 'border-green-500' : 'border-red-500'} rounded-md p-2 mb-4`}>
        <View className='flex items-center justify-center w-10 h-10 mr-5 rounded-full object-cover'>
          <FontAwesome name='money' size={24} color={'white'} />
        </View>
        <TextInput
          className={`flex-1 ${amountValidation ? 'text-white' : 'text-red-600'} font-Poppins`}
          keyboardType="numeric"
          placeholder='Amount'
          placeholderTextColor={amountValidation ? 'white' : 'red'}
          value={amount.toString()}
          onChangeText={(text) => setAmount(Number(text))}
        />
      </View>

      {/* Category Dropdown */}
      <TouchableOpacity onPress={() => setModalVisible(true)} className={`border ${typeOfTransaction === 'income' ? 'border-green-500' : 'border-red-500'} rounded-md p-2 mb-4`}>
        <View className='flex-row items-center'>
          <Image source={imageMap[selectedCategory.image]} className='w-10 h-10 mr-5 rounded-full object-cover' />
          <Text className={`text-[16px] font-Poppins ${categoryValidation ? 'text-white' : 'text-red-600'}`}>{selectedCategory.name}</Text>
        </View>
      </TouchableOpacity>
      <CategoryModal visible={modalVisible} type={typeOfTransaction} setCategory={(item) => { setCategoryValidation(true); setSelectedCategory(item); }} onClose={() => setModalVisible(false)} />

      <TouchableOpacity onPress={showDatepicker} className={`border ${typeOfTransaction === 'income' ? 'border-green-500' : 'border-red-500'} rounded-md p-2 mb-4`}>
        <View className='flex-row items-center'>
          <View className='flex items-center justify-center w-10 h-10 mr-5 rounded-full object-cover'>
            <FontAwesome name='calendar' size={24} color={'white'} />
          </View>
          <Text className='text-white text-[16px] font-Poppins'>{date.toDateString()}</Text>
        </View>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          themeVariant='dark'
          onChange={onDateChange}
        />
      )}

      {/* Notes Input */}
      <Text className='text-white font-Poppins'>Notes</Text>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className={`flex-row items-center border ${typeOfTransaction === 'income' ? 'border-green-500' : 'border-red-500'} rounded-md p-2 mb-4`}>
          <TextInput
            className={`flex-1 text-white font-Poppins`}
            value={notes}
            multiline={true}
            numberOfLines={4}
            placeholder='(Optional)'
            placeholderTextColor={'white'}
            onChangeText={setNotes}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Source Dropdown */}
      {/* <View className='border border-gray-300 rounded-md p-2 mb-4'>
        <TextInput
          placeholder="Source"
          value={source}
          onFocus={() => {
            // Open source selection modal or dropdown
          }}
          onChangeText={setSource}
        />
      </View> */}

      {/* Submit Button */}
      <TouchableOpacity
        className='bg-blue-500 rounded-md p-2'
        onPress={handleAddTransaction}
      >
        <Text className='text-white font-Poppins text-center'>Add Transaction</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddTransaction;
