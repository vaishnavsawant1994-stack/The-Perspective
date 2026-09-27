import type { R6DealStageClass } from "./types";

export const R6_DEAL_MAIN_PATH = [
  "QUALIFIED",
  "INTERESTED",
  "DISCOVERY_SCHEDULED",
  "DISCOVERY_COMPLETED",
  "PROPOSAL_PREPARATION",
] as const satisfies readonly R6DealStageClass[];

const EXIT = new Set<R6DealStageClass>([
  "LOST",
  "ON_HOLD",
  "FOLLOW_UP_LATER",
  "DISQUALIFIED",
]);

const TERMINAL = new Set<R6DealStageClass>(["LOST", "DISQUALIFIED"]);

export function isR6DealStageClass(value: string): value is R6DealStageClass {
  return (
    (R6_DEAL_MAIN_PATH as readonly string[]).includes(value) ||
    EXIT.has(value as R6DealStageClass)
  );
}

export function isR6MainStage(value: R6DealStageClass) {
  return (R6_DEAL_MAIN_PATH as readonly R6DealStageClass[]).includes(value);
}

export function isR6TerminalDealStage(value: R6DealStageClass) {
  return TERMINAL.has(value);
}

export function requiresDealMoveReason(
  from: R6DealStageClass,
  to: R6DealStageClass,
) {
  if (EXIT.has(to)) return true;
  if (EXIT.has(from)) return true;

  const fromIndex = R6_DEAL_MAIN_PATH.indexOf(
    from as (typeof R6_DEAL_MAIN_PATH)[number],
  );
  const toIndex = R6_DEAL_MAIN_PATH.indexOf(
    to as (typeof R6_DEAL_MAIN_PATH)[number],
  );
  return fromIndex >= 0 && toIndex >= 0 && toIndex < fromIndex;
}

export function canMoveDeal(
  from: R6DealStageClass,
  to: R6DealStageClass,
) {
  if (from === to) return false;
  if (TERMINAL.has(from)) return false;

  if (EXIT.has(to)) {
    return isR6MainStage(from);
  }

  if (from === "ON_HOLD" || from === "FOLLOW_UP_LATER") {
    return isR6MainStage(to);
  }

  if (!isR6MainStage(from) || !isR6MainStage(to)) return false;

  const fromIndex = R6_DEAL_MAIN_PATH.indexOf(
    from as (typeof R6_DEAL_MAIN_PATH)[number],
  );
  const toIndex = R6_DEAL_MAIN_PATH.indexOf(
    to as (typeof R6_DEAL_MAIN_PATH)[number],
  );

  return Math.abs(toIndex - fromIndex) === 1;
}

export function isR6ClientConversionStage(stage: R6DealStageClass) {
  return stage === "PROPOSAL_PREPARATION";
}
