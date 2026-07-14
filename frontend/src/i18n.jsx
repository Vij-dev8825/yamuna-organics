import { createContext, useContext, useState } from 'react';

/**
 * Lightweight i18n: flat key → string dictionaries per language.
 * Missing keys fall back to English, so partial translations never break the UI.
 * Product names/descriptions come from the database and stay as entered by the admin.
 */

export const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'ta', label: 'தமிழ்' },
];

const en = {
  // announcement + nav
  announcement: '🚚 Free shipping above ₹499 · Cash on Delivery available · Pressed fresh every week',
  navHome: 'Home',
  navShop: 'Shop',
  navCategories: 'Categories',
  navBulk: 'Bulk Sales',
  navContact: 'Contact',
  navAdmin: 'Admin',

  // hero
  heroEyebrow: 'Kachi Ghani · Wood-Pressed · Directly from Farmers',
  heroTitle: 'From our fields to your bottle',
  heroSub: 'No heat, no solvents, no shortcuts — just seeds, stone and a wooden ghani.',
  shopAllOils: 'Shop all products',
  enquireBulk: 'Enquire in bulk',
  statProducts: 'Organic products',
  statChemicals: 'Chemicals or additives',
  statTemp: 'Max pressing temperature',
  statTrace: 'Traceable to the farm',

  // USP strip
  usp1t: 'Farm-direct ingredients',
  usp1d: 'Sourced straight from partner farmers, sun-dried & hand-cleaned',
  usp2t: 'Wood-pressed (kachi ghani)',
  usp2d: 'Slow-crushed on a wooden kolhu, always under 25°C',
  usp3t: 'Lab-tested purity',
  usp3d: 'Every batch tested — zero chemicals, solvents or additives',
  usp4t: 'Made fresh weekly',
  usp4d: 'Small batches, batch-coded, shipped fresh to your door',

  // categories section
  catEyebrow: 'Shop by category',
  catTitle: 'Oils, soaps & powders — one promise',
  catSub: 'Everything is made in small batches from single-origin, farm-direct ingredients.',
  catTag: '100% Organic',
  catBrowse: 'Browse',
  catPageSub: 'Each product is single-origin and made in-house — nothing blended, nothing outsourced.',

  // bestsellers
  bestEyebrow: 'Bestsellers',
  bestTitle: 'Loved across kitchens',
  viewAll: 'View all products',

  // watch section
  watchEyebrow: "Watch how it's made",
  watchTitle: 'Slow by design, pure by tradition',
  watchDesc:
    'Watch our copra and seeds travel from the farm gate to the wooden ghani. The press turns slowly — under 25°C — so nothing burns, nothing oxidises, and every drop keeps its nutrients, aroma and colour.',
  watchLi1: 'Seeds sun-dried and hand-cleaned at the farm',
  watchLi2: 'Crushed on a traditional wooden kolhu, never refined',
  watchLi3: 'Settled naturally, cloth-filtered, batch-coded',
  watchCta: 'Taste the difference',

  // process
  processEyebrow: "How it's made",
  processTitle: 'From farm gate to your bottle',
  step1t: 'Sourcing',
  step1d: 'Seeds bought directly from partner farms, sun-dried and hand-cleaned.',
  step2t: 'Cold-pressing',
  step2d: 'Crushed slowly on a wooden ghani, kept under 25°C to protect nutrients.',
  step3t: 'Settling & filtering',
  step3d: 'Left to settle naturally, then cloth-filtered — no chemical clarifiers.',
  step4t: 'Bottling',
  step4d: 'Sealed the same week in food-grade bottles, batch-coded for traceability.',

  // testimonials + bulk
  testiEyebrow: 'What customers say',
  testiTitle: 'Trusted in thousands of kitchens',
  bulkTitle: 'Buying for a store, restaurant or event?',
  bulkDesc: 'We supply in bulk — 15L, 35L drums and custom quantities, with GST invoicing.',
  bulkCta: 'Get a wholesale quote',

  // shop page
  shopTitle: 'Shop',
  allProducts: 'All Products',
  searchPlaceholder: 'Search products…',
  categoryFilter: 'Category',
  sortBy: 'Sort by',
  sortRecommended: 'Recommended',
  sortPriceAsc: 'Price: Low to High',
  sortPriceDesc: 'Price: High to Low',
  sortRating: 'Customer Rating',
  productsCount: 'products',
  noMatch: 'No products match that search',
  noMatchSub: 'Try a different keyword or clear your filters.',

  // footer
  footerTagline:
    'Directly from farmers, traditional ways — wood-pressed (kachi ghani) oils, handmade soaps and stone-ground powders.',
  footerShop: 'Shop',
  footerSupport: 'Support',
  footerReach: 'Reach us',
  footerAll: 'All products',
  footerCategories: 'Categories',
  footerBulk: 'Bulk / Wholesale',
  footerWishlist: 'Wishlist',
  footerContact: 'Contact us',
  footerAccount: 'My account',
  footerRefunds: 'Refund & Returns',
  footerPrivacy: 'Privacy Policy',
  footerRights: 'All rights reserved.',
  footerMotto: 'Wood-pressed with care, always.',

  // chat widget
  chatTitle: 'Chat with us',
  chatReply: 'We usually reply within a few hours',
  chatLoginText: 'Log in with your mobile number to start chatting with our team.',
  chatLoginBtn: 'Log in to chat',
  chatPlaceholder: 'Type a message…',
  chatSend: 'Send',
  chatGreeting: 'Namaste! 🙏 Ask us anything about our products, your order, or bulk pricing.',
};

