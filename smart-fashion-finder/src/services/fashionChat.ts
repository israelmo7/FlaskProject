import { PRODUCTS, type ProductCard } from '@/data/catalog';
import {
  categoryHe,
  extractIntent,
  type ChatIntent,
} from '@/services/fashionChatIntent';

export type { ChatIntent } from '@/services/fashionChatIntent';
export { extractIntent } from '@/services/fashionChatIntent';

export type ChatRole = 'assistant' | 'user';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  products?: ProductCard[];
  suggestions?: string[];
};

function uid() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createWelcomeMessage(): ChatMessage {
  return {
    id: uid(),
    role: 'assistant',
    text:
      'היי, אני הסטייליסט של StyleNear.\nספרו לי איזה בגד אתם מחפשים — סוג, צבע, תקציב או מותג — ואמצא לכם אופציות מחנויות לידכם בחיפה.',
    suggestions: [
      'חולצה שחורה עד 150',
      'ג׳ינס כחול',
      'משהו לחורף',
      'נעליים לבנות',
    ],
  };
}

export function matchProducts(intent: ChatIntent, limit = 4): ProductCard[] {
  const scored = PRODUCTS.map((p) => {
    let score = 0;
    if (intent.category && p.category === intent.category) score += 5;
    if (intent.color) {
      const pc = p.color.toLowerCase();
      const ic = intent.color.toLowerCase();
      if (pc.includes(ic) || ic.includes(pc.split(' ')[0])) score += 4;
    }
    if (intent.brand && p.brand?.toLowerCase().includes(intent.brand.toLowerCase())) {
      score += 3;
    }
    if (typeof intent.maxPrice === 'number' && typeof p.price === 'number') {
      if (p.price <= intent.maxPrice) score += 2;
      else score -= 3;
    }
    const blob = `${p.title} ${p.subcategory} ${p.color} ${p.brand ?? ''}`.toLowerCase();
    for (const kw of intent.keywords) {
      if (blob.includes(kw)) score += 1;
    }
    if (intent.occasion === 'winter' && p.category === 'Outerwear') score += 2;
    if (
      intent.occasion === 'summer' &&
      (p.subcategory.includes('קצר') || p.category === 'Shoes')
    ) {
      score += 2;
    }
    if (intent.occasion === 'evening' && p.category === 'Dresses') score += 3;
    if (
      intent.keywords.some((k) => k.includes('sport') || k.includes('ספורט')) &&
      p.subcategory.includes('ספורט')
    ) {
      score += 3;
    }
    return { p, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (a.p.price ?? 999) - (b.p.price ?? 999));

  if (scored.length === 0) {
    const pool = intent.category
      ? PRODUCTS.filter((p) => p.category === intent.category)
      : PRODUCTS;
    return pool.slice(0, limit);
  }
  return scored.slice(0, limit).map((x) => x.p);
}

function intentReady(intent: ChatIntent): boolean {
  return Boolean(
    intent.category || intent.color || intent.brand || intent.maxPrice || intent.occasion,
  );
}

function missingPrompt(intent: ChatIntent): { text: string; suggestions: string[] } {
  if (!intent.category) {
    return {
      text: 'מעולה. איזה סוג בגד בא לכם? חולצה, מכנסיים, עליונית, שמלה, נעליים או כובע?',
      suggestions: ['חולצה', 'ג׳ינס', 'ג׳קט', 'נעליים'],
    };
  }
  if (!intent.color && !intent.maxPrice) {
    return {
      text: `מחפש/ת ${categoryHe(intent.category)}. יש צבע מועדף או תקציב מקסימלי?`,
      suggestions: ['שחור', 'כחול', 'עד 200', 'בלי הגבלה — תראה לי'],
    };
  }
  return {
    text: 'עוד פרט אחד יעזור — צבע, מותג או תקציב?',
    suggestions: ['Zara', 'עד 150', 'תראה לי מה יש'],
  };
}

function summaryLine(intent: ChatIntent): string {
  const parts: string[] = [];
  if (intent.category) parts.push(categoryHe(intent.category));
  if (intent.color) parts.push(intent.color);
  if (intent.brand) parts.push(intent.brand);
  if (intent.maxPrice) parts.push(`עד ₪${intent.maxPrice}`);
  return parts.length ? parts.join(' · ') : 'החיפוש שלכם';
}

const SHOW_TRIGGERS =
  /תראה|הראה|אופצי|מה יש|בלי הגבלה|show|options|מצא|חפש|זהו|מספיק|תביא/;

/**
 * מנוע שיחה מקומי (סטייליסט) — עובד בלי מפתח API.
 * ניתן לחבר LLM חיצוני בהמשך מעל אותה כוונה + matchProducts.
 */
export function replyToUser(
  userText: string,
  prevIntent: ChatIntent,
): { message: ChatMessage; intent: ChatIntent } {
  const intent = extractIntent(userText, prevIntent);
  const wantsShow = SHOW_TRIGGERS.test(userText.toLowerCase()) || intentReady(intent);

  if (!intent.category && !SHOW_TRIGGERS.test(userText.toLowerCase())) {
    const ask = missingPrompt(intent);
    return {
      intent,
      message: {
        id: uid(),
        role: 'assistant',
        text: ask.text,
        suggestions: ask.suggestions,
      },
    };
  }

  if (!wantsShow && !intent.color && !intent.maxPrice && !intent.brand) {
    const ask = missingPrompt(intent);
    return {
      intent,
      message: {
        id: uid(),
        role: 'assistant',
        text: ask.text,
        suggestions: ask.suggestions,
      },
    };
  }

  const products = matchProducts(intent, 4);
  const line = summaryLine(intent);

  if (products.length === 0) {
    return {
      intent,
      message: {
        id: uid(),
        role: 'assistant',
        text: `לא מצאתי התאמה מדויקת ל־${line}. נסו צבע אחר או בלי הגבלת תקציב.`,
        suggestions: ['חולצה שחורה', 'ג׳ינס', 'ג׳קט לחורף'],
      },
    };
  }

  return {
    intent,
    message: {
      id: uid(),
      role: 'assistant',
      text: `מצאתי ${products.length} אופציות ל־${line}. אפשר ללחוץ על פריט כדי לראות פרטים, להוסיף לסל או להלביש על האווטאר.`,
      products,
      suggestions: ['חיפוש אחר', 'משהו יותר זול', 'עליונית לחורף'],
    },
  };
}
