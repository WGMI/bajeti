import { PieChart } from "react-native-gifted-charts";
import { View, Text } from 'react-native'
import React from 'react'

const OverviewChart = () => {

    const pieData = [
        { value: 47, color: '#009F00', gradientCenterColor: '#006D00', focused: true, },
        { value: 53, color: '#BD1f29', gradientCenterColor: '#8F80F3' }
    ]
    
    return (
        <PieChart
            data={pieData}
            donut
            showGradient
            semiCircle
            sectionAutoFocus
            innerCircleColor={'#000'}
            focusOnPress
            radius={60}
            innerRadius={40}
            centerLabelComponent={() => <Text className="text-white font-PoppinsBold">47%</Text>}
        />
    )
}

export default OverviewChart