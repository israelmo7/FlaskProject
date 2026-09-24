import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { bodyLabel, he } from '@/i18n/he';
import type { BodyType, GarmentAnalysis } from '@/types';

const BODY_TYPES: { id: BodyType; width: number }[] = [
  { id: 'slim', width: 72 },
  { id: 'regular', width: 88 },
  { id: 'athletic', width: 96 },
  { id: 'plus', width: 112 },
];

type Props = {
  bodyType: BodyType;
  onBodyTypeChange: (type: BodyType) => void;
  garment?: GarmentAnalysis | null;
  /** מצב קומפקטי למסך הבית */
  hero?: boolean;
};

export function AvatarPreview({
  bodyType,
  onBodyTypeChange,
  garment,
  hero = false,
}: Props) {
  const selected = BODY_TYPES.find((b) => b.id === bodyType) ?? BODY_TYPES[1];
  const garmentColor = garmentColorHex(garment?.color);
  const isTop =
    garment?.category === 'Shirts' || garment?.category === 'Outerwear';

  return (
    <View>
      {!hero && (
        <>
          <Text className="mb-3 text-right font-bodyMedium text-xs text-ink-muted">
            {he.bodyType}
          </Text>
          <View className="mb-6 flex-row flex-wrap justify-end">
            {BODY_TYPES.map((type) => {
              const active = type.id === bodyType;
              return (
                <Pressable
                  key={type.id}
                  onPress={() => onBodyTypeChange(type.id)}
                  className={`mb-2 ml-2 rounded-md px-3 py-2 ${
                    active ? 'bg-teal' : 'bg-stone-dark'
                  }`}
                >
                  <Text
                    className={`font-bodyMedium text-sm ${
                      active ? 'text-stone-light' : 'text-ink-soft'
                    }`}
                  >
                    {bodyLabel[type.id]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      <LinearGradient
        colors={['#1A222C', '#154A45', '#1F6B63']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{
          borderRadius: 24,
          paddingHorizontal: 24,
          paddingTop: hero ? 28 : 40,
          paddingBottom: hero ? 24 : 40,
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* soft atmosphere glow */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -40,
            width: 220,
            height: 220,
            borderRadius: 110,
            backgroundColor: 'rgba(250,247,242,0.08)',
          }}
        />

        <Text className="mb-4 font-displayBold text-2xl text-stone-light">
          {he.homeBrandHint}
        </Text>

        <View className="items-center">
          {/* Head */}
          <View
            className="mb-2 rounded-full bg-stone-dark"
            style={{ width: hero ? 56 : 48, height: hero ? 56 : 48 }}
          />
          {/* Neck */}
          <View className="mb-0.5 h-3 w-4 rounded-sm bg-stone-dark/80" />

          {/* Torso base */}
          <View
            className="rounded-t-3xl bg-stone"
            style={{
              width: selected.width,
              height: hero ? 100 : 90,
            }}
          />

          {/* Garment layer */}
          <View
            className="items-center justify-center"
            style={{
              width: selected.width + (garment?.category === 'Outerwear' ? 16 : 4),
              height: isTop ? (hero ? 88 : 70) : hero ? 130 : 110,
              marginTop: isTop ? (hero ? -88 : -70) : 0,
              borderRadius: isTop ? 18 : 14,
              backgroundColor: garment ? garmentColor : '#2A313C',
              borderWidth: garment ? 0 : 1,
              borderColor: 'rgba(228,221,210,0.25)',
              borderStyle: 'dashed',
            }}
          >
            {garment ? (
              <Text className="px-2 text-center font-bodyMedium text-[11px] text-white">
                {garment.subcategory}
              </Text>
            ) : (
              <Text className="px-3 text-center font-body text-xs text-stone-dark">
                {he.dressHint}
              </Text>
            )}
          </View>

          {/* Legs when top garment or empty */}
          {(isTop || !garment) && (
            <View
              className="mt-1 flex-row justify-between"
              style={{ width: selected.width - 12 }}
            >
              <View
                className="rounded-b-lg bg-ink-soft"
                style={{ width: 18, height: hero ? 110 : 96 }}
              />
              <View
                className="rounded-b-lg bg-ink-soft"
                style={{ width: 18, height: hero ? 110 : 96 }}
              />
            </View>
          )}
        </View>

        {hero && (
          <View className="mt-5 flex-row flex-wrap justify-center">
            {BODY_TYPES.map((type) => {
              const active = type.id === bodyType;
              return (
                <Pressable
                  key={type.id}
                  onPress={() => onBodyTypeChange(type.id)}
                  className={`mx-1 mb-1 rounded-md px-3 py-1.5 ${
                    active ? 'bg-stone-light' : 'bg-white/10'
                  }`}
                >
                  <Text
                    className={`font-bodyMedium text-xs ${
                      active ? 'text-ink' : 'text-stone-light'
                    }`}
                  >
                    {bodyLabel[type.id]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {garment && (
          <Text className="mt-3 text-center font-body text-sm text-stone-dark">
            {garment.color} · {bodyLabel[bodyType]}
          </Text>
        )}
      </LinearGradient>
    </View>
  );
}

function garmentColorHex(color?: string): string {
  if (!color) return '#1F6B63';
  const key = color.toLowerCase();
  if (key.includes('olive')) return '#556B2F';
  if (key.includes('indigo')) return '#3B4F7A';
  if (key.includes('white')) return '#EDE8DF';
  if (key.includes('navy')) return '#1E3A5F';
  if (key.includes('camel')) return '#A67C52';
  if (key.includes('charcoal') || key.includes('black')) return '#2A2A2A';
  if (key.includes('cream')) return '#D9CDB8';
  if (key.includes('terracotta')) return '#C2664A';
  if (key.includes('light wash')) return '#7A9BB8';
  return '#1F6B63';
}
