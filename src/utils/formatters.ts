export const formatNumberWithCommas = (num: number): string => {
  let formattedNumber;
  
  if (num < 0.0001) {
    // Use 10 decimal places for very small numbers
    formattedNumber = num.toFixed(10);
  } else if (num < 1) {
    // Use 8 decimal places for small numbers
    formattedNumber = num.toFixed(8);
  } else {
    // Use 6 decimal places for normal numbers
    formattedNumber = num.toFixed(6);
  }
  
  // Split into integer and decimal parts
  const [integerPart, decimalPart] = formattedNumber.split('.');
  
  // Add commas to integer part
  const formattedInteger = parseInt(integerPart).toLocaleString();
  
  // Return with decimal part if it exists
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

export const formatAddress = (address: string): string => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const removeNegativeFromInput = (value: string): string => {
  return value.replace(/-/g, "");
};
