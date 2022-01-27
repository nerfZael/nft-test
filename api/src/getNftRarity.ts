import { NftRarity } from "./NftRarity";

export const getNftRarity = (nftId: string): NftRarity => {
  const rarity = +nftId;

  if(rarity % 5 === 1) {
    return NftRarity.Mythical;
  } else if(rarity % 3 === 0) {
    return NftRarity.Rare;
  } else {
    return NftRarity.Common;
  }
};