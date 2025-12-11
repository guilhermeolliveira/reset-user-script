export function generateValidCPF(): string {
  const nineDigits = Array.from({ length: 9 }, () => 
    Math.floor(Math.random() * 10)
  );

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += nineDigits[i] * (10 - i);
  }
  const firstVerifier = (sum * 10) % 11;
  const firstDigit = firstVerifier === 10 ? 0 : firstVerifier;

  sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += nineDigits[i] * (11 - i);
  }
  sum += firstDigit * 2;
  const secondVerifier = (sum * 10) % 11;
  const secondDigit = secondVerifier === 10 ? 0 : secondVerifier;

  const cpf = [...nineDigits, firstDigit, secondDigit].join('');
  
  return cpf;
}