import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { FontAwesome } from '@expo/vector-icons'

const SenderChips = ({ selectedSenders, color, removeSender }: { selectedSenders: string[], color?: string, removeSender?: (sender: string) => void }) => {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row flex-wrap">
                {selectedSenders.reverse().map((sender, index) => (
                    <View key={index} className={`${color ? 'bg-[' + color + ']' : 'bg-[#6034de]'} flex-row items-center rounded-full px-3 py-1 mr-2 mb-2`}>
                        <Text className="text-white mr-2 font-Poppins">{sender}</Text>
                        { removeSender && (<TouchableOpacity onPress={() => removeSender(sender)}>
                            <FontAwesome name='close' size={24} color='#fff' />
                        </TouchableOpacity>)
                        }
                    </View>
                ))}
            </View>
        </ScrollView>
    )
}

export default SenderChips