import { NftAttribute } from "./NftAttribute";
import { getNftRarity } from "./getNftRarity";

export const getNftAttributes = (nftId: string): NftAttribute[] => {
  return [
    {
      trait_type: "Class",
      value: "Plant"
    },
    {
      trait_type: "Rarity",
      value: getNftRarity(nftId)
    },
    {
      trait_type: "Body",
      value: "Plant"
    },
    {
      trait_type: "Headpiece",
      value: "Leafy"
    },
    {
      trait_type: "Eyebrows",
      value: "Brown"
    },
    {
      trait_type: "Color",
      value: "Brown"
    },
    {
      trait_type: "Freckles",
      value: "Green"
    },
    {
      trait_type: "Level",
      value: +nftId
    },
    {
      trait_type: "Combat Class",
      value: "Ranged"
    },
    {
      trait_type: "Attack",
      value: "Spell Cast"
    },
    {
      trait_type: "Biome",
      value: "Forest"
    }
  ]; 
};