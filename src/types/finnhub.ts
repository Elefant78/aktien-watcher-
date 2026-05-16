export interface Quote {
  /** Current price */
  c: number;
  /** Change */
  d: number | null;
  /** Percent change */
  dp: number | null;
  /** High price of the day */
  h: number;
  /** Low price of the day */
  l: number;
  /** Open price of the day */
  o: number;
  /** Previous close price */
  pc: number;
  /** Server timestamp (seconds) */
  t: number;
}

export interface CompanyProfile {
  country?: string;
  currency?: string;
  exchange?: string;
  finnhubIndustry?: string;
  ipo?: string;
  logo?: string;
  marketCapitalization?: number;
  name?: string;
  phone?: string;
  shareOutstanding?: number;
  ticker?: string;
  weburl?: string;
}

export interface SymbolSearchResult {
  count: number;
  result: Array<{
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
  }>;
}

export interface CandleData {
  /** Close prices */
  c: number[];
  /** High prices */
  h: number[];
  /** Low prices */
  l: number[];
  /** Open prices */
  o: number[];
  /** Status: 'ok' or 'no_data' */
  s: 'ok' | 'no_data';
  /** Timestamps (seconds) */
  t: number[];
  /** Volumes */
  v: number[];
}

export interface ChartPoint {
  time: number;
  price: number;
  date: string;
}