const hi = {
  announcement: '🚚 ₹499 से ऊपर मुफ़्त डिलीवरी · कैश ऑन डिलीवरी उपलब्ध · हर हफ़्ते ताज़ा पेराई',
  navHome: 'होम',
  navShop: 'दुकान',
  navCategories: 'श्रेणियाँ',
  navBulk: 'थोक बिक्री',
  navContact: 'संपर्क',
  navAdmin: 'एडमिन',

  heroEyebrow: 'कच्ची घानी · लकड़ी-पेराई · सीधे किसानों से',
  heroTitle: 'हमारे खेतों से आपकी बोतल तक',
  heroSub: 'न गर्मी, न केमिकल, न शॉर्टकट — सिर्फ़ बीज, पत्थर और लकड़ी की घानी।',
  shopAllOils: 'सभी उत्पाद देखें',
  enquireBulk: 'थोक पूछताछ करें',
  statProducts: 'ऑर्गेनिक उत्पाद',
  statChemicals: 'केमिकल या मिलावट',
  statTemp: 'अधिकतम पेराई तापमान',
  statTrace: 'खेत तक ट्रेस करने योग्य',

  usp1t: 'सीधे खेत से सामग्री',
  usp1d: 'साझेदार किसानों से सीधे ख़रीदे, धूप में सुखाए और हाथ से साफ़ किए',
  usp2t: 'लकड़ी की घानी (कच्ची घानी)',
  usp2d: 'लकड़ी के कोल्हू पर धीमी पेराई, हमेशा 25°C से नीचे',
  usp3t: 'लैब-परखी शुद्धता',
  usp3d: 'हर बैच की जाँच — शून्य केमिकल, सॉल्वेंट या मिलावट',
  usp4t: 'हर हफ़्ते ताज़ा',
  usp4d: 'छोटे बैच, बैच-कोडेड, आपके घर तक ताज़ा',

  catEyebrow: 'श्रेणी के अनुसार ख़रीदें',
  catTitle: 'तेल, साबुन और चूर्ण — एक ही वादा',
  catSub: 'सब कुछ छोटे बैच में, एकल-स्रोत, खेत से सीधी सामग्री से बनता है।',
  catTag: '100% ऑर्गेनिक',
  catBrowse: 'ब्राउज़ करें',
  catPageSub: 'हर उत्पाद एकल-स्रोत और अपने कारख़ाने में बना — न कोई मिश्रण, न कोई आउटसोर्सिंग।',

  bestEyebrow: 'बेस्टसेलर',
  bestTitle: 'हज़ारों रसोई की पसंद',
  viewAll: 'सभी उत्पाद देखें',

  watchEyebrow: 'देखें कैसे बनता है',
  watchTitle: 'धीमा तरीक़ा, शुद्ध परंपरा',
  watchDesc:
    'देखिए हमारा खोपरा और बीज खेत से लकड़ी की घानी तक कैसे पहुँचते हैं। घानी धीरे घूमती है — 25°C से नीचे — ताकि कुछ भी जले नहीं और हर बूँद में पोषण, ख़ुशबू और रंग बना रहे।',
  watchLi1: 'बीज खेत पर ही धूप में सुखाए और हाथ से साफ़ किए जाते हैं',
  watchLi2: 'पारंपरिक लकड़ी के कोल्हू पर पेराई, कभी रिफाइंड नहीं',
  watchLi3: 'प्राकृतिक रूप से ठहराव, कपड़े से छानना, बैच-कोडिंग',
  watchCta: 'फ़र्क़ चखकर देखें',

  processEyebrow: 'कैसे बनता है',
  processTitle: 'खेत से आपकी बोतल तक',
  step1t: 'सोर्सिंग',
  step1d: 'बीज सीधे साझेदार खेतों से, धूप में सुखाए और हाथ से साफ़।',
  step2t: 'कोल्ड-प्रेसिंग',
  step2d: 'लकड़ी की घानी पर धीमी पेराई, पोषण बचाने के लिए 25°C से नीचे।',
  step3t: 'ठहराव और छनाई',
  step3d: 'प्राकृतिक ठहराव, फिर कपड़े से छनाई — कोई केमिकल नहीं।',
  step4t: 'बोतल-बंदी',
  step4d: 'उसी हफ़्ते फ़ूड-ग्रेड बोतलों में सील, ट्रेसबिलिटी के लिए बैच-कोड।',

  testiEyebrow: 'ग्राहक क्या कहते हैं',
  testiTitle: 'हज़ारों रसोई का भरोसा',
  bulkTitle: 'दुकान, रेस्टोरेंट या आयोजन के लिए ख़रीदना है?',
  bulkDesc: 'हम थोक में देते हैं — 15L, 35L ड्रम और कस्टम मात्रा, GST बिल के साथ।',
  bulkCta: 'थोक भाव पाएँ',

  shopTitle: 'दुकान',
  allProducts: 'सभी उत्पाद',
  searchPlaceholder: 'उत्पाद खोजें…',
  categoryFilter: 'श्रेणी',
  sortBy: 'क्रमबद्ध करें',
  sortRecommended: 'अनुशंसित',
  sortPriceAsc: 'क़ीमत: कम से ज़्यादा',
  sortPriceDesc: 'क़ीमत: ज़्यादा से कम',
  sortRating: 'ग्राहक रेटिंग',
  productsCount: 'उत्पाद',
  noMatch: 'इस खोज से कोई उत्पाद नहीं मिला',
  noMatchSub: 'कोई और शब्द आज़माएँ या फ़िल्टर हटाएँ।',

  footerTagline:
    'सीधे किसानों से, पारंपरिक तरीक़े — लकड़ी-पेराई (कच्ची घानी) तेल, हाथ के बने साबुन और सिल-पिसे चूर्ण।',
  footerShop: 'दुकान',
  footerSupport: 'सहायता',
  footerReach: 'संपर्क करें',
  footerAll: 'सभी उत्पाद',
  footerCategories: 'श्रेणियाँ',
  footerBulk: 'थोक / होलसेल',
  footerWishlist: 'विशलिस्ट',
  footerContact: 'संपर्क करें',
  footerAccount: 'मेरा खाता',
  footerRefunds: 'रिफ़ंड और वापसी',
  footerPrivacy: 'गोपनीयता नीति',
  footerRights: 'सर्वाधिकार सुरक्षित।',
  footerMotto: 'हमेशा, प्यार से लकड़ी-पेराई।',

  chatTitle: 'हमसे बात करें',
  chatReply: 'हम आमतौर पर कुछ घंटों में जवाब देते हैं',
  chatLoginText: 'हमारी टीम से चैट शुरू करने के लिए अपने मोबाइल नंबर से लॉग इन करें।',
  chatLoginBtn: 'चैट के लिए लॉग इन करें',
  chatPlaceholder: 'संदेश लिखें…',
  chatSend: 'भेजें',
  chatGreeting: 'नमस्ते! 🙏 हमारे उत्पाद, आपके ऑर्डर या थोक भाव — कुछ भी पूछिए।',
};

