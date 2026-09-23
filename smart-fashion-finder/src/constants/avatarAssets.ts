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
  'w-black-shirt': require('../../assets/images/layers/black-shirt.png'),
  'w-white-oxford': require('../../assets/images/layers/white-shirt.png'),
  'w-olive-cargo': require('../../assets/images/layers/olive-pants.png'),
  'w-blue-jeans': require('../../assets/images/layers/blue-jeans.png'),
  'w-denim-jacket': require('../../assets/images/layers/denim-jacket.png'),
};

export function layerImageForPieceId(pieceId: string): ImageSourcePropType | null {
  const baseId = pieceId.replace(/-\d+$/, '').replace(/-(XS|S|M|L|XL|\d{2,3})-\d+$/, '');
  // ids look like: w-black-shirt-L-171...
  for (const key of Object.keys(GARMENT_LAYER_IMAGES)) {
    if (pieceId.startsWith(key)) return GARMENT_LAYER_IMAGES[key];
  }
  return GARMENT_LAYER_IMAGES[baseId] ?? null;
}
