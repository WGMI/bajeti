import { Alert } from 'react-native';
import { deleteTransaction } from '@/db/db';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

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