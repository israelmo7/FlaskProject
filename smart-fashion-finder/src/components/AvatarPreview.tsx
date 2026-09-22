import { Pressable, Text, View } from 'react-native';
import type { BodyType, GarmentAnalysis } from '@/types';

const BODY_TYPES: { id: BodyType; label: string; width: number }[] = [
  { id: 'slim', label: 'Slim', width: 56 },
  { id: 'regular', label: 'Regular', width: 68 },
  { id: 'athletic', label: 'Athletic', width: 74 },
  { id: 'plus', label: 'Plus', width: 88 },
];

type Props = {
  bodyType: BodyType;
  onBodyTypeChange: (type: BodyType) => void;
  garment?: GarmentAnalysis | null;
};

export function AvatarPreview({ bodyType, onBodyTypeChange, garment }: Props) {
  const selected = BODY_TYPES.find((b) => b.id === bodyType) ?? BODY_TYPES[1];
  const garmentColor = garmentColorHex(garment?.color);

  return (
    <View>
      <Text className="mb-3 font-bodyMedium text-xs uppercase tracking-widest text-ink-muted">
        Body type
      </Text>
      <View className="mb-6 flex-row flex-wrap">
        {BODY_TYPES.map((type) => {
          const active = type.id === bodyType;
          return (
            <Pressable
              key={type.id}
              onPress={() => onBodyTypeChange(type.id)}
              className={`mr-2 mb-2 rounded-md px-3 py-2 ${
                active ? 'bg-teal' : 'bg-stone-dark'
              }`}
            >
              <Text
                className={`font-bodyMedium text-sm ${
                  active ? 'text-stone-light' : 'text-ink-soft'
                }`}
              >
                {type.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="items-center rounded-2xl bg-ink px-6 py-10">
        <View className="items-center">
          {/* Head */}
          <View className="mb-2 h-14 w-14 rounded-full bg-stone-dark" />
          {/* Torso */}
          <View
            className="mb-1 rounded-t-2xl bg-stone"
            style={{ width: selected.width, height: 90 }}
          />
          {/* Garment overlay area (pants / lower or shirt band) */}
          <View
            className="items-center justify-center rounded-b-xl"
            style={{
              width: selected.width + (garment?.category === 'Outerwear' ? 12 : 0),
              height: garment?.category === 'Shirts' || garment?.category === 'Outerwear' ? 70 : 110,
              backgroundColor: garment ? garmentColor : '#2A313C',
              marginTop: garment?.category === 'Shirts' || garment?.category === 'Outerwear' ? -70 : 0,
            }}
          >
            {garment ? (
              <Text className="px-2 text-center font-bodyMedium text-[10px] text-white/90">
                {garment.subcategory}
              </Text>
            ) : (
              <Text className="font-body text-xs text-ink-muted">No garment</Text>
            )}
          </View>
          {/* Legs base when shirt/outerwear */}
          {(garment?.category === 'Shirts' || garment?.category === 'Outerwear' || !garment) && (
            <View
              className="mt-1 flex-row justify-between"
              style={{ width: selected.width - 8 }}
            >
              <View className="h-24 w-5 rounded-b-md bg-ink-soft" />
              <View className="h-24 w-5 rounded-b-md bg-ink-soft" />
            </View>
          )}
        </View>
        <Text className="mt-6 font-display text-xl text-stone-light">
          {garment ? 'Try-on preview' : 'Select a garment to preview'}
        </Text>
        {garment && (
          <Text className="mt-1 text-center font-body text-sm text-stone-dark">
            {garment.color} {garment.subcategory} on {selected.label.toLowerCase()} frame
          </Text>
        )}
      </View>
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
