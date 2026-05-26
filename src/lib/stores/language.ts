import { writable, derived } from 'svelte/store';
import type { Language } from '$lib/types/database';

export const currentLanguage = writable<Language>('en');
export const isRTL = derived(currentLanguage, $l => $l === 'ar');

// ── Translation map ─────────────────────────────────────────
const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home', 'nav.atelier': 'Atelier', 'nav.auction': 'Auction',
    'nav.media': 'Media', 'nav.vault': 'Vault', 'nav.profile': 'Profile',
    'atelier.title': 'Commission a Masterpiece',
    'auction.title': 'Live Auction Protocol',
    'prestige.citizen': 'Citizen', 'prestige.patron': 'Patron',
    'prestige.curator': 'Curator', 'prestige.vanguard': 'Vanguard',
    'prestige.elite': 'Daraja Elite',
    'action.bid': 'Place Bid', 'action.commission': 'Commission',
    'action.save': 'Save to Vault', 'action.view': 'View Archive',
  },
  ha: {
    'nav.home': 'Gida', 'nav.atelier': 'Masaka', 'nav.auction': 'Gwanjo',
    'nav.media': 'Watsa', 'nav.vault': 'Ajiya', 'nav.profile': 'Bayani',
    'atelier.title': 'Yi Kwamiti Aiki',
    'auction.title': 'Zauren Gwanjo',
    'prestige.citizen': 'Ɗan ƙasa', 'prestige.patron': 'Mai Goyon Baya',
    'prestige.curator': 'Mai Kula', 'prestige.vanguard': 'Jagora',
    'prestige.elite': 'Daraja Elite',
    'action.bid': 'Sanya Farashi', 'action.commission': 'Kwamiti',
    'action.save': 'Ajiye', 'action.view': 'Duba',
  },
  yo: {
    'nav.home': 'Ilé', 'nav.atelier': 'Aṣọ', 'nav.auction': 'Àìsọdè',
    'nav.media': 'Ìgbòhùnsafẹ́fẹ́', 'nav.vault': 'Ilépa', 'nav.profile': 'Profaili',
    'atelier.title': 'Ṣe Àṣẹ Ará',
    'auction.title': 'Àìsọdè Lọ́wọ́',
    'prestige.citizen': 'Ọmọ Ìlú', 'prestige.patron': 'Olùtìlẹyìn',
    'prestige.curator': 'Alábòójútó', 'prestige.vanguard': 'Olùdarí',
    'prestige.elite': 'Daraja Elite',
    'action.bid': 'Fi Èdè', 'action.commission': 'Àṣẹ',
    'action.save': 'Fi Pamọ́', 'action.view': 'Wo',
  },
  ig: {
    'nav.home': 'Ụlọ', 'nav.atelier': 'Akwa', 'nav.auction': 'Ịzụ ahịa',
    'nav.media': 'Ozi', 'nav.vault': 'Ọchịchọ', 'nav.profile': 'Profaịlụ',
    'atelier.title': 'Ṅọọ Ọrụ',
    'auction.title': 'Ịzụ Ahịa Ndị Dị Ndụ',
    'prestige.citizen': 'Onye obodo', 'prestige.patron': 'Onye nkwado',
    'prestige.curator': 'Onye nleba', 'prestige.vanguard': 'Onye nlọghachi',
    'prestige.elite': 'Daraja Elite',
    'action.bid': 'Tụọ Ọnụ ahịa', 'action.commission': 'Ṅọọ',
    'action.save': 'Chekwaa', 'action.view': 'Lee',
  },
  fr: {
    'nav.home': 'Accueil', 'nav.atelier': 'Atelier', 'nav.auction': 'Enchères',
    'nav.media': 'Médias', 'nav.vault': 'Coffre', 'nav.profile': 'Profil',
    'atelier.title': 'Commander un Chef-d\'Œuvre',
    'auction.title': 'Protocole d\'Enchères en Direct',
    'prestige.citizen': 'Citoyen', 'prestige.patron': 'Mécène',
    'prestige.curator': 'Curateur', 'prestige.vanguard': 'Avant-Garde',
    'prestige.elite': 'Daraja Élite',
    'action.bid': 'Enchérir', 'action.commission': 'Commander',
    'action.save': 'Sauvegarder', 'action.view': 'Voir les Archives',
  },
  ar: {
    'nav.home': 'الرئيسية', 'nav.atelier': 'الأتيليه', 'nav.auction': 'المزاد',
    'nav.media': 'الإعلام', 'nav.vault': 'الخزينة', 'nav.profile': 'الملف الشخصي',
    'atelier.title': 'طلب تحفة فنية',
    'auction.title': 'بروتوكول المزاد المباشر',
    'prestige.citizen': 'مواطن', 'prestige.patron': 'راعٍ',
    'prestige.curator': 'أمين المتحف', 'prestige.vanguard': 'الطليعة',
    'prestige.elite': 'داراجا النخبة',
    'action.bid': 'تقديم عرض', 'action.commission': 'طلب',
    'action.save': 'حفظ', 'action.view': 'عرض الأرشيف',
  },
};

export function t(key: string, lang: Language = 'en'): string {
  return translations[lang]?.[key] ?? translations['en'][key] ?? key;
}

export function setLanguage(lang: Language) {
  currentLanguage.set(lang);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
  }
  if (typeof localStorage !== 'undefined') localStorage.setItem('hd_lang', lang);
}
