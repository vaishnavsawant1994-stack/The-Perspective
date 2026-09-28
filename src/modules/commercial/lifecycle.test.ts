import { describe, expect, it } from "vitest";

import {
  canMoveDeal,
  isR6ClientConversionStage,
  isR6DealStageClass,
  requiresDealMoveReason,
  isR6LeadToDealConversionState,
} from "./lifecycle";

describe("R6 commercial lifecycle", () => {
  it("allows only the frozen R6 stage vocabulary", () => {
    expect(isR6DealStageClass("QUALIFIED")).toBe(true);
    expect(isR6DealStageClass("PROPOSAL_PREPARATION")).toBe(true);
    expect(isR6DealStageClass("PROPOSAL_SENT")).toBe(false);
    expect(isR6DealStageClass("WON")).toBe(false);
  });

  it("allows adjacent main-path moves but not skips", () => {
    expect(canMoveDeal("QUALIFIED", "INTERESTED")).toBe(true);
    expect(canMoveDeal("INTERESTED", "DISCOVERY_SCHEDULED")).toBe(true);
    expect(canMoveDeal("QUALIFIED", "DISCOVERY_COMPLETED")).toBe(false);
    expect(canMoveDeal("DISCOVERY_COMPLETED", "PROPOSAL_PREPARATION")).toBe(true);
  });

  it("requires reasons for backward, hold and exit moves", () => {
    expect(requiresDealMoveReason("INTERESTED", "QUALIFIED")).toBe(true);
    expect(requiresDealMoveReason("INTERESTED", "ON_HOLD")).toBe(true);
    expect(requiresDealMoveReason("ON_HOLD", "INTERESTED")).toBe(true);
    expect(requiresDealMoveReason("QUALIFIED", "INTERESTED")).toBe(false);
  });

  it("keeps lost and disqualified deals terminal in R6", () => {
    expect(canMoveDeal("LOST", "QUALIFIED")).toBe(false);
    expect(canMoveDeal("DISQUALIFIED", "INTERESTED")).toBe(false);
  });

  it("permits pre-client identity conversion only at the R6 ceiling", () => {
    expect(isR6ClientConversionStage("PROPOSAL_PREPARATION")).toBe(true);
    expect(isR6ClientConversionStage("DISCOVERY_COMPLETED")).toBe(false);
    expect(isR6ClientConversionStage("QUALIFIED")).toBe(false);
  });

  it("keeps lead-to-deal conversion on the frozen QUALIFIED/INTERESTED edge", () => {
    expect(isR6LeadToDealConversionState("QUALIFIED")).toBe(true);
    expect(isR6LeadToDealConversionState("INTERESTED")).toBe(true);
    expect(isR6LeadToDealConversionState("CONTACTED")).toBe(false);
    expect(isR6LeadToDealConversionState("REPLIED")).toBe(false);
    expect(isR6LeadToDealConversionState("CONVERTED")).toBe(false);
  });

});
