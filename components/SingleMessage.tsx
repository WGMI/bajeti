import { formatDate } from "@/lib/helpers";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { MoneyDisplay } from "./MoneyDisplay";
import { imageMap } from "@/lib/images";

export const SingleMessage = ({ item, onPress }: { item: any, onPress: () => void }) => {
    return (
        <View key={item.uuid} className='flex-row justify-between items-center my-1'>
            <View className='flex-row justify-between items-center'>
                <View className='flex-col ml-2'>
                    <Text className='text-white text-[16px] font-Poppins'>{item.title}</Text>
                    <Text className='text-white text-[12px] font-Poppins'>12-12-24</Text>
                </View>
            </View>
            <View className='flex-row justify-between items-center'>
                <View className='flex-col ml-2'>
                    <Text>123456789</Text>
                </View>
            </View>
        </View>
    )
}