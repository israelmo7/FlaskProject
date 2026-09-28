import { PRODUCTS, type ProductCard } from '@/data/catalog';
import {
  categoryHe,
  colorMatches,
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
      'היי, אני עוזר הקניות של StyleNear.\nתארו מה אתם מחפשים בשפה חופשית — למשל «חולצה לבנה מכופתרת», «מעיל חורף שחור» או «שמלה לאירוע» — ואציג פריטים מתאימים מהקטלוג.',
    suggestions: [
      'חולצה לבנה מכופתרת',
      'מעיל חורף שחור',
      'שמלה לאירוע',
      'ג׳ינס כחול',
    ],
  };
}

function subHintMatches(product: ProductCard, hint?: string): boolean {
  if (!hint) return true;
  const h = hint.toLowerCase();
  const blob = `${product.subcategory} ${product.title}`.toLowerCase();
  if (blob.includes(h)) return true;
  // קירוב לתת־סוגים נפוצים
  if (h.includes('טי') && (blob.includes('טי') || blob.includes('t-shirt') || blob.includes('tshirt')))
    return true;
  if (h.includes('ג׳ינס') || h.includes("ג'ינס")) {
    return blob.includes('ג׳ינס') || blob.includes("ג'ינס") || blob.includes('jeans');
  }
  if (h.includes('קצר') && blob.includes('קצר')) return true;
  if (h.includes('ספורט') && blob.includes('ספורט')) return true;
  return false;
}

/**
 * התאמה קשיחה: צבע / קטגוריה / תת־סוג / מחיר — בלי תוצאות לא רלוונטיות.
 */
