/** עברית לפיילוט StyleNear בחיפה */
export const he = {
  brand: 'StyleNear',
  tagline: 'מצאת את הבגד? לך לחנות הקרובה.',
  pilotBadge: 'פיילוט חיפה · גרנד קניון וסביבה',
  valueProp:
    'במקום להזמין אונליין — בודקים מידה וצבע בחנויות לידכם, כולל בוטיקים מקומיים.',

  tabs: {
    discover: 'גילוי',
    avatar: 'אווטאר',
    history: 'היסטוריה',
  },

  searchPlaceholder: 'חפשו בגד, צבע או מותג…',
  upload: 'העלאת תמונה',
  uploadSub: 'בחרו לוק מהגלריה',
  camera: 'צילום מהיר',
  cameraSub: 'צלמו פריט שראיתם ברחוב או בחנות',
  avatarCta: 'הלבשת אווטאר AI',
  avatarSub: 'בחרו מבנה גוף והתאימו את הבגד',
  analyzing: 'מזהים את הבגד…',
  menuCategories: 'קטגוריות',
  closeMenu: 'סגור',
  dressHint: 'לחצו על פריט כדי להלביש את הדמות',
  openCamera: 'מצלמה',
  openGallery: 'גלריה',
  homeBrandHint: 'StyleNear',

  filters: {
    category: 'קטגוריה',
    distance: 'מרחק',
    gender: 'מגדר',
    size: 'המידה שלי',
    all: 'הכל',
    pants: 'מכנסיים',
    shirts: 'חולצות',
    outerwear: 'עליוניות',
    men: 'גברים',
    women: 'נשים',
    unisex: 'יוניסקס',
    km: 'ק״מ',
  },

  recent: 'חיפושים אחרונים',
  trending: 'סגנונות שטרנדיים לידכם',

  analysisTitle: 'ניתוח הבגד',
  aiBreakdown: 'פירוט AI',
  category: 'קטגוריה',
  colorPattern: 'צבע ודוגמה',
  estimatedPrice: 'טווח מחיר משוער',
  findNearMe: 'מצא לידך',
  confidence: 'התאמה',
  noAnalysis: 'עדיין אין ניתוח',
  noAnalysisHint: 'העלו תמונה או הלבישו אווטאר כדי לזהות בגד.',
  goBack: 'חזרה',

  storesTitle: 'מלאי קרוב',
  near: 'ליד',
  demoLocation: '(מיקום דמו חיפה)',
  within: 'בטווח',
  listView: 'רשימה',
  mapView: 'מפה',
  storesWithStock: 'חנויות עם מלאי',
  totalMatches: 'התאמות',
  noMatches: 'אין התאמות קרובות',
  noMatchesHint: 'נסו להרחיב את רדיוס המרחק או לשנות מידה/מגדר.',
  mapWebHint:
    'מפה אינטראקטיבית זמינה ב־iOS ובאנדרואיד. כאן מוצגות נקודות החנויות כטקסט.',
  sizeAvailable: 'יש את המידה שלך',
  sizeMissing: 'אין את המידה שלך כאן',
  sizesInStore: 'מידות בחנות',
  boutique: 'בוטיק מקומי',
  navigate: 'ניווט לחנות',
  inStock: 'במלאי',
  lowStock: 'מלאי נמוך',
  outOfStock: 'אזל מהמלאי',
  left: 'נותרו',
  away: 'משם',
  yourSizeFirst: 'קודם חנויות עם המידה שלך',

  avatarTitle: 'מדידה וירטואלית',
  avatarHint:
    'בחרו מבנה גוף, הלבישו פריט, ואז בדקו באיזו חנות יש את הצבע והמידה.',
  bodyType: 'מבנה גוף',
  slim: 'רזה',
  regular: 'רגיל',
  athletic: 'אתלטי',
  plus: 'פלוס',
  overlayGarment: 'הלבשת פריט',
  tryOnPreview: 'תצוגה מקדימה',
  selectGarment: 'בחרו פריט להלבשה',
  chooseGarmentAlert: 'בחרו פריט להלבשה לפני חיפוש בחנויות.',

  historyTitle: 'היסטוריית חיפושים',
  historyHint: 'חזרו ללוק שאהבתם ובדקו מלאי מעודכן לידכם.',

  recognitionFailed: 'הזיהוי נכשל',
  recognitionFailedHint: 'לא הצלחנו לנתח את התמונה. נסו שוב.',
} as const;

export const categoryLabel: Record<string, string> = {
  All: he.filters.all,
  Pants: he.filters.pants,
  Shirts: he.filters.shirts,
  Outerwear: he.filters.outerwear,
};

export const genderLabel: Record<string, string> = {
  All: he.filters.all,
  Men: he.filters.men,
  Women: he.filters.women,
  Unisex: he.filters.unisex,
};

export const bodyLabel: Record<string, string> = {
  slim: he.slim,
  regular: he.regular,
  athletic: he.athletic,
  plus: he.plus,
};
