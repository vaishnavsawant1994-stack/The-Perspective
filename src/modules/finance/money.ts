export type Money = {
  currency: string;
  amountMinor: bigint;
};

const CURRENCY = /^[A-Z]{3}$/;

export function money(currency: string, amountMinor: bigint | number): Money {
  if (!CURRENCY.test(currency)) {
    throw new Error("INVALID_CURRENCY");
  }
  const amount = typeof amountMinor === "number" ? BigInt(amountMinor) : amountMinor;
  if (amount < BigInt(0)) {
    throw new Error("NEGATIVE_MONEY");
  }
  return { currency, amountMinor: amount };
}

export function addMoney(left: Money, right: Money): Money {
  if (left.currency !== right.currency) {
    throw new Error("CURRENCY_MISMATCH");
  }
  return { currency: left.currency, amountMinor: left.amountMinor + right.amountMinor };
}

export function subMoney(left: Money, right: Money): Money {
  if (left.currency !== right.currency) {
    throw new Error("CURRENCY_MISMATCH");
  }
  if (left.amountMinor < right.amountMinor) {
    throw new Error("INSUFFICIENT_FUNDS");
  }
  return { currency: left.currency, amountMinor: left.amountMinor - right.amountMinor };
}

export function lineTotal(unitAmountMinor: bigint, quantity: number): bigint {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("INVALID_QUANTITY");
  }
  if (unitAmountMinor < BigInt(0)) {
    throw new Error("NEGATIVE_MONEY");
  }
  return unitAmountMinor * BigInt(quantity);
}