export function matchProducts(intent: ChatIntent, limit = 4): ProductCard[] {
  const scored = PRODUCTS.map((p) => {
    let score = 0;

    if (intent.category) {
      if (p.category !== intent.category) return { p, score: -100 };
      score += 6;
    }

    if (intent.color) {
      if (!colorMatches(p.color, intent.color)) return { p, score: -100 };
      score += 8;
    }

    if (intent.subcategoryHint) {
      if (!subHintMatches(p, intent.subcategoryHint)) return { p, score: -100 };
      score += 5;
    }

    if (intent.brand) {
      const pb = (p.brand ?? '').toLowerCase();
      const ib = intent.brand.toLowerCase();
      if (!pb.includes(ib) && !ib.includes(pb)) return { p, score: -100 };
      score += 4;
    }

    if (typeof intent.maxPrice === 'number' && typeof p.price === 'number') {
      if (p.price > intent.maxPrice) return { p, score: -100 };
      score += 2;
    }

    const blob = `${p.title} ${p.subcategory} ${p.color} ${p.brand ?? ''}`.toLowerCase();
    for (const kw of intent.keywords) {
      if (kw.length > 2 && blob.includes(kw)) score += 1;
    }

    if (intent.occasion === 'winter' && p.category === 'Outerwear') score += 2;
    if (
      intent.occasion === 'summer' &&
      (p.subcategory.includes('קצר') ||
        p.category === 'Shoes' ||
        p.subcategory.includes('ים'))
    ) {
      score += 2;
    }
    if (intent.occasion === 'evening' && p.category === 'Dresses') score += 3;

    return { p, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (a.p.price ?? 999) - (b.p.price ?? 999));

  // בלי fallback רך — אם אין התאמה מדויקת, מחזירים ריק
  return scored.slice(0, limit).map((x) => x.p);
}

function intentReady(intent: ChatIntent): boolean {
  return Boolean(
    intent.category ||
      intent.color ||
      intent.brand ||
      intent.maxPrice ||
      intent.occasion ||
      intent.subcategoryHint,
  );
}

function missingPrompt(intent: ChatIntent): { text: string; suggestions: string[] } {
  if (!intent.category) {
    return {
      text: 'מעולה. איזה סוג בגד בא לכם? חולצה, מכנסיים, עליונית, שמלה, נעליים או כובע?',
      suggestions: ['חולצה שחורה', 'ג׳ינס כחול', 'ג׳קט', 'נעליים לבנות'],
    };
  }
  if (!intent.color && !intent.maxPrice && !intent.subcategoryHint) {
    return {
      text: `מחפש/ת ${categoryHe(intent.category)}. איזה צבע או תקציב? או כתבו «תראה לי» לכל האופציות בקטגוריה.`,
      suggestions: ['שחור', 'כחול', 'עד 200', 'תראה לי'],
    };
  }
  return {
    text: 'עוד פרט אחד יעזור — צבע, מותג או תקציב?',
    suggestions: ['Zara', 'עד 150', 'תראה לי מה יש'],
  };
}

function summaryLine(intent: ChatIntent): string {
  const parts: string[] = [];
  if (intent.subcategoryHint) parts.push(intent.subcategoryHint);
  else if (intent.category) parts.push(categoryHe(intent.category));
  if (intent.color) parts.push(colorHe(intent.color));
  if (intent.brand) parts.push(intent.brand);
  if (intent.maxPrice) parts.push(`עד ₪${intent.maxPrice}`);
  return parts.length ? parts.join(' · ') : 'החיפוש שלכם';
}

function colorHe(color: string): string {
  const map: Record<string, string> = {
    Black: 'שחור',
    White: 'לבן',
    Blue: 'כחול',
    Navy: 'נייבי',
    Beige: 'בז׳',
    Brown: 'חום',
    'Olive Green': 'זית',
    Khaki: 'חאקי',
    Charcoal: 'אפור',
  };
  return map[color] ?? color;
}

const SHOW_TRIGGERS =
  /תראה|הראה|אופצי|מה יש|בלי הגבלה|show|options|מצא|חפש|זהו|מספיק|תביא/;

/**
 * עוזר קניות / חיפוש בקטלוג — עובד בלי מפתח API.
 * תפקיד יחיד: סינון והצגת פריטים לפי שפה חופשית (לא הלבשה ולא המלצות שילובים).
 * ניתן לחבר LLM חיצוני בהמשך מעל אותה כוונה + matchProducts.
 */
export function replyToUser(
  userText: string,
  prevIntent: ChatIntent,
): { message: ChatMessage; intent: ChatIntent } {
  const intent = extractIntent(userText, prevIntent);
  const showTrigger = SHOW_TRIGGERS.test(userText.toLowerCase());
  // חיפוש מדויק (קטגוריה+צבע / תת־סוג+צבע / מותג) — מציגים מיד
  const preciseEnough = Boolean(
    (intent.category && intent.color) ||
      (intent.subcategoryHint && intent.color) ||
      (intent.category && intent.subcategoryHint) ||
      intent.brand ||
      (intent.category && intent.maxPrice) ||
      showTrigger,
  );

  if (!intent.category && !showTrigger && !intent.brand && !intent.subcategoryHint) {
    // צבע בלבד — מבקשים סוג בגד כדי לא לערבב חולצה/כובע/ג׳קט
    if (intent.color) {
      return {
        intent,
        message: {
          id: uid(),
          role: 'assistant',
          text: `מעולה, ${colorHe(intent.color)}. איזה בגד בצבע הזה? חולצה, מכנסיים, עליונית, נעליים…`,
          suggestions: [
            `חולצה ${colorHe(intent.color)}`,
            `ג׳ינס ${colorHe(intent.color)}`,
            `ג׳קט ${colorHe(intent.color)}`,
            'נעליים',
          ],
        },
      };
    }
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

  if (!preciseEnough && intent.category && !intent.color && !intent.maxPrice && !intent.brand) {
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

  if (!intentReady(intent) && !showTrigger) {
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

  const products = matchProducts(intent, 6);
  const line = summaryLine(intent);

  if (products.length === 0) {
    return {
      intent,
      message: {
        id: uid(),
        role: 'assistant',
        text: `לא מצאתי התאמה מדויקת ל־${line}. נסו ניסוח אחר (למשל צבע אחר) או בלי הגבלת תקציב.`,
        suggestions: ['חולצה שחורה', 'ג׳ינס כחול', 'בומבר שחור', 'חיפוש אחר'],
      },
    };
  }

  const onlyExact =
    intent.color || intent.subcategoryHint
      ? `הצגתי רק פריטים שמתאימים בדיוק ל־${line}.`
      : `הנה ${products.length} אופציות ל־${line}.`;

  return {
    intent,
    message: {
      id: uid(),
      role: 'assistant',
      text: `${onlyExact} לחצו על פריט לפרטים או להוספה לסל.`,
      products,
      suggestions: ['חיפוש אחר', 'משהו יותר זול', 'מעיל חורף שחור'],
    },
  };
}
