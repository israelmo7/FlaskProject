import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import type { GarmentAnalysis, GarmentCategory, GenderFilter } from '@/types';

const MOCK_RESULTS: Omit<GarmentAnalysis, 'id' | 'imageUri' | 'source'>[] = [
  {
    category: 'Pants',
    subcategory: 'Cargo Pants',
    color: 'Olive Green',
    pattern: 'Solid',
    fit: 'Relaxed Utility',
    gender: 'Unisex',
    estimatedPriceMin: 150,
    estimatedPriceMax: 300,
    confidence: 0.92,
    boundingBoxes: [
      { x: 0.22, y: 0.28, width: 0.56, height: 0.62, label: 'Cargo Pants' },
    ],
  },
  {
    category: 'Shirts',
    subcategory: 'Oxford Shirt',
    color: 'White',
    pattern: 'Solid',
    fit: 'Classic Regular',
    gender: 'Unisex',
    estimatedPriceMin: 90,
    estimatedPriceMax: 180,
    confidence: 0.88,
    boundingBoxes: [
      { x: 0.18, y: 0.12, width: 0.64, height: 0.55, label: 'Oxford Shirt' },
    ],
  },
  {
    category: 'Outerwear',
    subcategory: 'Denim Jacket',
    color: 'Light Wash',
    pattern: 'Solid',
    fit: 'Oversized',
    gender: 'Unisex',
    estimatedPriceMin: 220,
    estimatedPriceMax: 400,
    confidence: 0.85,
    boundingBoxes: [
      { x: 0.15, y: 0.1, width: 0.7, height: 0.6, label: 'Denim Jacket' },
    ],
  },
];

function pickMockByHint(
  hint?: Partial<{ category: GarmentCategory; color: string; gender: GenderFilter }>,
) {
  if (hint?.category) {
    const match = MOCK_RESULTS.find((r) => r.category === hint.category);
    if (match) {
      return {
        ...match,
        color: hint.color ?? match.color,
        gender: hint.gender ?? match.gender,
      };
    }
  }
  return MOCK_RESULTS[0];
}

/**
 * Mock garment recognition — swap `analyzeImage` body with
 * Google Cloud Vision / OpenAI Vision when API keys are available.
 */
export function useGarmentRecognition() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = useCallback(
    async (
      imageUri: string,
      source: GarmentAnalysis['source'],
      hint?: Partial<{ category: GarmentCategory; color: string; gender: GenderFilter }>,
    ): Promise<GarmentAnalysis> => {
      setIsAnalyzing(true);
      setError(null);
      try {
        // Simulate Vision API latency
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const base = pickMockByHint(hint);
        return {
          ...base,
          id: `analysis-${Date.now()}`,
          imageUri,
          source,
        };
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Recognition failed';
        setError(message);
        throw e;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [],
  );

  const pickFromLibrary = useCallback(async (): Promise<string | null> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo library permission is required.');
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (result.canceled || !result.assets[0]) return null;
    return result.assets[0].uri;
  }, []);

  const snapWithCamera = useCallback(async (): Promise<string | null> => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('Camera permission is required.');
      return null;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (result.canceled || !result.assets[0]) return null;
    return result.assets[0].uri;
  }, []);

  return {
    isAnalyzing,
    error,
    analyzeImage,
    pickFromLibrary,
    snapWithCamera,
  };
}
