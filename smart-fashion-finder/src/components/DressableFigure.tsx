import { Pressable, Text, View } from 'react-native';
import {
  buildWidthScale,
  garmentColorHex,
  heightScale,
  isFemalePersona,
} from '@/constants/avatar';
import type { AvatarProfile, OutfitLayers, OutfitPiece } from '@/types';

type Props = {
  profile: AvatarProfile;
  layers: OutfitLayers;
  onRemovePiece?: (piece: OutfitPiece) => void;
};

/**
 * בובה מורכבת משכבות:
 * בסיס בתחתונים בלבד → עליהם נערמים הפריטים שנבחרו.
 */
export function DressableFigure({ profile, layers, onRemovePiece }: Props) {
  const female = isFemalePersona(profile.persona);
  const wScale = buildWidthScale(profile.build);
  const hScale = heightScale(profile.heightCm, profile.persona);
  const baseW = 88 * wScale;
  const childish =
    profile.persona === 'boy' ||
    profile.persona === 'girl' ||
    profile.persona === 'teenBoy' ||
    profile.persona === 'teenGirl';

  const head = childish ? 44 : 52;
  const torsoH = 86 * hScale;
  const legH = 112 * hScale;
  const skin = '#E8C4A8';
  const underwear = female ? '#F2D6DE' : '#2C3340';

  const worn = [layers.dress, layers.top, layers.bottom, layers.outer, layers.shoes].filter(
    Boolean,
  ) as OutfitPiece[];

  return (
    <View className="items-center rounded-2xl bg-[#1A222C] px-4 py-8">
      <Text className="mb-4 font-display text-lg text-stone-light">
        {profile.heightCm} ס״מ
      </Text>

      <View className="items-center" style={{ transform: [{ scale: Math.min(1.05, 0.9 + hScale * 0.1) }] }}>
        {/* ראש */}
        <View
          style={{
            width: head,
            height: head,
            borderRadius: head / 2,
            backgroundColor: skin,
            marginBottom: 4,
          }}
        />
        {/* צוואר */}
        <View style={{ width: 14, height: 10, backgroundColor: skin, marginBottom: 0 }} />

        {/* גוף — שכבות */}
        <View style={{ width: baseW + 24, alignItems: 'center' }}>
          {/* טורסו בעור */}
          <View
            style={{
              width: baseW,
              height: torsoH,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              backgroundColor: skin,
            }}
          />

          {/* חזייה / חזה לגברים — תחתונים עליונים */}
          {female ? (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: torsoH * 0.22,
                width: baseW * 0.92,
                height: torsoH * 0.28,
                borderRadius: 10,
                backgroundColor: underwear,
                opacity: layers.dress || layers.top || layers.outer ? 0 : 1,
              }}
            />
          ) : null}

          {/* חולצה */}
          {layers.top && !layers.dress ? (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                width: baseW + 8,
                height: torsoH * 0.92,
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                backgroundColor: garmentColorHex(layers.top.color),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text className="px-1 text-center font-bodyMedium text-[9px] text-white">
                {layers.top.label} · {layers.top.size}
              </Text>
            </View>
          ) : null}

          {/* שמלה */}
          {layers.dress ? (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                width: baseW + 10,
                height: torsoH + legH * 0.55,
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
                backgroundColor: garmentColorHex(layers.dress.color),
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
              }}
            >
              <Text className="px-1 text-center font-bodyMedium text-[9px] text-white">
                {layers.dress.label} · {layers.dress.size}
              </Text>
            </View>
          ) : null}

          {/* עליונית מעל החולצה */}
          {layers.outer ? (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: -4,
                width: baseW + 18,
                height: torsoH * 0.95,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                backgroundColor: garmentColorHex(layers.outer.color),
                opacity: 0.92,
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingBottom: 8,
                zIndex: 3,
              }}
            >
              <Text className="px-1 text-center font-bodyMedium text-[9px] text-white">
                {layers.outer.label} · {layers.outer.size}
              </Text>
            </View>
          ) : null}

          {/* רגליים + תחתון */}
          {!layers.dress ? (
            <View className="flex-row justify-between" style={{ width: baseW - 8 }}>
              {[0, 1].map((i) => (
                <View key={i} style={{ alignItems: 'center' }}>
                  <View
                    style={{
                      width: 22 * wScale,
                      height: legH,
                      borderBottomLeftRadius: 8,
                      borderBottomRightRadius: 8,
                      backgroundColor: skin,
                    }}
                  />
                </View>
              ))}
              {/* תחתון בסיס */}
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: legH * 0.22,
                  backgroundColor: underwear,
                  borderRadius: 6,
                  opacity: layers.bottom ? 0 : 1,
                }}
              />
              {/* מכנסיים */}
              {layers.bottom ? (
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    top: -4,
                    left: -6,
                    right: -6,
                    height: legH * 0.92,
                    backgroundColor: garmentColorHex(layers.bottom.color),
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                  }}
                >
                  <Text className="px-1 text-center font-bodyMedium text-[9px] text-white">
                    {layers.bottom.label} · {layers.bottom.size}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={{ height: legH * 0.35 }} />
          )}

          {/* נעליים */}
          {layers.shoes ? (
            <View className="mt-1 flex-row justify-between" style={{ width: baseW - 4 }}>
              {[0, 1].map((i) => (
                <View
                  key={i}
                  style={{
                    width: 28 * wScale,
                    height: 14,
                    borderRadius: 6,
                    backgroundColor: garmentColorHex(layers.shoes!.color),
                  }}
                />
              ))}
            </View>
          ) : (
            <View className="mt-1 flex-row justify-between" style={{ width: baseW - 4 }}>
              {[0, 1].map((i) => (
                <View
                  key={i}
                  style={{
                    width: 24 * wScale,
                    height: 10,
                    borderRadius: 4,
                    backgroundColor: skin,
                    opacity: 0.7,
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </View>

      <Text className="mt-5 text-center font-body text-xs text-stone-dark">
        {worn.length === 0
          ? female
            ? 'בסיס: חזייה ותחתון'
            : 'בסיס: תחתון בלבד'
          : 'פריטים על הבובה'}
      </Text>

      {worn.length > 0 ? (
        <View className="mt-3 w-full flex-row flex-wrap justify-center">
          {worn.map((piece) => (
            <Pressable
              key={piece.id}
              onPress={() => onRemovePiece?.(piece)}
              className="mb-2 ml-2 rounded-full bg-white/10 px-3 py-1.5"
            >
              <Text className="font-bodyMedium text-xs text-stone-light">
                {piece.label} · {piece.size} ✕
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
