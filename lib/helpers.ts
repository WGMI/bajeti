export const formatDate = (str:string): string => {
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