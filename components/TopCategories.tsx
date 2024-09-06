import { View, Text } from 'react-native'
import React from 'react'
import { FlatList } from 'react-native'

const colors = ['bg-[#6034de]', 'bg-[#85d5ed]', 'bg-[#fbfbfb]']

const TopCategories = ({categoryData}:{categoryData:any[]}) => {
    if((categoryData.length) == 0) return
    return (
        <View className='mb-5'>
            <View className='flex-row'>
                <Text className='text-lg text-white font-PoppinsMedium'>Top </Text>
                <Text className='text-lg text-white font-PoppinsLight'>Categories</Text>
            </View>
            <FlatList
                data={categoryData}
                horizontal
                renderItem={({ item }) => (
                    <View className={`mr-2 mt-1 w-24 h-24 rounded-lg flex items-center justify-center ${colors[0]}`}>
                        <Text className='text-white font-Poppins'>{item.category}</Text>
                        <Text className='text-white font-Poppins'>{item.total_amount}</Text>
                    </View>
                )}
            />
        </View>
    )
}

export default TopCategories