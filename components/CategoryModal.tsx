import { deleteCategory, getCategories, getCategoriesByType } from '@/db/db';
import { imageMap } from '@/lib/images';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, Alert, Image } from 'react-native';

const CategoryModal = ({ visible, type, setCategory, onClose, deletable, updated }: { visible: boolean, type: string, setCategory: (item: Object) => void, onClose: () => void, deletable?: boolean, updated?: boolean }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    if (type == 'all') {
      fetchAllCategories()
    } else {
      fetchCategories(type);
      fetchTest()
    }
  }, [type,deleted,updated]);

  const handleDeleteCategory = (id: number) => {
    Alert.alert('Delete Category', 'Are you sure you want to delete this category?', [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await deleteCategory(id);
            Alert.alert('Success', 'Category deleted');
            setDeleted(!deleted)
          } catch (error) {
            console.log(error)
            Alert.alert('Error', 'Failed to delete category: ' + error);
          }
        }
      }
    ]);
  }

  const fetchCategories = async (categoryType: string) => {
    await getCategoriesByType(categoryType)
      .then((categories) => {
        setCategories(categories as any[]);
      })
      .catch((error) => {
        console.log('Error fetching categories:', error);
        Alert.alert('Error', 'Failed to fetch categories');
      })
  };

  const fetchTest = async () => {
    try {
      const allcategories = await getCategories()
      console.log(allcategories)
    } catch (error) {
      console.log('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to fetch categories');
    }
  }

  const fetchAllCategories = async () => {
    try {
      const allcategories = await getCategories()
      setCategories(allcategories as any[])
    } catch (error) {
      console.log('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to fetch categories');
    }
  };

  const selectCategory = (item: Object) => {
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
              <View className='flex-row justify-between items-center border-b border-gray-300'>
                <TouchableOpacity onPress={() => selectCategory(item)} className='flex-row items-center py-2'>
                  <Image source={imageMap[item.image]} className='w-10 h-10 rounded-full object-cover mr-2' />
                  <Text className='text-white font-Poppins'>{item.name}</Text>
                </TouchableOpacity>
                {deletable ?
                  <TouchableOpacity onPress={() => handleDeleteCategory(item.id)}>
                    <FontAwesome name="trash" size={20} color="white" />
                  </TouchableOpacity>
                  :
                  <></>
                }
              </View>
            )}
          />

          {/* Footer */}
          <View className='mt-4'>
            <TouchableOpacity
              className='bg-red-500 p-3 rounded-md'
              onPress={onClose}
            >
              <Text className='text-white text-center font-Poppins'>Close</Text>
            </TouchableOpacity>
          </View>
          {type == 'all' ? <></> : <View className='mt-4'>
            {/* <TouchableOpacity 
              className='bg-blue-500 p-3 rounded-md mb-2'
              onPress={() => router.push('/settings')}
            >
              <Text className='text-white text-center font-Poppins'>New Category</Text>
            </TouchableOpacity> */}

            {/* Close Modal */}

          </View>}
        </View>
      </View>
    </Modal>
  );
};

export default CategoryModal;
