import { formatDate } from "@/lib/helpers";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { MoneyDisplay } from "./MoneyDisplay";
import { imageMap } from "@/lib/images";

export const SingleTransaction = ({ item, onPress }: { item: any, onPress:() => void }) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <View key={item.uuid} className='flex-row justify-between items-center my-1'>
                <View className='flex-row justify-between items-center'>
                    <Image source={imageMap[item.image]} className='w-10 h-10 rounded-full object-cover' />
                    <View className='flex-col ml-2'>
                        <Text className='text-white text-[16px] font-Poppins'>{item.name}</Text>
                        <Text className='text-white text-[12px] font-Poppins'>{formatDate(item.date)}</Text>
                    </View>
                </View>
                <View className='flex-row justify-between items-center'>
                    <View className='flex-col ml-2'>
                        <MoneyDisplay amount={item.amount} type={item.type} />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}