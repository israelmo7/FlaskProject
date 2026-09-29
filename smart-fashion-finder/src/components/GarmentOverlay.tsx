import { Image, Text, View } from 'react-native';
import { he } from '@/i18n/he';
import type { BoundingBox, GarmentAnalysis } from '@/types';
import { formatPriceILS } from '@/utils/stock';

type Props = {
  analysis: GarmentAnalysis;
};

function BoxOverlay({ box }: { box: BoundingBox }) {
  return (
    <View
      pointerEvents="none"
      className="absolute border-2 border-coral"
      style={{
        left: `${box.x * 100}%`,
        top: `${box.y * 100}%`,
        width: `${box.width * 100}%`,
        height: `${box.height * 100}%`,
      }}
    >
      <View className="absolute -top-6 left-0 rounded-sm bg-coral px-2 py-0.5">
        <Text className="font-bodyMedium text-xs text-white">{box.label}</Text>
      </View>
    </View>
  );
}

export function GarmentOverlay({ analysis }: Props) {
  return (
    <View>
      <View className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-ink">
        {analysis.imageUri ? (
          <Image
            source={{ uri: analysis.imageUri }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-ink-soft">
            <Text className="font-display text-2xl text-stone-light">
              {analysis.subcategory}
            </Text>
            <Text className="mt-2 font-body text-stone-dark">{analysis.color}</Text>
          </View>
        )}
        {analysis.boundingBoxes.map((box, index) => (
          <BoxOverlay key={`${box.label}-${index}`} box={box} />
        ))}
        <View className="absolute bottom-3 left-3 rounded-md bg-ink/80 px-2 py-1">
          <Text className="font-bodyMedium text-xs text-stone-light">
            {he.confidence} {Math.round(analysis.confidence * 100)}%
          </Text>
        </View>
      </View>

      <View className="mt-5">
        <Text className="text-right font-bodyMedium text-xs text-ink-muted">
          {he.aiBreakdown}
        </Text>
        <Text className="mt-2 text-right font-display text-3xl text-ink">
          {analysis.subcategory}
        </Text>

        <View className="mt-4 gap-3">
          <Row
            label={he.category}
            value={`${analysis.category} · ${analysis.fit}`}
          />
          <Row
            label={he.colorPattern}
            value={`${analysis.color}, ${analysis.pattern}`}
          />
          <Row
            label={he.estimatedPrice}
            value={`${formatPriceILS(analysis.estimatedPriceMin)} – ${formatPriceILS(analysis.estimatedPriceMax)}`}
          />
        </View>
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="border-b border-stone-dark pb-3">
      <Text className="text-right font-body text-xs text-ink-muted">{label}</Text>
      <Text className="mt-1 text-right font-bodyMedium text-base text-ink">
        {value}
      </Text>
    </View>
  );
}
