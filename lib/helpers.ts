import { Alert } from 'react-native';
import { deleteTransaction } from '@/db/db';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { PermissionsAndroid, Platform } from 'react-native';
import { getMessagesFromSenderOnDate } from '@/modules/smsreader';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const handleAction = async (
  transaction: any,
  action: string,
  bottomSheetRef: React.RefObject<any>,
  setTransactionToEdit: (transaction: any) => void,
  reset: () => void
) => {
  switch (action) {
    case 'edit':
      // Expand the BottomSheet and set the transaction to edit
      bottomSheetRef.current?.expand();
      setTransactionToEdit(transaction);
      break;
    case 'duplicate':
      // Logic for duplicating the transaction (to be implemented later)
      break;
    case 'delete':
      try {
        // Delete the transaction by UUID
        Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Delete',
            onPress: async () => {
              try {
                await deleteTransaction(transaction.uuid);
                reset();
              } catch (error) {
                console.log(error)
                Alert.alert('Error', 'Failed to delete category: ' + error);
              }
            }
          }
        ]);
      } catch (e) {
        Alert.alert('Error', e as string);
      }
      break;
    default:
      break;
  }
};


export const formatDate = (str: string): string => {
  const dateObj = new Date(str);

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatMoney = (amount: number): [string, string] => {
  const [integerPart, decimalPart] = amount.toFixed(2).split(".");
  return [integerPart, decimalPart];
}

export const reload = (refresh: boolean, ref: React.RefObject<BottomSheetMethods>, refreshMethod: () => void) => {
  ref.current?.close()
  if (refresh) refreshMethod()
}

export const getMessagesOfTheDay = async () => {
  const getMessageData = (selectedSenders: any) => {
    const messageData: any = []
    selectedSenders.forEach((sender: string) => {
      const messages: any = {}
      messages[sender] = (getMessagesFromSenderOnDate(sender, new Date().toISOString().split('T')[0]))
      messageData.push(messages)
    });
    return messageData
  }

  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'SMS Permission',
          message: 'This app needs access to your SMS messages to read messages of the day',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        try {
          const storedSenders = await AsyncStorage.getItem('selectedSenders');
          if (storedSenders) {
            return getMessageData(JSON.parse(storedSenders));
          }
        } catch (error) {
          console.log('Failed to load senders from storage', error);
        }
      } else {
        Alert.alert('SMS permission denied', 'You can change this in your settings');
      }
    } catch (err) {
      Alert.alert('Error while checking permissions.');
    }
  } else {
    console.log('SMS permission is not required on this platform');
  }
};

export const fetchSenders = async () => {
  try {
      const storedSenders = await AsyncStorage.getItem('selectedSenders');
      if (storedSenders) {
          return JSON.parse(storedSenders);
      }
  } catch (error) {
      Alert.alert('Failed to load senders from storage', (error as Error).message);
  }
};
