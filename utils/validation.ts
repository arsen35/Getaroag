export const validateTC = (value: string): boolean => {
  value = value.toString();
  const isEleven = /^[0-9]{11}$/.test(value);
  const totalX =
    parseInt(value.substr(0, 1)) +
    parseInt(value.substr(1, 1)) +
    parseInt(value.substr(2, 1)) +
    parseInt(value.substr(3, 1)) +
    parseInt(value.substr(4, 1)) +
    parseInt(value.substr(5, 1)) +
    parseInt(value.substr(6, 1)) +
    parseInt(value.substr(7, 1)) +
    parseInt(value.substr(8, 1)) +
    parseInt(value.substr(9, 1));
  
  const isTen = totalX % 10;
  const isElevenVal = parseInt(value.substr(10, 1)); // 11th digit
  
  // Basic Algorithm Logic (Simplified for frontend check)
  // 1. 11 characters
  // 2. First char cannot be 0
  if (!isEleven || value[0] === '0') return false;
  
  // Algorithmic Check
  let odd = 0;
  let even = 0;
  
  for (let i = 0; i < 9; i++) {
    if (i % 2 === 0) {
      odd += parseInt(value[i]);
    } else {
      even += parseInt(value[i]);
    }
  }
  
  const digit10 = (odd * 7 - even) % 10;
  const digit11 = (odd + even + digit10) % 10;

  if (digit10 !== parseInt(value[9])) return false;
  if (digit11 !== parseInt(value[10])) return false;

  return true;
};

export const formatIBAN = (value: string): string => {
  // Simple TR IBAN format masking
  let v = value.replace(/\s+/g, '').replace(/[^0-9a-zA-Z]/gi, '').toUpperCase();
  if(!v.startsWith('TR')) v = 'TR' + v.replace('TR', '');
  // Add spaces every 4 chars
  const parts = [];
  for (let i = 0; i < v.length; i += 4) {
    parts.push(v.substring(i, i + 4));
  }
  return parts.join(' ').substr(0, 32); // Max length for TR IBAN with spaces
};