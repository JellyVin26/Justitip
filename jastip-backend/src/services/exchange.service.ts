// Static mock exchange rates, base currency is USD
const rates: Record<string, number> = {
  USD: 1,
  EUR: 0.9,
  IDR: 15500,
  GBP: 0.8,
  JPY: 150,
  SGD: 1.34,
  KRW: 1380,
  AUD: 1.5,
  THB: 35,
};

export class ExchangeService {
  /**
   * Convert an amount from one currency to another.
   * @param amount The amount to convert
   * @param from The currency code to convert from
   * @param to The currency code to convert to
   * @returns The converted amount
   */
  static convert(amount: number, from: string, to: string): number | null {
    const fromUpper = from?.toUpperCase();
    const toUpper = to?.toUpperCase();
    
    if (!rates[fromUpper] || !rates[toUpper]) {
      return null;
    }

    const fromRate = rates[fromUpper];
    const toRate = rates[toUpper];
    
    const amountInUSD = amount / fromRate;
    return amountInUSD * toRate;
  }
}
