import { formatMoney } from "@/lib/helpers"
import { Text, View } from "react-native"

export const MoneyDisplay = ({ amount, type, textSize }: { amount: number, type?: string, textSize?: string }) => {
    const [large, small] = formatMoney(amount)
    return (
        <View className={`flex-row ${textSize ? '' : 'items-end'}`}>
            <Text className={`${textSize ? textSize : 'text-lg'} text-white font-Poppins`}>{large}</Text>
            {
                (small !== '00') ?
                    <Text className={`${textSize ? 'text-lg' : 'text-sm'} text-white font-Poppins`}>.{small}</Text>
                    :
                    <></>
            }
            {type ? <View className={`ml-1 w-1 h-full ${type! == 'income' ? 'bg-[#009F00]' : 'bg-[#BD1f29]'}`} /> : <></>}
        </View>
    )
}