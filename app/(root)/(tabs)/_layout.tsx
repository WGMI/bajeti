import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { FontAwesome } from '@expo/vector-icons'; // Replace with your desired library


const TabIcon = ({ focused, icon, label }: { focused: boolean, icon: string, label: string }) => (
    <View className={`flex flex-row justify-center items-center rounded-full ${focused ? 'bg-general-300' : ''}`}>
        <View className={`w-12 h-12 justify-center items-center rounded-full ${focused ? 'bg-general-400' : ''}`}>
            <FontAwesome name={icon} size={18} color={focused ? '#85d5ed' : 'white'} />
            {/* <Text className='text-[9px] text-white capitalize font-PoppinsBold'>{label}</Text> */}
        </View>
    </View>
)

const Layout = () => {
    return (
        <Tabs
            initialRouteName='index'
            screenOptions={{
                tabBarActiveTintColor: 'white',
                tabBarInactiveTintColor: 'white',
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: '#000000',
                }
            }}
        >
            <Tabs.Screen
                name='index'
                options={{ 
                    title: 'Home', 
                    headerShown: false, 
                    tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="home" label="Home" /> 
                }}
            />
            <Tabs.Screen
                name='summary'
                options={{ 
                    title: 'Summary', 
                    headerShown: false, 
                    tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="pie-chart" label="Summary" /> 
                }}
            />
            <Tabs.Screen
                name='transactions'
                options={{ 
                    title: 'Transactions', 
                    headerShown: false, 
                    tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="list" label="Transactions" /> 
                }}
            />
            <Tabs.Screen
                name='settings'
                options={{ 
                    title: 'Settings', 
                    headerShown: false, 
                    tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="gear" label="settings" /> 
                }}
            />
        </Tabs>
    )
}

export default Layout