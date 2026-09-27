import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GameFashionAvatar } from '@/components/GameFashionAvatar';
import { PERSONA_OPTIONS, formatHeightMeters } from '@/constants/avatar';
import { he } from '@/i18n/he';
import type { AvatarProfile, OutfitLayers } from '@/types';

type Props = {
  visible: boolean;
  onClose: () => void;
  profile: AvatarProfile;
  layers: OutfitLayers;
};

/**
 * מסך מוגדל לדמות — סיבוב 180° נוח לכל ה־personas.
 */
export function AvatarExpandModal({
  visible,
  onClose,
  profile,
  layers,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [yaw, setYaw] = useState(0);

  useEffect(() => {
    if (visible) setYaw(0);
  }, [visible, profile.persona]);

  const personaLabel =
    PERSONA_OPTIONS.find((p) => p.id === profile.persona)?.label ?? '';

  const stageW = Math.min(width - 32, 360);
  const stageH = Math.min(height * 0.62, stageW * 1.85);

  const isBack = yaw > 90;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={['#1A1814', '#2A2520', '#1A1814']}
        style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable
            onPress={onClose}
            hitSlop={12}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/15"
            accessibilityLabel={he.closeExpand}
          >
            <Ionicons name="close" size={22} color="#FFF" />
          </Pressable>
          <View className="items-end">
            <Text className="font-display text-lg text-white">
              {personaLabel}
            </Text>
            <Text className="font-body text-xs text-white/60">
              {formatHeightMeters(profile.heightCm)} ·{' '}
              {isBack ? he.backViewHint : he.frontViewHint}
            </Text>
          </View>
        </View>

        <View className="flex-1 items-center justify-center px-4">
          <View
            style={{
              width: stageW,
              height: stageH,
              borderRadius: 28,
              overflow: 'hidden',
              backgroundColor: 'rgba(255,251,245,0.96)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <GameFashionAvatar
              key={`expand-${profile.persona}-${visible}`}
              profile={profile}
              layers={layers}
              width={stageW}
              height={stageH}
              yaw={yaw}
              onYawChange={setYaw}
              showHint
            />
          </View>
        </View>

        {/* כפתורי סיבוב ברורים — 0° / 180° */}
        <View className="flex-row items-center justify-center gap-3 px-6 pb-4">
          <Pressable
            onPress={() => setYaw(0)}
            className={`min-w-[120px] items-center rounded-2xl px-5 py-3.5 ${
              !isBack ? 'bg-white' : 'bg-white/20'
            }`}
          >
            <Ionicons
              name="person-outline"
              size={20}
              color={!isBack ? '#12161C' : '#FFF'}
            />
            <Text
              className={`mt-1 font-bodyBold text-sm ${
                !isBack ? 'text-ink' : 'text-white'
              }`}
            >
              {he.frontViewHint}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setYaw(180)}
            className={`min-w-[120px] items-center rounded-2xl px-5 py-3.5 ${
              isBack ? 'bg-white' : 'bg-white/20'
            }`}
          >
            <Ionicons
              name="sync-outline"
              size={20}
              color={isBack ? '#12161C' : '#FFF'}
            />
            <Text
              className={`mt-1 font-bodyBold text-sm ${
                isBack ? 'text-ink' : 'text-white'
              }`}
            >
              {he.rotate180Btn}
            </Text>
          </Pressable>
        </View>

        <Text className="mb-3 text-center font-body text-xs text-white/50">
          {he.expandRotateHint}
        </Text>
      </LinearGradient>
    </Modal>
  );
}
