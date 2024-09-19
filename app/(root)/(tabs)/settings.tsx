import CategoryIcons from '@/components/CategoryIcons';
import CategoryModal from '@/components/CategoryModal';
import { addCategory, updateCategory } from '@/db/db';
import { imageMap } from '@/lib/images';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { hello, getMessagesFromSender, getSenders } from '@/modules/smsreader';
import { PermissionsAndroid } from 'react-native';

import { Category } from '@/lib/types';

async function requestSmsPermission() {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_SMS,
            {
                title: "SMS Permission",
                message: "This app needs access to your SMS messages",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
            }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("You can read SMS")
            console.log(getSenders())
        } else {
            console.log("SMS permission denied");
        }
    } catch (err) {
        console.warn(err);
    }
}

const Settings = () => {
    const [categoryName, setCategoryName] = useState('');
    const [categoryType, setCategoryType] = useState('income');
    const [isModalVisible, setModalVisible] = useState(false);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [categoryImage, setCategoryImage] = useState("default.jpg");
    const [editSectionVisible, setEditSectionVisible] = useState(false);
    const [addSectionVisible, setAddSectionVisible] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
    const [updated, setUpdated] = useState(false);
    const [senderListVisible,setSenderListVisible] = useState(false)

    const [hasSmsPermission, setHasSmsPermission] = useState<boolean | null>(null);

    const toggleSwitch = () => setHasSmsPermission(previousState => !previousState);

    useEffect(() => {
        requestSmsPermission()
    }, [])

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const handleAddCategory = async () => {
        if (categoryName.length == 0) {
            Alert.alert('Error', 'Category name cannot be empty');
            return;
        }
        try {
            const addCategoryId = await addCategory(categoryName, categoryImage, categoryType);
            setCategoryName('');
            setAddSectionVisible(false);
            setUpdated(!updated)
            Alert.alert('Success', 'Category added');
        } catch (error) {
            console.log(error)
            Alert.alert('Error', 'Failed to add category: ' + error);
        }
    }

    const handleEditCategory = async () => {
        try {
            setCategoryModalVisible(false)
            setEditSectionVisible(true);
            if (categoryToEdit != null) {
                await updateCategory(categoryToEdit.id!, categoryToEdit.name, categoryToEdit.image, categoryToEdit.type);
                Alert.alert('Success', 'Category edited');
                setCategoryToEdit(null);
            }
        } catch (error) {
            console.log(error)
            Alert.alert('Error', 'Failed to edit category: ' + error);
        }
    }

    return (
        <SafeAreaView className='flex flex-1 bg-[#292929]'>
            <View className='flex-row justify-between items-center bg-[#6034de] p-3 mb-4'>
                <Text className='text-lg text-white font-PoppinsMedium'>Settings</Text>
            </View>
            <View className='p-3'>
                <TouchableOpacity className='mb-2 p-3 rounded-md border border-[#85d5ed]' onPress={() => { setAddSectionVisible(!addSectionVisible); setEditSectionVisible(false); setCategoryToEdit(null) }}>
                    <Text className='text-white text-center font-Poppins'>{addSectionVisible ? 'Close' : 'New Category'}</Text>
                </TouchableOpacity>
                <TouchableOpacity className='mb-2 p-3 rounded-md border border-[#85d5ed]' onPress={() => {
                    if (!editSectionVisible) {
                        setCategoryModalVisible(true);
                        setAddSectionVisible(false)
                    } else {
                        setEditSectionVisible(false)
                    }
                }}>
                    <Text className='text-white font-Poppins text-center'>{editSectionVisible ? 'Close' : 'Edit or Delete Category'}</Text>
                </TouchableOpacity>
                <CategoryModal visible={categoryModalVisible} type={'all'} setCategory={(item) => { setEditSectionVisible(true); setCategoryToEdit(item as any); }} onClose={() => { setCategoryModalVisible(false); }} deletable={true} updated={updated} />
                <ScrollView>
                    {/* Header */}

                    {addSectionVisible ?

                        <View className='flex-1 p-4'>
                            {/* <TouchableOpacity onPress={openCategoryForm}>
                    <Text className='text-white mb-2'>New Category</Text>
                </TouchableOpacity> */}
                            <Text className='text-xl text-white mb-2 font-PoppinsBold'>New Category</Text>
                            <Text className='text-white mb-2 font-Poppins'>Category Name</Text>
                            <TextInput
                                value={categoryName}
                                onChangeText={setCategoryName}
                                placeholder="Enter category name"
                                placeholderTextColor={'white'}
                                className={`text-white font-Poppins border border-[#85d5ed] p-3 mb-2`}
                            />

                            {/* Category Type with Radio Buttons */}
                            <Text className='text-white mb-2'>Category Type</Text>
                            <View className='flex-row mb-4'>
                                {/* Income Option */}
                                <TouchableOpacity
                                    onPress={() => setCategoryType('income')}
                                    className='flex-row items-center mr-4'
                                >
                                    <View
                                        className={`h-5 w-5 rounded-full border-2 ${categoryType === 'income' ? 'bg-white' : 'border-white'}`}
                                    />
                                    <Text className='text-white ml-2'>Income</Text>
                                </TouchableOpacity>

                                {/* Expense Option */}
                                <TouchableOpacity
                                    onPress={() => setCategoryType('expense')}
                                    className='flex-row items-center'
                                >
                                    <View
                                        className={`h-5 w-5 rounded-full border-2 ${categoryType === 'expense' ? 'bg-white' : 'border-white'}`}
                                    />
                                    <Text className='text-white ml-2'>Expense</Text>
                                </TouchableOpacity>
                            </View>

                            <Text className='text-white mb-2'>Icon</Text>
                            <TouchableOpacity className='mb-2 p-3 rounded-md border border-[#85d5ed]' onPress={toggleModal}>
                                <Text className='text-white text-center font-Poppins'>Choose Icon</Text>
                            </TouchableOpacity>
                            <CategoryIcons isVisible={isModalVisible} onClose={toggleModal} handleImagePress={(imagename) => { setModalVisible(false); setCategoryImage(imagename); }} />

                            {/* Preview Icon */}
                            <View className='flex-row items-center my-4'>
                                <Image source={imageMap[categoryImage as keyof typeof imageMap]} className='w-10 h-10 mr-5 rounded-full object-cover' />
                                <Text className={`text-lg font-Poppins mr-2 ${categoryType == 'expense' ? 'text-red-500' : 'text-green-500'}`}>{categoryName}</Text>
                            </View>

                            {/* Add Category Button */}
                            <TouchableOpacity
                                className='bg-[#6034de] rounded-md p-2'
                                onPress={handleAddCategory}>
                                <Text className='text-white font-Poppins text-center'>Add Category</Text>
                            </TouchableOpacity>
                        </View>
                        :
                        <></>
                    }

                    {editSectionVisible && categoryToEdit ?

                        <View className='flex-1 p-4'>
                            <Text className='text-xl text-white mb-2 font-PoppinsBold'>Edit {categoryToEdit.name}</Text>
                            <Text className='text-white mb-2 font-Poppins'>Category Name</Text>
                            <TextInput
                                value={categoryToEdit.name}
                                onChangeText={(text) => setCategoryToEdit({ ...categoryToEdit, name: text })}
                                placeholder="Enter category name"
                                placeholderTextColor={'white'}
                                className={`text-white font-Poppins border border-[#85d5ed] p-3 mb-2`}
                            />

                            {/* Category Type with Radio Buttons */}
                            <Text className='text-white mb-2'>Category Type</Text>
                            <View className='flex-row mb-4'>
                                {/* Income Option */}
                                <TouchableOpacity
                                    onPress={() => setCategoryToEdit({ ...categoryToEdit, type: 'income' })}
                                    className='flex-row items-center mr-4'
                                >
                                    <View
                                        className={`h-5 w-5 rounded-full border-2 ${categoryToEdit.type === 'income' ? 'bg-white' : 'border-white'}`}
                                    />
                                    <Text className='text-white ml-2'>Income</Text>
                                </TouchableOpacity>

                                {/* Expense Option */}
                                <TouchableOpacity
                                    onPress={() => setCategoryToEdit({ ...categoryToEdit, type: 'expense' })}
                                    className='flex-row items-center'
                                >
                                    <View
                                        className={`h-5 w-5 rounded-full border-2 ${categoryToEdit.type === 'expense' ? 'bg-white' : 'border-white'}`}
                                    />
                                    <Text className='text-white ml-2'>Expense</Text>
                                </TouchableOpacity>
                            </View>

                            <Text className='text-white mb-2'>Icon</Text>
                            <TouchableOpacity className='mb-2 p-3 rounded-md border border-[#85d5ed]' onPress={toggleModal}>
                                <Text className='text-white text-center font-Poppins'>Choose Icon</Text>
                            </TouchableOpacity>
                            <CategoryIcons isVisible={isModalVisible} onClose={toggleModal} handleImagePress={(imagename) => { setModalVisible(false); setCategoryToEdit({ ...categoryToEdit, image: imagename }); }} />

                            {/* Preview Icon */}
                            <View className='flex-row items-center my-4'>
                                <Image source={imageMap[categoryToEdit.image as keyof typeof imageMap]} className='w-10 h-10 mr-5 rounded-full object-cover' />
                                <Text className={`text-lg font-Poppins mr-2 ${categoryToEdit.type == 'expense' ? 'text-red-500' : 'text-green-500'}`}>{categoryToEdit.name}</Text>
                            </View>

                            {/* Add Category Button */}
                            <TouchableOpacity
                                className='bg-[#6034de] rounded-md p-2'
                                onPress={handleEditCategory}>
                                <Text className='text-white font-Poppins text-center'>Edit Category</Text>
                            </TouchableOpacity>
                        </View>
                        :
                        <></>
                    }
                </ScrollView>
            </View>
            <View className='border border-[#85d5ed]' />
            <View className='p-3'>
                <View className='flex-row'>
                    <Switch
                        trackColor={{ false: '#767577', true: '#82b382' }}
                        thumbColor={hasSmsPermission ? '#009F00' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleSwitch}
                        value={hasSmsPermission}
                    />
                    <Text className={`mx-3 text-white font-Poppins`}>Fetch transactions from SMS</Text>
                </View>
                {hasSmsPermission ?
                    <>
                        <Text className='text-lg text-white font-PoppinsBold'>Senders To Watch</Text>
                        <TouchableOpacity className='mb-2 p-3 rounded-md border border-[#85d5ed]' onPress={() => { setSenderListVisible(!senderListVisible);}}>
                            <Text className='text-white text-center font-Poppins'>{senderListVisible ? 'Close' : 'Add Senders'}</Text>
                        </TouchableOpacity>
                    </>
                    :
                    <></>
                }
            </View>
        </SafeAreaView>
    );
};

export default Settings;
