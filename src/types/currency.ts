export interface Currency {
  code?: string;
  currency: string;
  id?: string;
  name: string;
  nominal: number;
  nominal_value: number;
  updated: string;
  value: number;
  addition_type?: 'fixed' | 'numeric' | 'percent' | '';
  addition_value?: number;
}

export interface CurrenciesResponse {
  data: [{
    [key: string]: Currency;
  }];
  status: number;
}

export interface CurrencyUpdate {
  currencies: {
    [currencyCode: string]: {
      addition_type?: 'fixed' | 'numeric' | 'percent' | '';
      addition_value?: number;
    };
  };
}
