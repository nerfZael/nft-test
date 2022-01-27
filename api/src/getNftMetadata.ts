import { createCanvas } from "canvas"; 
import { renderIcon } from "./blockies"; 
import { getNftName } from "./getNftName"; 
import { getNftAttributes } from "./getNftAttributes"; 
import { getNftBackgroundColor } from "./getNftBackgroundColor";
import { getNftColor } from "./getNftColor";

export const getNftMetadata = (nftId: string) => {

  const canvas = createCanvas(50, 50);

  var icon = renderIcon(
    {
      seed: nftId,
      color: getNftColor(nftId), 
      bgcolor: getNftBackgroundColor(nftId),
      size: 15, // width/height of the icon in blocks, default: 10
      scale: 25 // width/height of each block in pixels, default: 5
    },
    canvas
  );

  console.log(getNftColor(nftId));

  return {
    description: "A test NFT.", 
    external_url: "", 
    image_data: icon.toDataURL(),
    name: getNftName(nftId),
    attributes: getNftAttributes(nftId), 
  };
};