const ta = {
  announcement: '🚚 ₹499க்கு மேல் இலவச டெலிவரி · கேஷ் ஆன் டெலிவரி உண்டு · வாரந்தோறும் புதிதாக ஆட்டப்படுகிறது',
  navHome: 'முகப்பு',
  navShop: 'கடை',
  navCategories: 'வகைகள்',
  navBulk: 'மொத்த விற்பனை',
  navContact: 'தொடர்பு',
  navAdmin: 'நிர்வாகம்',

  heroEyebrow: 'மரச்செக்கு · செக்கில் ஆட்டியது · நேரடியாக விவசாயிகளிடமிருந்து',
  heroTitle: 'எங்கள் வயலிலிருந்து உங்கள் பாட்டிலுக்கு',
  heroSub: 'வெப்பம் இல்லை, ரசாயனம் இல்லை, குறுக்குவழி இல்லை — விதை, கல், மரச்செக்கு மட்டுமே.',
  shopAllOils: 'அனைத்து பொருட்களும்',
  enquireBulk: 'மொத்த விலை விசாரிக்க',
  statProducts: 'இயற்கை பொருட்கள்',
  statChemicals: 'ரசாயனம் / கலப்படம்',
  statTemp: 'அதிகபட்ச ஆட்டும் வெப்பநிலை',
  statTrace: 'பண்ணை வரை தடமறியலாம்',

  usp1t: 'பண்ணையிலிருந்து நேரடி மூலப்பொருள்',
  usp1d: 'கூட்டு விவசாயிகளிடமிருந்து நேரடியாக — வெயிலில் உலர்த்தி கையால் சுத்தம்',
  usp2t: 'மரச்செக்கு முறை',
  usp2d: 'மரச்செக்கில் மெதுவாக ஆட்டப்படுகிறது, எப்போதும் 25°Cக்குக் கீழ்',
  usp3t: 'ஆய்வக சோதனை தூய்மை',
  usp3d: 'ஒவ்வொரு தொகுப்பும் சோதிக்கப்படுகிறது — ரசாயனம், கலப்படம் ஏதுமில்லை',
  usp4t: 'வாரந்தோறும் புதிது',
  usp4d: 'சிறு தொகுப்புகள், தொகுப்பு-குறியீடு, வீட்டுக்கு புதிதாக அனுப்பம்',

  catEyebrow: 'வகை வாரியாக வாங்குங்கள்',
  catTitle: 'எண்ணெய், சோப்பு, பொடி — ஒரே வாக்குறுதி',
  catSub: 'அனைத்தும் சிறு தொகுப்புகளில், ஒற்றை மூலம், பண்ணை நேரடி மூலப்பொருட்களில் தயாராகிறது.',
  catTag: '100% இயற்கை',
  catBrowse: 'பார்வையிட',
  catPageSub: 'ஒவ்வொரு பொருளும் ஒற்றை மூலம், சொந்த தயாரிப்பு — கலப்பும் இல்லை, வெளிக்கொடுப்பும் இல்லை.',

  bestEyebrow: 'அதிகம் விற்பனையானவை',
  bestTitle: 'ஆயிரம் சமையலறைகளின் விருப்பம்',
  viewAll: 'அனைத்தையும் காண',

  watchEyebrow: 'எப்படி தயாராகிறது என்று பாருங்கள்',
  watchTitle: 'மெதுவான முறை, தூய பாரம்பரியம்',
  watchDesc:
    'கொப்பரையும் விதைகளும் பண்ணையிலிருந்து மரச்செக்கு வரை பயணிப்பதைப் பாருங்கள். செக்கு மெதுவாகச் சுழல்கிறது — 25°Cக்குக் கீழ் — எதுவும் எரிவதில்லை; ஒவ்வொரு சொட்டிலும் சத்தும் மணமும் நிறமும் அப்படியே.',
  watchLi1: 'விதைகள் பண்ணையிலேயே வெயிலில் உலர்த்தி கையால் சுத்தம்',
  watchLi2: 'பாரம்பரிய மரச்செக்கில் ஆட்டப்படுகிறது, சுத்திகரிப்பு இல்லை',
  watchLi3: 'இயற்கையாக தெளிய வைத்து, துணியில் வடிகட்டி, தொகுப்பு-குறியீடு',
  watchCta: 'வித்தியாசத்தை சுவைத்துப் பாருங்கள்',

  processEyebrow: 'எப்படி தயாராகிறது',
  processTitle: 'பண்ணையிலிருந்து உங்கள் பாட்டில் வரை',
  step1t: 'மூலப்பொருள் சேகரிப்பு',
  step1d: 'விதைகள் நேரடியாக கூட்டு பண்ணைகளில் இருந்து — வெயிலில் உலர்த்தி கையால் சுத்தம்.',
  step2t: 'குளிர் ஆட்டல்',
  step2d: 'மரச்செக்கில் மெதுவாக ஆட்டல், சத்துக்களை காக்க 25°Cக்குக் கீழ்.',
  step3t: 'தெளிதல் & வடிகட்டல்',
  step3d: 'இயற்கையாக தெளிய வைத்து துணியில் வடிகட்டல் — ரசாயனம் இல்லை.',
  step4t: 'பாட்டிலடைத்தல்',
  step4d: 'அதே வாரம் உணவு-தர பாட்டில்களில் சீல் — தடமறிய தொகுப்பு-குறியீடு.',

  testiEyebrow: 'வாடிக்கையாளர்கள் சொல்வது',
  testiTitle: 'ஆயிரக்கணக்கான சமையலறைகளின் நம்பிக்கை',
  bulkTitle: 'கடை, உணவகம் அல்லது விழாவிற்கு வாங்குகிறீர்களா?',
  bulkDesc: 'மொத்தமாக வழங்குகிறோம் — 15L, 35L டிரம் மற்றும் தேவைக்கேற்ற அளவு, GST பில்லுடன்.',
  bulkCta: 'மொத்த விலை பெற',

  shopTitle: 'கடை',
  allProducts: 'அனைத்து பொருட்கள்',
  searchPlaceholder: 'பொருட்களைத் தேடுங்கள்…',
  categoryFilter: 'வகை',
  sortBy: 'வரிசைப்படுத்த',
  sortRecommended: 'பரிந்துரைக்கப்பட்டவை',
  sortPriceAsc: 'விலை: குறைவு முதல் அதிகம்',
  sortPriceDesc: 'விலை: அதிகம் முதல் குறைவு',
  sortRating: 'வாடிக்கையாளர் மதிப்பீடு',
  productsCount: 'பொருட்கள்',
  noMatch: 'இந்தத் தேடலுக்கு பொருட்கள் இல்லை',
  noMatchSub: 'வேறு சொல் முயற்சிக்கவும் அல்லது வடிகட்டிகளை அழிக்கவும்.',

  footerTagline:
    'நேரடியாக விவசாயிகளிடமிருந்து, பாரம்பரிய முறையில் — மரச்செக்கு எண்ணெய்கள், கைவினை சோப்புகள், கல்லில் அரைத்த பொடிகள்.',
  footerShop: 'கடை',
  footerSupport: 'உதவி',
  footerReach: 'தொடர்பு கொள்ள',
  footerAll: 'அனைத்து பொருட்கள்',
  footerCategories: 'வகைகள்',
  footerBulk: 'மொத்தம் / ஹோல்சேல்',
  footerWishlist: 'விருப்பப்பட்டியல்',
  footerContact: 'தொடர்பு கொள்ள',
  footerAccount: 'என் கணக்கு',
  footerRefunds: 'பணத்திரும்பல் & திருப்பம்',
  footerPrivacy: 'தனியுரிமைக் கொள்கை',
  footerRights: 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
  footerMotto: 'எப்போதும், அன்புடன் மரச்செக்கில்.',

  chatTitle: 'எங்களுடன் அரட்டை',
  chatReply: 'சில மணி நேரங்களில் பதிலளிப்போம்',
  chatLoginText: 'எங்கள் குழுவுடன் அரட்டையடிக்க உங்கள் மொபைல் எண்ணில் உள்நுழையவும்.',
  chatLoginBtn: 'உள்நுழைந்து அரட்டையடிக்க',
  chatPlaceholder: 'செய்தியை உள்ளிடவும்…',
  chatSend: 'அனுப்பு',
  chatGreeting: 'வணக்கம்! 🙏 எங்கள் பொருட்கள், உங்கள் ஆர்டர் அல்லது மொத்த விலை பற்றி எதுவும் கேளுங்கள்.',
};

const dictionaries = { en, hi, ta };

const LangContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('yo_lang');
    return dictionaries[saved] ? saved : 'en';
  });

  function setLang(code) {
    if (!dictionaries[code]) return;
    localStorage.setItem('yo_lang', code);
    setLangState(code);
    document.documentElement.lang = code;
  }

  function t(key) {
    return dictionaries[lang][key] ?? en[key] ?? key;
  }

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
