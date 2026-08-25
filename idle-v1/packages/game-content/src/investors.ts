export interface InvestorEventContent {
  dialogue: string;
  giftAmount: number;
  id: string;
  name: string;
  portraitKey?: string;
  role: string;
  trigger: {
    researchAtLeast: number;
  };
}

export const openingInvestorEvents: readonly InvestorEventContent[] = [
  {
    id: "garry-tan",
    dialogue: "You’re early, underfunded, and talking about AGI with a straight face. I like it.",
    giftAmount: 1_500_000,
    name: "Garry Tan",
    portraitKey: "garry-tan",
    role: "Y Combinator partner",
    trigger: { researchAtLeast: 10 },
  },
] as const;
