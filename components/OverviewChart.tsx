import { PieChart } from "react-native-gifted-charts";
import { View, Text } from 'react-native'
import React from 'react'

const OverviewChart = ({ income, expenses }: { income: number, expenses: number }) => {

    const pieData = [
        { value: income, color: '#009F00', gradientCenterColor: '#006D00', focused: true, },
        { value: expenses, color: '#BD1f29', gradientCenterColor: '#8F80F3' }
    ]

    const percentage = Math.floor((income / (income + expenses)) * 100)

    return (
        <PieChart
            data={pieData}
            donut
            showGradient
            semiCircle
            sectionAutoFocus
            innerCircleColor={'#292929'}
            animationDuration={1500}  
            animateOnDataChange
            focusOnPress
            radius={60}
            innerRadius={40}
            //centerLabelComponent={() => <Text className="text-white font-PoppinsBold">{percentage}%</Text>}
        />
    )
}

export default OverviewChart