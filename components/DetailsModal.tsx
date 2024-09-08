import React, { useEffect } from 'react';
import { Modal, View, Text, Image, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { imageMap } from '@/lib/images';

const DetailsModal = ({ transaction, visible, onClose, action }: { transaction: Object, visible: boolean, onClose: () => void, action: (transaction:Object, action:string) => void }) => {
    const data = transaction
    
    if (!transaction) return
    return (
        <Modal visible={visible} transparent={true} animationType="slide">
            <View className="flex-1 justify-center items-center bg-transparent">
                <View className={`bg-[#575757] w-5/6 rounded-lg`}>
                    {/* Header */}
                    <View className={`flex-row justify-between items-center ${data.type == 'income' ? 'bg-[#009F00]' : 'bg-[#BD1f29]'} p-4 rounded-t-lg`}>
                        <Text className="text-2xl font-PoppinsBold text-white">{data.amount}</Text>
                        <Text className="text-white font-Poppins">{data.date}</Text>
                    </View>

                    {/* Body */}
                    <View className="p-4">
                        <View className='flex-row items-center'>
                            <Image source={imageMap[data.image]} className='w-10 h-10 mr-5 rounded-full object-cover' />
                            <Text className='text-[16px] font-Poppins text-white'>{data.name}</Text>
                        </View>

                        <Text className="text-white font-Poppins mt-2">
                            {data.description}
                        </Text>
                    </View>

                    {/* Footer */}
                    <View className={`w-full h-1 ${data.type == 'income' ? 'bg-[#009F00]' : 'bg-[#BD1f29]'}`} />
                    <View className="flex-row justify-around mt-4">
                        <TouchableOpacity onPress={() => {
                            onClose();
                            action(data,'edit')
                        }} className='bg-white p-2 rounded-full'>
                            <FontAwesome name="edit" size={24} color="#6034de" />
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={() => {
                            onClose();
                            action(data.uuid,'duplicate')
                        }} className='bg-white p-2 rounded-full'>
                            <FontAwesome name="clone" size={24} color="#6034de" />
                        </TouchableOpacity> */}
                        <TouchableOpacity onPress={() => {
                            onClose();
                            action(data,'delete')
                        }} className='bg-white p-2 rounded-full'>
                            <FontAwesome name="trash" size={24} color="#6034de" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity className='bg-[#BD1f29] p-3 rounded-md mt-4' onPress={onClose}>
                        <Text className='text-white font-Poppins text-center'>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default DetailsModal;
