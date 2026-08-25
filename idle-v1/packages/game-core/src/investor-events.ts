import { appendTrace } from "./state";
import type { GameState, TransitionResult } from "./types";

export interface InvestorEventTerms {
  giftAmount: number;
  id: string;
  trigger: {
    researchAtLeast: number;
  };
}

export type InvestorResponse = "yes" | "no";

export function respondToInvestor(
  state: GameState,
  event: InvestorEventTerms,
  response: InvestorResponse,
): TransitionResult {
  const dismissedInvestorIds = state.dismissedInvestorIds ?? [];
  if (state.acceptedInvestorIds.includes(event.id) || dismissedInvestorIds.includes(event.id)) {
    return { state, accepted: false, reason: "Investor event already resolved" };
  }
  if (state.research < event.trigger.researchAtLeast) {
    return { state, accepted: false, reason: "Investor event is still locked" };
  }

  const accepted = response === "yes";
  return {
    accepted: true,
    state: appendTrace(
      {
        ...state,
        cash: state.cash + (accepted ? event.giftAmount : 0),
        acceptedInvestorIds: accepted
          ? [...state.acceptedInvestorIds, event.id]
          : state.acceptedInvestorIds,
        dismissedInvestorIds: accepted
          ? dismissedInvestorIds
          : [...dismissedInvestorIds, event.id],
      },
      "economy",
      accepted ? "Accepted investor gift" : "Declined investor gift",
      { giftAmount: event.giftAmount, investorId: event.id, response },
    ),
  };
}
