import { NftRarity } from "./NftRarity";
const randomColor = require('randomcolor');

export const getNftColor = (nftId: string): NftRarity => {
  return randomColor({
    seed: +nftId + 10000
  });
};