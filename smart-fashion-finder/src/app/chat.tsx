import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ProductCard } from '@/data/catalog';
import { he } from '@/i18n/he';
import {
  createWelcomeMessage,
  replyToUser,
  type ChatIntent,
  type ChatMessage,
} from '@/services/fashionChat';
import { formatPriceILS } from '@/utils/stock';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([createWelcomeMessage()]);
  const [intent, setIntent] = useState<ChatIntent>({ keywords: [] });
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const scrollToEnd = () => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || typing) return;

    if (/^(חיפוש אחר|התחל מחדש)$/i.test(text)) {
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: 'user', text },
        createWelcomeMessage(),
      ]);
      setIntent({ keywords: [] });
      setInput('');
      scrollToEnd();
      return;
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    scrollToEnd();

    setTimeout(() => {
      const { message, intent: updated } = replyToUser(text, intent);
      setIntent(updated);
      setMessages((prev) => [...prev, message]);
      setTyping(false);
      scrollToEnd();
    }, 450);
  };

  const onProductPress = (product: ProductCard) => {
    router.push({
      pathname: '/',
      params: { openProductId: product.id },
    });
  };

  const lastSuggestions =
    [...messages].reverse().find((m) => m.role === 'assistant' && m.suggestions?.length)
      ?.suggestions ?? [];

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F7F4EF]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ paddingBottom: insets.bottom }}
    >
      <View className="border-b border-[#E8E4DE] bg-white px-4 pb-3 pt-2">
        <Text className="text-center font-display text-xl text-ink">{he.chatTitle}</Text>
        <Text className="mt-0.5 text-center font-body text-xs text-ink-muted">
          {he.chatSubtitle}
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerClassName="px-4 py-4 pb-6"
        onContentSizeChange={scrollToEnd}
        renderItem={({ item }) => <Bubble message={item} onProduct={onProductPress} />}
        ListFooterComponent={
          typing ? (
            <View className="mb-3 max-w-[80%] self-start rounded-2xl bg-white px-4 py-3">
              <ActivityIndicator color="#1F6B63" />
            </View>
          ) : null
        }
      />

      {lastSuggestions.length > 0 && !typing ? (
        <View className="flex-row flex-wrap justify-end gap-2 px-4 pb-2">
          {lastSuggestions.map((s) => (
            <Pressable
              key={s}
              onPress={() => send(s)}
              className="rounded-full border border-[#D9D3C9] bg-white px-3 py-1.5"
            >
              <Text className="font-bodyMedium text-xs text-ink">{s}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View className="flex-row items-end gap-2 border-t border-[#E8E4DE] bg-white px-3 py-2">
        <Pressable
          onPress={() => send(input)}
          disabled={!input.trim() || typing}
          className="mb-1 rounded-full bg-ink p-3"
          accessibilityLabel={he.chatSend}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
        <TextInput
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => send(input)}
          placeholder={he.chatPlaceholder}
          placeholderTextColor="#8A847C"
          className="max-h-28 min-h-[44px] flex-1 rounded-2xl bg-[#FAF8F5] px-4 py-2.5 font-body text-base text-ink"
          textAlign="right"
          multiline
          returnKeyType="send"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function Bubble({
  message,
  onProduct,
}: {
  message: ChatMessage;
  onProduct: (p: ProductCard) => void;
}) {
  const mine = message.role === 'user';
  return (
    <View className={`mb-3 max-w-[92%] ${mine ? 'self-end' : 'self-start'}`}>
      <View
        className={`rounded-2xl px-4 py-3 ${
          mine ? 'rounded-bl-md bg-ink' : 'rounded-br-md bg-white'
        }`}
      >
        <Text className={`font-body text-[15px] leading-6 ${mine ? 'text-white' : 'text-ink'}`}>
          {message.text}
        </Text>
      </View>

      {message.products && message.products.length > 0 ? (
        <View className="mt-2 gap-2">
          {message.products.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => onProduct(p)}
              className="flex-row items-center overflow-hidden rounded-2xl border border-[#E8E4DE] bg-white"
            >
              <Image
                source={p.image}
                resizeMode="contain"
                style={{ width: 72, height: 72, backgroundColor: '#FAF8F5' }}
              />
              <View className="flex-1 items-end px-3 py-2">
                <Text className="font-bodyBold text-sm text-ink" numberOfLines={1}>
                  {p.title}
                </Text>
                <Text className="mt-0.5 font-body text-xs text-ink-muted">
                  {p.brand ?? ''} {p.storeName ? `· ${p.storeName}` : ''}
                </Text>
                <Text className="mt-1 font-bodyBold text-sm text-teal">
                  {typeof p.price === 'number' ? formatPriceILS(p.price) : '—'}
                </Text>
              </View>
              <Ionicons
                name="chevron-back"
                size={16}
                color="#8A847C"
                style={{ marginLeft: 4, marginRight: 8 }}
              />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
