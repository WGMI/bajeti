import { imageMap } from '@/lib/images';
import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    Button,
    GestureResponderEvent,
} from 'react-native';

// Defining the types for the image map and props
type ImageMapType = {
    [key: string]: any; // Adjust 'any' to the correct image type, depending on your environment
};

interface SelectIconModalProps {
    isVisible: boolean;
    onClose: (event?: GestureResponderEvent) => void;
    handleImagePress: (imageName: string) => void;
}

export const images: ImageMapType = imageMap

const CategoryIcons: React.FC<SelectIconModalProps> = ({ isVisible, onClose, handleImagePress }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const imageList = Object.keys(images);

    // const handleImagePress = (imageName: string) => {
    //     console.log(imageName);
    //     setSelectedImage(imageName);
    // };

    const renderItem = ({ item }: { item: string }) => (
        <TouchableOpacity onPress={() => handleImagePress(item)}>
            <Image source={images[item]} className='w-12 h-12 m-2 rounded-full object-cover' />
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className='flex-1 justify-center items-center bg-transparent'>
                <View className='flex justify-center items-center bg-[#575757] p-5 rounded-lg w-11/12'>
                    <Text className='text-lg text-white font-PoppinsBold mb-4'>Select Icon</Text>

                    <FlatList
                        data={imageList}
                        renderItem={renderItem}
                        keyExtractor={(item) => item}
                        numColumns={4}
                    />

                    <TouchableOpacity className='bg-red-500 p-3 rounded-md my-2' onPress={onClose}>
                        <Text className='text-white text-center font-Poppins'>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default CategoryIcons;
