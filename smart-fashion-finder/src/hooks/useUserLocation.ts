import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import inventoryData from '@/data/inventory.json';
import type { Coordinates } from '@/utils/distance';

const FALLBACK: Coordinates = {
  latitude: inventoryData.userDefaultLocation.latitude,
  longitude: inventoryData.userDefaultLocation.longitude,
};

export function useUserLocation() {
  const [coords, setCoords] = useState<Coordinates>(FALLBACK);
  const [label, setLabel] = useState(inventoryData.userDefaultLocation.label);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) {
            setPermissionDenied(true);
            setLoading(false);
          }
          return;
        }
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLabel('Current location');
          setPermissionDenied(false);
        }
      } catch {
        if (!cancelled) {
          setPermissionDenied(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { coords, label, permissionDenied, loading };
}
