import { View, Text } from 'react-native'
import React from 'react'
import { FlatList } from 'react-native'

const data = [
    {
        'name': 'Rent',
        'amount': 15000
    },
    {
        'name': 'Food',
        'amount': 12000
    },
    {
        'name': 'Internet',
        'amount': 5000
    },
    {
        'name': 'Shopping',
        'amount': 15000
    },
]

const colors = ['bg-[#6034de]', 'bg-[#85d5ed]', 'bg-[#fbfbfb]']

const TopCategories = () => {
    return (
        <View>
            <View className='flex-row mb-2'>
                <Text className='text-lg text-white font-PoppinsMedium'>Top </Text>
                <Text className='text-lg text-white font-PoppinsLight'>Categories</Text>
            </View>
            <FlatList
                data={data}
                horizontal
                renderItem={({ item }) => (
                    <View className={`m-1 w-24 h-24 rounded-lg flex items-center justify-center ${colors[0]}`}>
                        <Text className='text-white font-Poppins'>{item.name}</Text>
                        <Text className='text-white font-Poppins'>{item.amount}</Text>
                    </View>
                )}
            />
        </View>
    )
}

export default TopCategories