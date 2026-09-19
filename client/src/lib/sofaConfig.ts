export const SOFA_SEAT_KEYS = [
  '1 seats',
  '2 seats',
  '3 seats',
  '2(1+1)',
  '5(3+1+1)',
  '5(3+2)',
  '6(3+2+1)',
  '7(3+2+1+1)',
] as const;

export type SofaSeatKey = (typeof SOFA_SEAT_KEYS)[number];

export interface SofaSeatOption {
  key: SofaSeatKey;
  label: string;
  badge: string;
  seats: number;
}

export const SOFA_SEAT_MULTIPLIERS: Record<string, number> = {
  '1 seats': 1,
  '2 seats': 2,
  '3 seats': 3,
  '2(1+1)': 2,
  '5(3+1+1)': 5,
  '5(3+2)': 5,
  '6(3+2+1)': 6,
  '7(3+2+1+1)': 7,
};

export const SOFA_SEAT_OPTIONS: SofaSeatOption[] = [
  { key: '1 seats', label: '1 seats', badge: '1 Seat', seats: 1 },
  { key: '2 seats', label: '2 seats', badge: '2 Seats', seats: 2 },
  { key: '3 seats', label: '3 seats', badge: '3 Seats', seats: 3 },
  { key: '2(1+1)', label: '2(1+1)', badge: '2 Seats (1+1)', seats: 2 },
  { key: '5(3+1+1)', label: '5(3+1+1)', badge: '5 Seats (3+1+1)', seats: 5 },
  { key: '5(3+2)', label: '5(3+2)', badge: '5 Seats (3+2)', seats: 5 },
  { key: '6(3+2+1)', label: '6(3+2+1)', badge: '6 Seats (3+2+1)', seats: 6 },
  { key: '7(3+2+1+1)', label: '7(3+2+1+1)', badge: '7 Seats (3+2+1+1)', seats: 7 },
];

export const getSeatMultiplier = (key: string): number => {
  return SOFA_SEAT_MULTIPLIERS[key] || 1;
};

export const calculateSeatPrices = (basePrice: number): Record<string, number> => {
  const result: Record<string, number> = {};
  const base = Number(basePrice) || 0;
  SOFA_SEAT_OPTIONS.forEach((opt) => {
    result[opt.key] = base * opt.seats;
  });
  return result;
};

export const calculateSeatPricesString = (basePrice: number | string): Record<string, string> => {
  const result: Record<string, string> = {
    '1 seats': '',
    '2 seats': '',
    '3 seats': '',
    '2(1+1)': '',
    '5(3+1+1)': '',
    '5(3+2)': '',
    '6(3+2+1)': '',
    '7(3+2+1+1)': '',
  };
  const base = Number(basePrice) || 0;
  if (base > 0) {
    SOFA_SEAT_OPTIONS.forEach((opt) => {
      result[opt.key] = String(base * opt.seats);
    });
  }
  return result;
};

export const isSofaProduct = (
  name?: string,
  category?: string,
  tags?: string[] | string,
  seatPricing?: Record<string, number>,
): boolean => {
  if (seatPricing && Object.keys(seatPricing).length > 0) return true;
  const combined = [
    name || '',
    category || '',
    Array.isArray(tags) ? tags.join(' ') : tags || '',
  ]
    .join(' ')
    .toLowerCase();
  return combined.includes('sofa');
};

