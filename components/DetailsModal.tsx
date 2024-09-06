import React, { useEffect } from 'react';
import { Modal, View, Text, Image, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const DetailsModal = ({ transaction, visible, onClose }: { transaction: Object, visible: boolean, onClose: () => void }) => {
    const data = transaction
    useEffect(() => {console.log(transaction)},[transaction])
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
        >
            <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                <View className="bg-white w-5/6 rounded-lg p-4">
                    {/* Header */}
                    <View className="flex-row justify-between items-center bg-blue-500 p-4 rounded-t-lg">
                        <Text className="text-2xl font-bold text-white">${data.amount}</Text>
                        <Text className="text-white">{data.date}</Text>
                    </View>

                    {/* Body */}
                    <View className="p-4">
                        <Image
                            source={{ uri: data.image }}
                            className="w-full h-40 rounded-md mb-4"
                        />
                        <Text className="text-lg font-semibold">{data.name}</Text>
                        <Text className="text-gray-500 mt-2">
                            {data.description ? data.description : 'No notes available'}
                        </Text>
                    </View>

                    {/* Footer */}
                    <View className="flex-row justify-around mt-4">
                        <TouchableOpacity>
                            <FontAwesome name="edit" size={24} color="gray" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <FontAwesome name="trash" size={24} color="gray" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <FontAwesome name="clone" size={24} color="gray" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={onClose} className="mt-6">
                        <Text className="text-center text-blue-500">Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default DetailsModal;
