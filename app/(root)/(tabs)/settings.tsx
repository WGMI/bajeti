import CategoryIcons from '@/components/CategoryIcons';
import CategoryModal from '@/components/CategoryModal';
import { addCategory, updateCategory } from '@/db/db';
import { imageMap } from '@/lib/images';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, Alert, ScrollView, Switch, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getMessagesFromSender, getMessagesFromSenderOnDate, getSenders } from '@/modules/smsreader';
import { PermissionsAndroid } from 'react-native';

import { Category } from '@/lib/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import SenderChips from '@/components/SenderChips';
import { fetchSenders } from '@/lib/helpers';


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
    const [senderListVisible, setSenderListVisible] = useState(false)

    const [hasSmsPermission, setHasSmsPermission] = useState(false);
    const [searchTerm, setSerchTerm] = useState('')
    const [senders, setSenders] = useState<string[]>([]);
    const [selectedSenders, setSelectedSenders] = useState<string[]>([]); // State to hold the selected senders

    useEffect(() => {
        requestSmsPermission()
    }, [])

    useEffect(() => {
        // Load SMS permission state from AsyncStorage when the component mounts
        const loadSmsPermission = async () => {
            try {
                const storedPermission = await AsyncStorage.getItem('smsPermission');
                if (storedPermission !== null) {
                    setHasSmsPermission(JSON.parse(storedPermission));
                }
            } catch (error) {
                console.log('Error loading SMS permission from storage', error);
            }
        };
        loadSmsPermission();
        requestSmsPermission(); // Request SMS permission when the component mounts
    }, []);

    const toggleSMSPermission = async () => {
        // Toggle the SMS permission state
        const newPermissionState = !hasSmsPermission;
        setHasSmsPermission(newPermissionState);

        // Store the new permission state in AsyncStorage
        try {
            await AsyncStorage.setItem('smsPermission', JSON.stringify(newPermissionState));
        } catch (error) {
            console.log('Error saving SMS permission to storage', error);
        }
    };

    useEffect(() => {
        const getSenderData = async () => {
            setSelectedSenders(await fetchSenders());
        }

        getSenderData()
    }, []);

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
                setSenders(getSenders())
            } else {
                console.log("SMS permission denied");
            }
        } catch (err) {
            console.warn(err);
        }
    }

    const getFilteredSenders = () => {
        // Filter senders based on search term
        return senders.filter(sender =>
            sender.toLowerCase().includes(searchTerm.toLowerCase().trim())
        );
    };

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

    // Function to select a sender and add it to the selected list
    const selectSender = (sender: string) => {
        if (!selectedSenders.includes(sender)) {
            setSelectedSenders([...selectedSenders, sender]);

            // Optionally store the selected senders in AsyncStorage
            AsyncStorage.setItem('selectedSenders', JSON.stringify([...selectedSenders, sender]))
                .then(() => {

                })
                .catch((error) => {
                    console.log('Failed to save sender', error);
                    Alert.alert('Error', 'Failed to save sender');
                });
        } else {
            Alert.alert('Info', `${sender} is already in the list`);
        }
    };

    // Function to remove a sender from the selected list
    const removeSender = (sender: string) => {
        const updatedSenders = selectedSenders.filter(s => s !== sender);
        setSelectedSenders(updatedSenders);

        // Optionally update AsyncStorage
        AsyncStorage.setItem('selectedSenders', JSON.stringify(updatedSenders))
            .catch(error => console.log('Failed to update selected senders', error));
    };

    return (
        <SafeAreaView className='flex flex-1 bg-[#292929]'>
            <View className='flex-row justify-between items-center bg-[#6034de] p-3 mb-4'>
                <Text className='text-lg text-white font-PoppinsMedium'>Settings</Text>
            </View>
            <View className='p-3'>
                <Text className='text-lg text-white font-PoppinsBold mb-3'>Categories</Text>
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
                <Text className='text-lg text-white font-PoppinsBold'>SMS</Text>
                <View className='flex-row my-3'>
                    <Switch
                        trackColor={{ false: '#767577', true: '#82b382' }}
                        thumbColor={hasSmsPermission ? '#009F00' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleSMSPermission}
                        value={hasSmsPermission}
                    />
                    <Text className={`mx-3 text-white font-Poppins`}>Fetch transactions from SMS</Text>
                </View>
                {hasSmsPermission ?
                    <>
                        <Text className='text-lg text-white font-Poppins'>Senders To Watch</Text>
                        <Text className='text-xs text-white font-PoppinsLight'>SMSs from the senders below will be added to your transactions</Text>
                        <View>
                            <View className='my-3'>
                                <SenderChips selectedSenders={selectedSenders} removeSender={removeSender} />
                            </View>
                            <Text className='text-sm mb-3 text-white font-Poppins'>Add senders to watch from the list below</Text>
                            <TextInput
                                value={searchTerm}
                                onChangeText={setSerchTerm}
                                placeholder="Search Senders"
                                placeholderTextColor={'white'}
                                className={`text-white font-Poppins border border-[#85d5ed] rounded-full p-3 mb-3`}
                            />
                            <FlatList
                                className='h-1/3'
                                data={getFilteredSenders()}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index }) => (
                                    <TouchableOpacity onPress={() => selectSender(item)}>
                                        <View className={`flex justify-center py-3 pl-1 ${index % 2 == 0 ? 'bg-[#575757]' : 'bg-[#292929]'}`}>
                                            <Text className='text-white font-Poppins'>{item}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </>
                    :
                    <></>
                }
            </View>
        </SafeAreaView>
    );
};

export default Settings;