import payment from "@/assets/report-payment-neutral.webp";
import usage from "@/assets/report-usage-neutral.webp";
import mix from "@/assets/report-mix-neutral.webp";
import enquiries from "@/assets/report-enquiries-neutral.webp";
import age from "@/assets/report-age-neutral.webp";
import card from "@/assets/account-art/account-credit-card.webp.asset.json";
import personal from "@/assets/account-art/account-personal.webp.asset.json";
import vehicle from "@/assets/account-art/account-vehicle.webp.asset.json";
import home from "@/assets/account-art/account-home.webp.asset.json";
import gold from "@/assets/account-art/gold.webp.asset.json";
import other from "@/assets/account-art/other.webp.asset.json";

export const factorIllustrations = { payment, usage, mix, enquiries, age };
export const accountIllustrations = { card: card.url, personal: personal.url, vehicle: vehicle.url, home: home.url, gold: gold.url, other: other.url };
export const reportArtworkUrls = [...Object.values(factorIllustrations), ...Object.values(accountIllustrations)];