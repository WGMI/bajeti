import { getCategories, getCategoriesByType } from '@/db/db';
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';

const CategoryModal = ({ visible, type, setCategory, onClose }: { visible: boolean, type:string, setCategory: (item:Object) => void, onClose: () => void }) => {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories(type);
  }, [type]);

  const fetchCategories = async (categoryType:string) => {
    await getCategoriesByType(categoryType)
    .then((categories) => {
      setCategories(categories as any[]);
    })
    .catch((error) => {
      console.log('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to fetch categories');
    })
  };

  const selectCategory = (item:Object) => {
    setCategory(item)
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className='flex-1 justify-center items-center bg-transparent'>
        <View className='bg-[#575757] p-5 rounded-lg w-11/12'>
          {/* Heading */}
          <Text className='text-white text-lg font-PoppinsBold font-bold mb-4'>Select Category</Text>
          
          {/* Body: List of categories */}
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => selectCategory(item)} className='py-2 border-b border-gray-300'>
                <Text className='text-white font-Poppins'>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          
          {/* Footer */}
          <View className='mt-4'>
            <TouchableOpacity 
              className='bg-blue-500 p-3 rounded-md mb-2'
              onPress={() => console.log('Add New Category')}
            >
              <Text className='text-white text-center'>New Category</Text>
            </TouchableOpacity>

            {/* Close Modal */}
            <TouchableOpacity 
              className='bg-red-500 p-3 rounded-md'
              onPress={onClose}
            >
              <Text className='text-white text-center'>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CategoryModal;
