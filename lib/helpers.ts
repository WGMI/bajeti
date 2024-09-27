import { Alert } from 'react-native';
import { deleteTransaction } from '@/db/db';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { PermissionsAndroid, Platform } from 'react-native';
import { getMessagesFromSenderInDateRange } from '@/modules/smsreader';
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
      messages[sender] = (getMessagesFromSenderInDateRange(sender, new Date().toISOString().split('T')[0]))
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

export const parseSMS = (sms:any) => {
  let result = {
    message:sms.message,
    type: "neither", // Default to "neither" if the message doesn't match income or expense
    amount: 0,
    date: ''
  };

  const { message, timestamp } = sms;
  // Regular expression to find amounts in KES, Ksh, Kshs (with optional period), or USD
  const amountRegex = /(KES|Ksh|Kshs\.?)\s?([\d,]+\.\d{1,2})|USD\s?([\d,]+\.\d{2})/;
  // Regular expression to find dates in the format dd/mm/yy, dd/mm/yyyy, or yyyy-mm-dd
  const dateRegex = /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}/;

  // Match the amount
  const amountMatch = message.match(amountRegex);
  if (amountMatch) {
    // Remove commas and convert the amount to a float
    const matchedAmount = amountMatch[2] || amountMatch[3];
    result.amount = parseFloat(matchedAmount.replace(/,/g, ''));
  }

  // Helper function to format dates to yyyy-mm-dd
  function formatDate(date:any) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Helper function to convert dd/mm/yy or dd/mm/yyyy to yyyy-mm-dd
  function convertShortYearDate(dateString:string) {
    const [day, month, year] = dateString.split('/');
    const fullYear = year.length === 2 ? `20${year}` : year; // Assume years like "24" are "2024"
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Use the timestamp if present, otherwise fall back to the date from the message
  if (timestamp) {
    result.date = formatDate(parseInt(timestamp));
  } else {
    const dateMatch = message.match(dateRegex);
    if (dateMatch) {
      const dateString = dateMatch[0];
      if (dateString.includes('/')) {
        result.date = convertShortYearDate(dateString);
      } else {
        result.date = dateString; // yyyy-mm-dd format doesn't need modification
      }
    }
  }

  // Determine if it's income or expense
  if (message.includes("bought") || message.includes("sent to") || message.includes("Auth for card") || message.includes("paid to")) {
    result.type = "expense";
  } else if (message.includes("received") || message.includes("credited to")) {
    result.type = "income";
  }

  // Return the result
  return result
}