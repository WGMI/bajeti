import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const Layout = () => {
  return (
    <GestureHandlerRootView>
      <Stack>
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        <Stack.Screen name="monthtransactions" options={{ headerShown: false }} />
        <Stack.Screen name="messages" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  )
}

export default Layout