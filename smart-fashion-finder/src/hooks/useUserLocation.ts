import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import inventoryData from '@/data/inventory.json';
import { haversineKm, type Coordinates } from '@/utils/distance';

const FALLBACK: Coordinates = {
  latitude: inventoryData.userDefaultLocation.latitude,
  longitude: inventoryData.userDefaultLocation.longitude,
};

/** If the device is far from the demo market, keep using Haifa inventory coords. */
const DEMO_RADIUS_KM = 80;

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
        if (cancelled) return;

        const live: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        const distanceToDemo = haversineKm(live, FALLBACK);

        if (distanceToDemo > DEMO_RADIUS_KM) {
          setCoords(FALLBACK);
          setLabel(`${inventoryData.userDefaultLocation.label} (demo)`);
          setPermissionDenied(false);
        } else {
          setCoords(live);
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
