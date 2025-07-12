export const formatNumberWithCommas = (num: number): string => {
  if (isNaN(num) || !isFinite(num)) return "0";
  
  let formattedNumber;
  
  if (num < 0.0001) {
    // Use 10 decimal places for very small numbers
    formattedNumber = num.toFixed(10);
  } else if (num < 1) {
    // Use 8 decimal places for small numbers less than 1
    formattedNumber = num.toFixed(8);
  } else if (num < 1000) {
    // Use 6 decimal places for numbers less than 1000
    formattedNumber = num.toFixed(6);
  } else if (num < 1000000) {
    // Use 3 decimal places for thousands
    formattedNumber = num.toFixed(3);
  } else {
    // Use 2 decimal places for millions and above
    formattedNumber = num.toFixed(2);
  }
  
  // Remove trailing zeros after decimal point
  formattedNumber = parseFloat(formattedNumber).toString();
  
  // Split into integer and decimal parts
  const [integerPart, decimalPart] = formattedNumber.split('.');
  
  // Add commas to integer part using Number constructor to handle large numbers properly
  const formattedInteger = Number(integerPart).toLocaleString();
  
  // Return with decimal part if it exists
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

export const formatAddress = (address: string): string => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const removeNegativeFromInput = (value: string): string => {
  return value.replace(/-/g, "");
};
