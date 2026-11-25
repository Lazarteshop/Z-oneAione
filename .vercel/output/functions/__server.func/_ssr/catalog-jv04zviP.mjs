//#region node_modules/.nitro/vite/services/ssr/assets/catalog-jv04zviP.js
var TIERS = [
	{
		id: "starter",
		title: "Starter AI Video",
		pricePhp: 150,
		tokensPerView: 2,
		blurb: "A dusk alley loop. The cheapest seat, two tokens a valid view."
	},
	{
		id: "pro",
		title: "Pro AI Video",
		pricePhp: 300,
		tokensPerView: 4,
		blurb: "A harbor signal film. Four tokens every time a view counts."
	},
	{
		id: "vip",
		title: "VIP AI Video",
		pricePhp: 500,
		tokensPerView: 5,
		blurb: "A goldroom afterimage. The highest rate on the feed."
	}
];
var MIN_WITHDRAW_TOKENS = 1e3;
var PLATFORM = {
	name: "AI Video Shop",
	gcash: "09170000148",
	gcashDisplay: "0917 000 0148",
	qrPayload: "GCASH|AI-VIDEO-SHOP|DEMO|09170000148",
	/** Flip only after this QR is replaced with a real merchant code. */
	livePayments: false
};
//#endregion
export { PLATFORM as n, TIERS as r, MIN_WITHDRAW_TOKENS as t };
