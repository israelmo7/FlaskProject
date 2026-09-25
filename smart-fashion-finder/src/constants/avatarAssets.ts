import type { ImageSourcePropType } from 'react-native';
import type { AvatarPersona } from '@/types';

export const PERSONA_BASE_IMAGES: Record<AvatarPersona, ImageSourcePropType> = {
  woman: require('../../assets/images/bases/woman.png'),
  man: require('../../assets/images/bases/man.png'),
  teenGirl: require('../../assets/images/bases/teenGirl.png'),
  teenBoy: require('../../assets/images/bases/teenBoy.png'),
  girl: require('../../assets/images/bases/girl.png'),
  boy: require('../../assets/images/bases/boy.png'),
};

/** שכבות בגדים לפי מזהה פריט בארון (לפני סיומת מידה) */
export const GARMENT_LAYER_IMAGES: Record<string, ImageSourcePropType> = {
  'w-black-shirt': require('../../assets/images/layers/black-shirt-v2.png'),
  'w-white-oxford': require('../../assets/images/layers/white-shirt-v2.png'),
  'w-olive-cargo': require('../../assets/images/layers/olive-pants-v2.png'),
  'w-blue-jeans': require('../../assets/images/layers/blue-jeans-v2.png'),
  'w-denim-jacket': require('../../assets/images/layers/denim-jacket-v2.png'),
  'w-hat': require('../../assets/images/layers/hat.png'),
  'w-sneakers': require('../../assets/images/layers/sneakers.png'),
  // product fallbacks — תמונות מוצר ב־contain במקום ריבוע צבע
  'p-tshirt': require('../../assets/images/layers/black-shirt-v2.png'),
  'p-hoodie': require('../../assets/images/product-hoodie.png'),
  'p-oxford': require('../../assets/images/layers/white-shirt-v2.png'),
  'p-turtleneck': require('../../assets/images/product-turtleneck.png'),
  'p-jeans': require('../../assets/images/layers/blue-jeans-v2.png'),
  'p-shorts': require('../../assets/images/product-denim-shorts.png'),
  'p-cargo': require('../../assets/images/layers/olive-pants-v2.png'),
  'p-sport': require('../../assets/images/product-sport-pants.png'),
  'p-denim-jkt': require('../../assets/images/layers/denim-jacket-v2.png'),
  'p-leather': require('../../assets/images/product-leather.png'),
  'p-dress': require('../../assets/images/product-dress.png'),
  'p-sneakers': require('../../assets/images/layers/sneakers.png'),
  'p-hat': require('../../assets/images/layers/hat.png'),
};

export function layerImageForPieceId(pieceId: string): ImageSourcePropType | null {
  // ids: w-black-shirt-L / home-p-hoodie-M / cart-home-p-hat-S-...
  for (const key of Object.keys(GARMENT_LAYER_IMAGES)) {
    if (pieceId.includes(key)) return GARMENT_LAYER_IMAGES[key];
  }
  return null;
}
