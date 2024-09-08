import { View, Text, TouchableOpacity, Image, Alert, SectionList } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { getTransactions } from '@/db/db'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlatList, TextInput } from 'react-native-gesture-handler'
import { imageMap } from '@/lib/images'
import { formatDate, handleAction, reload } from '@/lib/helpers'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import DetailsModal from '@/components/DetailsModal'
import Controls from '@/components/controls'
import EditTransaction from '@/components/EditTransaction'
import AddTransaction from '@/components/AddTransaction'
import { FontAwesome } from '@expo/vector-icons'
import { SingleTransaction } from '@/components/SingleTransaction'
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import CategoryModal from '@/components/CategoryModal'
import DateTimePicker from '@react-native-community/datetimepicker';

const Transactions = () => {
  const [rawtransactions, setRawtransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [transactions, setTransactions] = useState([])
  const [transactionType, setTransactionType] = useState('')
  const [searchCategory, setSearchCategory] = useState('')
  const [startDate, setStartDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [searchNotes, setSearchNotes] = useState('')
  const [detailData, setDetailData] = useState(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [searchVisible, setSearchVisible] = useState(false)
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showToDatePicker, setShowToDatePicker] = useState(false)
  const [transactionToEdit, setTransactionToEdit] = useState(null)
  const bottomSheetRef = useRef<BottomSheet>(null)
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    getTransactionData()
  }, [])

  const opensearch = () => {
    setSearchVisible(true)
  }

  const closeSearch = () => {
    setSearchVisible(false)
    setSearchCategory('')
    setStartDate('')
    setToDate('')
    setSearchNotes('')
  }

  const search = () => {
    console.log(searchCategory, startDate, toDate, searchNotes);

    const filteredTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date || transaction.created_at);
      const start = startDate ? new Date(startDate) : null;
      const end = toDate ? new Date(toDate) : null;

      // Category match
      const categoryMatch = searchCategory ? transaction.category === searchCategory : true;

      // Date match
      const dateMatch = (!start || transactionDate >= start) && (!end || transactionDate <= end);

      // Notes match
      const notesMatch = searchNotes ? transaction.notes.toLowerCase().includes(searchNotes.toLowerCase()) : true;

      return categoryMatch && dateMatch && notesMatch;
    });

    const filtered = groupTransactionsByMonth(filteredTransactions)
    console.log(filtered)
    setTransactions(filtered);
  };



  const getTransactionData = async () => {
    try {
      const transactions = await getTransactions()
      setRawtransactions(transactions)
      setTransactions(groupTransactionsByMonth(transactions))
    } catch (error) {
      console.log(error)
    }
  }

  const groupTransactionsByMonth = (transactions) => {
    // Helper function to format date as "Month YYYY"
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'long' };
      return date.toLocaleDateString('en-US', options);
    };

    // Grouping transactions by formatted month-year
    const groupedTransactions = transactions.reduce((acc, transaction) => {
      const dateKey = formatDate(transaction.date || transaction.created_at);

      // If the group for the current month-year doesn't exist, create it
      if (!acc[dateKey]) acc[dateKey] = [];

      // Push the current transaction to the relevant group
      acc[dateKey].push(transaction);

      return acc;
    }, {});

    // Convert the grouped transactions into the desired format
    return Object.entries(groupedTransactions).map(([title, data]) => ({
      title,
      data
    }));
  };

  const selectSearchCategory = () => {
    setModalVisible(true)
  }

  const openStartDatePicker = () => {
    setShowStartDatePicker(true)
  }

  const openToDatePicker = () => {
    setShowToDatePicker(true)
  }

  const onStartDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowStartDatePicker(false);
    setStartDate(formatDate(selectedDate));
  };

  const onEndDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowToDatePicker(false);
    setToDate(formatDate(selectedDate));
  };

  return (
    <SafeAreaView className='flex flex-1 bg-[#292929]'>
      <View>
        <View className='flex-row justify-between items-center bg-[#6034de] p-3 mb-2'>
          <Text className='text-lg text-white font-PoppinsMedium'>Transactions </Text>
          <TouchableOpacity onPress={opensearch}>
            <FontAwesome name='search' color={'white'} size={24} />
          </TouchableOpacity>
        </View>
        <CategoryModal visible={modalVisible} type={'all'} setCategory={(item) => { setSearchCategory(item.name); }} onClose={() => setModalVisible(false)} />
        {searchVisible ? <View>
          <View className='flex flex-row justify-between items-center'>
            <Text className='flex-1 text-lg text-white font-Poppins'>Category:</Text>
            <TouchableOpacity onPress={selectSearchCategory} className='flex-1 border border-[#85d5ed] p-1'>
              <Text className='text-lg text-white font-Poppins'>{searchCategory == '' ? 'Set Category' : searchCategory}</Text>
            </TouchableOpacity>
          </View>
          <View className='flex flex-row justify-between items-center'>
            <Text className='flex-1 text-lg text-white font-Poppins'>From:</Text>
            <TouchableOpacity onPress={openStartDatePicker} className='flex-1 border border-[#85d5ed] p-1'>
              <Text className='text-lg text-white font-Poppins'>{startDate == '' ? 'Start Date' : (startDate)}</Text>
            </TouchableOpacity>
          </View>
          {showStartDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="default"
              themeVariant='dark'
              onChange={onStartDateChange}
            />
          )}
          <View className='flex flex-row justify-between items-center'>
            <Text className='flex-1 text-lg text-white font-Poppins'>To:</Text>
            <TouchableOpacity onPress={openToDatePicker} className='flex-1 border border-[#85d5ed] p-1'>
              <Text className='text-lg text-white font-Poppins'>{toDate == '' ? 'End Date' : toDate}</Text>
            </TouchableOpacity>
          </View>
          {showToDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="default"
              themeVariant='dark'
              onChange={onEndDateChange}
            />
          )}
          <View className='flex flex-row justify-between items-center'>
            <Text className='flex-1 text-lg text-white font-Poppins'>Notes:</Text>
            <TextInput
              className={`flex-1 text-white font-Poppins border border-[#85d5ed] p-1`}
              placeholder='Notes'
              placeholderTextColor={'white'}
              value={searchNotes}
              onChangeText={setSearchNotes}
            />
          </View>
          <TouchableOpacity onPress={search} className='bg-[#6034de] p-3 rounded-md my-2 '>
            <Text className='text-white text-center font-Poppins'>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={closeSearch} className='bg-[#BD1f29] p-3 rounded-md my-2 '>
            <Text className='text-white text-center font-Poppins'>Close and Clear</Text>
          </TouchableOpacity>
        </View> : <></>}
        <SectionList
          sections={transactions}
          keyExtractor={(item) => item.uuid}
          renderItem={({ item }) => (
            <View className='mx-2'>
              <SingleTransaction item={item} onPress={() => { setDetailData(item); setDetailVisible(true); }} />
            </View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View className='flex items-center justify-center bg-[#575757] p-3'>
              <Text className='text-white font-PoppinsBold'>{title}</Text>
            </View>
          )}
        />
      </View>
      <DetailsModal transaction={detailData} visible={detailVisible} onClose={() => { setDetailData(null); setDetailVisible(false); }} action={(transaction, action) => handleAction(transaction, action, bottomSheetRef, setTransactionToEdit, getTransactionData)} />
      <Controls
        onPress={(type: string) => {
          bottomSheetRef.current?.expand()
          setTransactionType(type)
        }}
      />
      <BottomSheet ref={bottomSheetRef} snapPoints={['70%', '85%']} index={-1} backgroundStyle={{ backgroundColor: '#6034de' }}>
        <BottomSheetScrollView style={{ flex: 1, padding: 10, backgroundColor: '#292929' }}>
          {transactionToEdit ?
            <EditTransaction close={(refresh) => { reload(refresh, bottomSheetRef, getTransactionData); setTransactionToEdit(null) }} transaction={transactionToEdit} />
            :
            <AddTransaction transactionType={transactionType} close={(refresh) => reload(refresh, bottomSheetRef, getTransactionData)} />
          }
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  )
}

export default Transactions