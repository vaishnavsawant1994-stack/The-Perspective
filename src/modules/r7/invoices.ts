import { money, subMoney } from "@/modules/finance/money";
import { invoiceIsMutable, type R7InvoiceState } from "./lifecycle";

export function remainingInvoiceBalance(
  currency: string,
  totalMinor: bigint,
  allocatedMinor: bigint,
) {
  return subMoney(money(currency, totalMinor), money(currency, allocatedMinor));
}

export function applyAllocation(
  state: R7InvoiceState,
  currency: string,
  totalMinor: bigint,
  allocatedMinor: bigint,
  incomingMinor: bigint,
) {
  if (invoiceIsMutable(state)) {
    return { kind: "error" as const, code: "INVOICE_NOT_FINALIZED" };
  }
  if (state === "VOID" || state === "CREDITED" || state === "PAID") {
    return { kind: "error" as const, code: "INVOICE_CLOSED" };
  }
  try {
    const remaining = remainingInvoiceBalance(currency, totalMinor, allocatedMinor);
    const nextAllocated = allocatedMinor + money(currency, incomingMinor).amountMinor;
    if (nextAllocated > totalMinor) {
      return { kind: "error" as const, code: "INSUFFICIENT_FUNDS" };
    }
    const nextState: R7InvoiceState =
      nextAllocated === totalMinor ? "PAID" : "PARTIALLY_PAID";
    return {
      kind: "ok" as const,
      value: {
        allocatedMinor: nextAllocated,
        remainingMinor: remaining.amountMinor - incomingMinor,
        status: nextState,
      },
    };
  } catch (error) {
    return {
      kind: "error" as const,
      code: error instanceof Error ? error.message : "INVALID_MONEY",
    };
  }
}
