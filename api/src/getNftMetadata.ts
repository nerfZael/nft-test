import { createCanvas } from "canvas"; 
import { renderIcon } from "./blockies"; 
import { getNftName } from "./getNftName"; 
import { getNftAttributes } from "./getNftAttributes"; 

export const getNftMetadata = (nftId: string) => {

  const canvas = createCanvas(50, 50);

  var icon = renderIcon(
    { // All options are optional
        seed: nftId, // seed used to generate icon data, default: random
        color: '#dfe', // to manually specify the icon color, default: random
        bgcolor: '#aaa', // choose a different background color, default: white
        size: 15, // width/height of the icon in blocks, default: 10
        scale: 25 // width/height of each block in pixels, default: 5
    },
    canvas
  );

  return {
    description: "A test NFT.", 
    external_url: "", 
    image_data: icon.toDataURL(),
    name: getNftName(nftId),
    attributes: getNftAttributes(nftId), 
  };
};