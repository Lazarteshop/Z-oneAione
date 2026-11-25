export const TIERS = [
  {
    id: "starter" as const,
    title: "Starter AI Video",
    pricePhp: 150,
    tokensPerView: 2,
    blurb: "A dusk alley loop. The cheapest seat, two tokens a valid view.",
  },
  {
    id: "pro" as const,
    title: "Pro AI Video",
    pricePhp: 300,
    tokensPerView: 4,
    blurb: "A harbor signal film. Four tokens every time a view counts.",
  },
  {
    id: "vip" as const,
    title: "VIP AI Video",
    pricePhp: 500,
    tokensPerView: 5,
    blurb: "A goldroom afterimage. The highest rate on the feed.",
  },
];

export type TierId = (typeof TIERS)[number]["id"];

/** 10 AI Tokens = ₱1. */
export const TOKEN_PER_PESO = 10;
export const MIN_WITHDRAW_TOKENS = 1000;
export const FILM_SECONDS = 16;
export const COUNT_SECONDS = 5;

export const PLATFORM = {
  name: "AI Video Shop",
  gcash: "09170000148",
  gcashDisplay: "0917 000 0148",
  qrPayload: "GCASH|AI-VIDEO-SHOP|DEMO|09170000148",
  /** Flip only after this QR is replaced with a real merchant code. */
  livePayments: false,
};
