import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

const AddTransaction = ({close,transactionType}:{close: () => void,transactionType:string}) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [source, setSource] = useState('');

  const handleAddTransaction = () => {
    // Handle the transaction submission logic here
  };

  return (
    <View className='bg-[#333] flex-1 p-4'>
      <View className='flex-row justify-between items-start'>
        <Text className='text-xl font-bold mb-4 capitalize'>Add {transactionType}</Text>

        <TouchableOpacity onPress={close} className='w-8 h-8 rounded-full bg-red-500 justify-center items-center'>
          <FontAwesome name='close' size={24} color='#fff' />
        </TouchableOpacity>
      </View>
      {/* Amount Input */}
      <TextInput
        className={`border ${transactionType === 'income' ? 'border-green-500' : 'border-red-500'} rounded-md p-2 mb-4`}
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      {/* Category Dropdown */}
      <View className='border border-gray-300 rounded-md p-2 mb-4'>
        <TextInput
          placeholder="Category"
          value={category}
          onFocus={() => {
            // Open category selection modal or dropdown
          }}
          onChangeText={setCategory}
        />
      </View>

      {/* Notes Input */}
      <TextInput
        className={`border ${transactionType === 'income' ? 'border-green-500' : 'border-red-500'} rounded-md p-2 mb-4`}
        placeholder="Notes"
        value={notes}
        onChangeText={setNotes}
      />

      {/* Source Dropdown */}
      <View className='border border-gray-300 rounded-md p-2 mb-4'>
        <TextInput
          placeholder="Source"
          value={source}
          onFocus={() => {
            // Open source selection modal or dropdown
          }}
          onChangeText={setSource}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className='bg-blue-500 rounded-md p-2'
        onPress={handleAddTransaction}
      >
        <Text className='text-white text-center'>Add Transaction</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddTransaction;
