export interface TNATEAResult {
  tna: number;
  tea: number;
}

export interface YTMInput {
  price: number;
  couponRate: number;
  faceValue: number;
  maturityDate: Date;
  frequency: number;
  valuationDate?: Date;
}

export interface TNATEAInput {
  price: number;
  faceValue: number;
  maturityDate: Date;
  valuationDate?: Date;
}

const DAYS_PER_YEAR = 365;
const MAX_ITERATIONS = 100;
const TOLERANCE = 1e-8;

const getYearsToMaturity = (
  maturityDate: Date,
  valuationDate: Date,
): number => {
  const milliseconds = maturityDate.getTime() - valuationDate.getTime();
  return milliseconds / (1000 * 60 * 60 * 24 * DAYS_PER_YEAR);
};

const calculateBondPresentValue = (
  annualYield: number,
  couponPayment: number,
  faceValue: number,
  periods: number,
  frequency: number,
): number => {
  const periodicRate = annualYield / frequency;

  let presentValue = 0;
  for (let period = 1; period <= periods; period += 1) {
    presentValue += couponPayment / Math.pow(1 + periodicRate, period);
  }

  return presentValue + faceValue / Math.pow(1 + periodicRate, periods);
};

export const calculateYTM = ({
  price,
  couponRate,
  faceValue,
  maturityDate,
  frequency,
  valuationDate = new Date(),
}: YTMInput): number | null => {
  if (price <= 0 || faceValue <= 0 || couponRate < 0 || frequency <= 0) {
    return null;
  }

  const yearsToMaturity = getYearsToMaturity(maturityDate, valuationDate);
  if (yearsToMaturity <= 0) {
    return null;
  }

  const periods = Math.max(1, Math.round(yearsToMaturity * frequency));
  const couponPayment = (faceValue * couponRate) / frequency;

  let low = -0.95;
  let high = 3;

  const f = (yieldRate: number): number =>
    calculateBondPresentValue(
      yieldRate,
      couponPayment,
      faceValue,
      periods,
      frequency,
    ) - price;

  let fLow = f(low);
  let fHigh = f(high);

  let expansionAttempts = 0;
  while (fLow * fHigh > 0 && expansionAttempts < 12) {
    high *= 1.5;
    fHigh = f(high);
    expansionAttempts += 1;
  }

  if (fLow * fHigh > 0) {
    return null;
  }

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration += 1) {
    const mid = (low + high) / 2;
    const fMid = f(mid);

    if (Math.abs(fMid) < TOLERANCE) {
      return mid;
    }

    if (fLow * fMid < 0) {
      high = mid;
      fHigh = fMid;
    } else {
      low = mid;
      fLow = fMid;
    }
  }

  return (low + high) / 2;
};

export const calculateTNATEA = ({
  price,
  faceValue,
  maturityDate,
  valuationDate = new Date(),
}: TNATEAInput): TNATEAResult | null => {
  if (price <= 0 || faceValue <= 0) {
    return null;
  }

  const yearsToMaturity = getYearsToMaturity(maturityDate, valuationDate);
  if (yearsToMaturity <= 0) {
    return null;
  }

  const grossReturn = faceValue / price;
  const tea = Math.pow(grossReturn, 1 / yearsToMaturity) - 1;
  const tna = (grossReturn - 1) / yearsToMaturity;

  return { tna, tea };
};
