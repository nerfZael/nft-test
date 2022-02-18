import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';

export const getNftName = (nftId: string): string => {

  const customConfig: Config = {
    dictionaries: [adjectives, colors, animals],
    separator: " ",
    length: 3,
    seed: +nftId,
    style: "capital"
  };
  
  return uniqueNamesGenerator(customConfig); 
};
