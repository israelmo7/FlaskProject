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
import { PERSONA_OPTIONS } from '@/constants/avatar';
import { he } from '@/i18n/he';
import type { AvatarProfile, OutfitLayers } from '@/types';

type Props = {
  visible: boolean;
  onClose: () => void;
  profile: AvatarProfile;
  layers: OutfitLayers;
  vtonHeroUri?: string | null;
};

/**
 * מסך מוגדל לדמות — סיבוב 180° נוח לכל ה־personas.
 */
export function AvatarExpandModal({
  visible,
  onClose,
  profile,
  layers,
  vtonHeroUri = null,
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
              key={`expand-${profile.persona}-${visible}-${vtonHeroUri ? 'vton' : 'fit'}`}
              profile={profile}
              layers={layers}
              width={stageW}
              height={stageH}
              yaw={yaw}
              onYawChange={setYaw}
              showHint
              vtonHeroUri={vtonHeroUri}
            />
          </View>
        </View>

        {/* כפתורי סיבוב — חזית / צד / גב */}
        <View className="flex-row items-center justify-center gap-2 px-4 pb-4">
          {(
            [
              { yaw: 0, label: he.frontViewHint, icon: 'person-outline' as const },
              { yaw: 90, label: he.sideViewHint, icon: 'swap-horizontal-outline' as const },
              { yaw: 180, label: he.rotate180Btn, icon: 'sync-outline' as const },
            ] as const
          ).map((btn) => {
            const active = Math.abs(yaw - btn.yaw) < 20;
            return (
              <Pressable
                key={btn.yaw}
                onPress={() => setYaw(btn.yaw)}
                className={`min-w-[100px] items-center rounded-2xl px-4 py-3 ${
                  active ? 'bg-white' : 'bg-white/20'
                }`}
              >
                <Ionicons
                  name={btn.icon}
                  size={20}
                  color={active ? '#12161C' : '#FFF'}
                />
                <Text
                  className={`mt-1 font-bodyBold text-sm ${
                    active ? 'text-ink' : 'text-white'
                  }`}
                >
                  {btn.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mb-3 text-center font-body text-xs text-white/50">
          {he.expandRotateHint}
        </Text>
      </LinearGradient>
    </Modal>
  );
}
