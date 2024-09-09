import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import CategoryModal from './CategoryModal';
import { imageMap } from '@/lib/images';
import { getCategory, Transaction, updateTransaction } from '@/db/db';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from '@/lib/helpers';

const EditTransaction = ({ close, transaction }: { close: (refresh: boolean) => void, transaction: Object }) => {
  const initialState = {
    amount: transaction.amount,
    amountValidation: true,
    notes: transaction.description,
    source: '',
    modalVisible: false,
    date: transaction.date,
    show: false,
    selectedCategory: {
      image:'',
      name:''
    },
    categoryValidation: true,
  };

  useEffect(() => {
    getCategoryImage(transaction.category_id)
  },[])

  const getCategoryImage = async (id:number) => {
    try {
      const category = await getCategory(id)
      setSelectedCategory({
        id: category[0].id,
        image: category[0].image,
        name: category[0].name,
      })
    } catch (error) {
      
    }
  }

  // Initialize state variables using useState
  const [amount, setAmount] = useState(initialState.amount.toString());
  const [amountValidation, setAmountValidation] = useState(initialState.amountValidation);
  const [notes, setNotes] = useState(initialState.notes);
  const [source, setSource] = useState(initialState.source);
  const [modalVisible, setModalVisible] = useState(initialState.modalVisible);
  const [date, setDate] = useState(initialState.date);
  const [show, setShow] = useState(initialState.show);
  const [selectedCategory, setSelectedCategory] = useState<any>(initialState.selectedCategory);
  const [categoryValidation, setCategoryValidation] = useState(initialState.categoryValidation);

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
  };

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    setShow(Platform.OS === 'ios');
    console.log(selectedDate)
    setDate(selectedDate);
  };

  const showDatepicker = () => {
    setShow(true);
  };

  const handleEditTransaction = async () => {
    if (!amount || !selectedCategory.id) {
      setAmountValidation(amount);
      setCategoryValidation(selectedCategory.id);
      return;
    }

    const t: Transaction = {
      uuid: transaction.uuid,
      category_id: selectedCategory.id,
      amount: amount,
      description: notes,
      date: typeof(date) == 'string' ? new Date(date).toISOString().split('T')[0] : date.toISOString().split('T')[0],
      source_id: 0,
      created_at: new Date().toDateString(),
      updated_at: new Date().toDateString(),
    }

    try {
      await updateTransaction(t.uuid,Number(t.amount),t.category_id,t.description,t.date);
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

  return (
    <View className='bg-[#333] flex-1 p-4'>
      <View className='flex-row justify-between items-start my-5'>
        <Text className='text-white text-xl font-PoppinsBold mb-4 capitalize'>Edit {transaction.type}</Text>
        <TouchableOpacity onPress={closeAndReset} className='w-8 h-8 rounded-full bg-red-500 justify-center items-center'>
          <FontAwesome name='close' size={24} color='#fff' />
        </TouchableOpacity>
      </View>

      {/* Amount Input */}
      <Text className='text-white font-Poppins'>Amount</Text>
      <View className={`flex-row items-center border ${transaction.type === 'income' ? 'border-green-500' : 'border-red-500'} rounded-md p-2 mb-4`}>
        <View className='flex items-center justify-center w-10 h-10 mr-5 rounded-full object-cover'>
          <FontAwesome name='money' size={24} color={'white'} />
        </View>
        <TextInput
          className={`flex-1 text-white font-Poppins`}
          keyboardType="numeric"
          placeholder='Amount'
          placeholderTextColor={amountValidation ? 'white' : 'red'}
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      {/* Category Dropdown */}
      <TouchableOpacity onPress={() => setModalVisible(true)} className={`border ${transaction.type === 'income' ? 'border-green-500' : 'border-red-500'} rounded-md p-2 mb-4`}>
        <View className='flex-row items-center'>
          <Image source={imageMap[selectedCategory.image]} className='w-10 h-10 mr-5 rounded-full object-cover' />
          <Text className={`text-[16px] font-Poppins ${categoryValidation ? 'text-white' : 'text-red-600'}`}>{selectedCategory.name}</Text>
        </View>
      </TouchableOpacity>
      <CategoryModal visible={modalVisible} type={transaction.type} setCategory={(item) => { setCategoryValidation(true); setSelectedCategory(item); }} onClose={() => setModalVisible(false)} />

      <TouchableOpacity onPress={showDatepicker} className={`border ${transaction.type === 'income' ? 'border-green-500' : 'border-red-500'} rounded-md p-2 mb-4`}>
        <View className='flex-row items-center'>
          <View className='flex items-center justify-center w-10 h-10 mr-5 rounded-full object-cover'>
            <FontAwesome name='calendar' size={24} color={'white'} />
          </View>
          <Text className='text-white text-[16px] font-Poppins'>{formatDate(initialState.date)}</Text>
        </View>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={new Date(Date.parse(transaction.date))}
          mode="date"
          display="default"
          themeVariant='dark'
          onChange={onDateChange}
        />
      )}

      {/* Notes Input */}
      <Text className='text-white font-Poppins'>Notes</Text>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className={`flex-row items-center border ${transaction.type === 'income' ? 'border-green-500' : 'border-red-500'} rounded-md p-2 mb-4`}>
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
        onPress={handleEditTransaction}
      >
        <Text className='text-white text-center'>Edit Transaction</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditTransaction;
