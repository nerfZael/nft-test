import { NftRarity } from "./NftRarity";
const randomColor = require("randomcolor");

export const getNftBackgroundColor = (nftId: string): NftRarity => {
  return randomColor({
    seed: +nftId
  });
};