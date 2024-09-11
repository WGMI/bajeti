import { PieChart } from "react-native-gifted-charts";
import { View, Text } from 'react-native'
import React from 'react'

const OverviewChart = ({ 
    income,
    expenses,
    radius,
    innerRadius,
    innerCircleColor,
    semiCirle }: {
        income: number,
        expenses: number,
        radius?: number,
        innerRadius?: number,
        innerCircleColor?: string,
        semiCirle?: boolean
    }) => {

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
            semiCircle={semiCirle ?? true}
            sectionAutoFocus
            innerCircleColor={innerCircleColor ?? '#292929'}
            animationDuration={1500}
            focusOnPress
            radius={radius ?? 60}
            innerRadius={innerRadius ?? 40}
        //centerLabelComponent={() => <Text className="text-white font-PoppinsBold">{percentage}%</Text>}
        />
    )
}

export default OverviewChart