
// In a real application, this would fetch from a currency API.
// For this example, we'll use a static exchange rate.
const EUR_TO_VND_RATE = 27000;

export const getExchangeRate = async (
  base: 'EUR',
  target: 'VND'
): Promise<number> => {
  console.log(`Fetching exchange rate for ${base} to ${target}`);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return EUR_TO_VND_RATE;
};
