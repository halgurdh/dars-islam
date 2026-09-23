import { getLang, type LangMode } from './systems/Locale';

export interface Strings {
  navDashboard: string;
  navTeacher: string;
  navParent: string;
  signIn: string;
  signOut: string;
  signedIn: string;

  heroFreeTitle: string;
  heroFreeDesc: string;
  heroForTitle: string;
  heroForDesc: string;
  heroIslamicTitle: string;
  heroIslamicDesc: string;
  heroSyncTitle: string;
  heroSyncDesc: string;

  chooseGame: string;
  chooseGameSub: string;
  catAll: string;
  catIslamic: string;
  catMath: string;
  catEarly: string;
  catGeneral: string;

  donateTitle: string;
  donateBody: string;
  donateBtn: string;
  donateNotNow: string;

  footerTagline: string;
  footerStudio: string;
  footerContact: string;
  footerSource: string;
  footerLegal: string;
  footerTerms: string;
  footerPrivacy: string;
  footerSupportHeading: string;
  footerDonate: string;
  footerDisclaimer: string;
  footerDisclaimerLink: string;
  footerPlayMore: string;
  footerRights: string;
}

export const STRINGS: Record<LangMode, Strings> = {
  en: {
    navDashboard: '📊 My Dashboard',
    navTeacher: '🏫 Teacher Dashboard',
    navParent: '👪 Parent Dashboard',
    signIn: '☁ Sign in',
    signOut: 'Sign out',
    signedIn: 'Signed in',

    heroFreeTitle: 'FREE & AD-FREE',
    heroFreeDesc: 'No cost, no ads — donations are optional.',
    heroForTitle: 'FOR SCHOOLS & FAMILIES',
    heroForDesc: 'Built for students, teachers, parents, and mosques.',
    heroIslamicTitle: 'ISLAMIC STUDIES + MORE',
    heroIslamicDesc: 'Quran, duas, Arabic, plus math, science and other school subjects.',
    heroSyncTitle: 'Multiple Device Sync',
    heroSyncDesc: 'Play on any device and pick up right where you left off.',

    chooseGame: 'Choose a Game',
    chooseGameSub: 'Free to play, no account needed.',
    catAll: 'All Games',
    catIslamic: '🕌 Islamic Studies',
    catMath: '🔢 Math',
    catEarly: '🧸 Early Learning',
    catGeneral: '🌍 General Subjects',

    donateTitle: 'This is free and ad-free by choice.',
    donateBody: 'If your family gets value from it, a donation helps keep it that way.',
    donateBtn: 'Donate now',
    donateNotNow: 'Not now',

    footerTagline: 'Free educational games for Islamic studies and general school subjects.',
    footerStudio: 'Studio',
    footerContact: 'Contact',
    footerSource: 'Source Code',
    footerLegal: 'Legal',
    footerTerms: 'Terms of Service',
    footerPrivacy: 'Privacy Policy',
    footerSupportHeading: 'Support this project',
    footerDonate: '💛 Donate via PayPal',
    footerDisclaimer: '⚠️ Built with AI assistance — not professionally audited, and Islamic content has not been reviewed by a qualified scholar. However, all the information is fetched from reliable sources such as quran.com, sunnah.com and islamqa.info/en. Verify anything important independently. See',
    footerDisclaimerLink: 'Terms',
    footerPlayMore: 'PLAY MORE. SMILE MORE.',
    footerRights: 'All rights reserved',
  },
  nl: {
    navDashboard: '📊 Mijn Dashboard',
    navTeacher: '🏫 Docentendashboard',
    navParent: '👪 Ouderdashboard',
    signIn: '☁ Inloggen',
    signOut: 'Uitloggen',
    signedIn: 'Ingelogd',

    heroFreeTitle: 'GRATIS & ADVERTENTIEVRIJ',
    heroFreeDesc: 'Geen kosten, geen advertenties — doneren is optioneel.',
    heroForTitle: 'VOOR SCHOLEN & GEZINNEN',
    heroForDesc: 'Gemaakt voor leerlingen, leerkrachten, ouders en moskeeën.',
    heroIslamicTitle: 'ISLAMITISCHE STUDIES + MEER',
    heroIslamicDesc: 'Koran, smeekbeden, Arabisch, plus rekenen, wetenschap en andere schoolvakken.',
    heroSyncTitle: 'Synchroniseren tussen apparaten',
    heroSyncDesc: 'Speel op elk apparaat en ga verder waar je gebleven was.',

    chooseGame: 'Kies een Spel',
    chooseGameSub: 'Gratis te spelen, geen account nodig.',
    catAll: 'Alle Spellen',
    catIslamic: '🕌 Islamitische Studies',
    catMath: '🔢 Rekenen',
    catEarly: '🧸 Vroeg Leren',
    catGeneral: '🌍 Algemene Vakken',

    donateTitle: 'Dit platform is bewust gratis en advertentievrij.',
    donateBody: 'Als jouw gezin er waarde uit haalt, helpt een donatie om dat zo te houden.',
    donateBtn: 'Nu doneren',
    donateNotNow: 'Niet nu',

    footerTagline: 'Gratis educatieve spellen voor islamitische studies en algemene schoolvakken.',
    footerStudio: 'Studio',
    footerContact: 'Contact',
    footerSource: 'Broncode',
    footerLegal: 'Juridisch',
    footerTerms: 'Servicevoorwaarden',
    footerPrivacy: 'Privacybeleid',
    footerSupportHeading: 'Steun dit project',
    footerDonate: '💛 Doneer via PayPal',
    footerDisclaimer: '⚠️ Gebouwd met AI-hulp — niet professioneel gecontroleerd, en islamitische inhoud is niet beoordeeld door een gekwalificeerde geleerde. De informatie is echter afkomstig uit betrouwbare bronnen zoals quran.com, sunnah.com en islamqa.info/en. Controleer belangrijke zaken zelf. Zie',
    footerDisclaimerLink: 'Voorwaarden',
    footerPlayMore: 'SPEEL MEER. LACH MEER.',
    footerRights: 'Alle rechten voorbehouden',
  },
  de: {
    navDashboard: '📊 Mein Dashboard',
    navTeacher: '🏫 Lehrer-Dashboard',
    navParent: '👪 Eltern-Dashboard',
    signIn: '☁ Anmelden',
    signOut: 'Abmelden',
    signedIn: 'Angemeldet',

    heroFreeTitle: 'KOSTENLOS & WERBEFREI',
    heroFreeDesc: 'Keine Kosten, keine Werbung — Spenden sind freiwillig.',
    heroForTitle: 'FÜR SCHULEN & FAMILIEN',
    heroForDesc: 'Gemacht für Schüler, Lehrer, Eltern und Moscheen.',
    heroIslamicTitle: 'ISLAMISCHE STUDIEN + MEHR',
    heroIslamicDesc: 'Koran, Bittgebete, Arabisch, dazu Mathe, Naturwissenschaften und andere Schulfächer.',
    heroSyncTitle: 'Geräteübergreifende Synchronisierung',
    heroSyncDesc: 'Spiele auf jedem Gerät und mach genau dort weiter, wo du aufgehört hast.',

    chooseGame: 'Spiel Auswählen',
    chooseGameSub: 'Kostenlos spielbar, kein Konto nötig.',
    catAll: 'Alle Spiele',
    catIslamic: '🕌 Islamische Studien',
    catMath: '🔢 Mathe',
    catEarly: '🧸 Frühes Lernen',
    catGeneral: '🌍 Allgemeine Fächer',

    donateTitle: 'Diese Plattform ist bewusst kostenlos und werbefrei.',
    donateBody: 'Wenn deine Familie davon profitiert, hilft eine Spende, das so zu halten.',
    donateBtn: 'Jetzt spenden',
    donateNotNow: 'Nicht jetzt',

    footerTagline: 'Kostenlose Lernspiele für islamische Studien und allgemeine Schulfächer.',
    footerStudio: 'Studio',
    footerContact: 'Kontakt',
    footerSource: 'Quellcode',
    footerLegal: 'Rechtliches',
    footerTerms: 'Nutzungsbedingungen',
    footerPrivacy: 'Datenschutzerklärung',
    footerSupportHeading: 'Dieses Projekt unterstützen',
    footerDonate: '💛 Über PayPal spenden',
    footerDisclaimer: '⚠️ Mit KI-Unterstützung erstellt — nicht professionell geprüft, und islamische Inhalte wurden nicht von einem qualifizierten Gelehrten überprüft. Die Informationen stammen jedoch aus zuverlässigen Quellen wie quran.com, sunnah.com und islamqa.info/en. Wichtige Informationen bitte selbst verifizieren. Siehe',
    footerDisclaimerLink: 'Nutzungsbedingungen',
    footerPlayMore: 'MEHR SPIELEN. MEHR LÄCHELN.',
    footerRights: 'Alle Rechte vorbehalten',
  },
  es: {
    navDashboard: '📊 Mi Panel',
    navTeacher: '🏫 Panel del Docente',
    navParent: '👪 Panel de Padres',
    signIn: '☁ Iniciar sesión',
    signOut: 'Cerrar sesión',
    signedIn: 'Sesión iniciada',

    heroFreeTitle: 'GRATIS Y SIN PUBLICIDAD',
    heroFreeDesc: 'Sin costo, sin anuncios — las donaciones son opcionales.',
    heroForTitle: 'PARA ESCUELAS Y FAMILIAS',
    heroForDesc: 'Hecho para alumnos, docentes, padres y mezquitas.',
    heroIslamicTitle: 'ESTUDIOS ISLÁMICOS Y MÁS',
    heroIslamicDesc: 'Corán, súplicas, árabe, además de matemáticas, ciencias y otras asignaturas.',
    heroSyncTitle: 'Sincronización entre dispositivos',
    heroSyncDesc: 'Juega en cualquier dispositivo y continúa justo donde lo dejaste.',

    chooseGame: 'Elige un Juego',
    chooseGameSub: 'Gratis para jugar, no necesitas cuenta.',
    catAll: 'Todos los Juegos',
    catIslamic: '🕌 Estudios Islámicos',
    catMath: '🔢 Matemáticas',
    catEarly: '🧸 Primeros Aprendizajes',
    catGeneral: '🌍 Asignaturas Generales',

    donateTitle: 'Esta plataforma es gratuita y sin publicidad a propósito.',
    donateBody: 'Si tu familia le saca valor, una donación ayuda a mantenerlo así.',
    donateBtn: 'Donar ahora',
    donateNotNow: 'Ahora no',

    footerTagline: 'Juegos educativos gratuitos de estudios islámicos y asignaturas escolares generales.',
    footerStudio: 'Estudio',
    footerContact: 'Contacto',
    footerSource: 'Código Fuente',
    footerLegal: 'Legal',
    footerTerms: 'Términos de Servicio',
    footerPrivacy: 'Política de Privacidad',
    footerSupportHeading: 'Apoya este proyecto',
    footerDonate: '💛 Donar por PayPal',
    footerDisclaimer: '⚠️ Construido con ayuda de IA — no auditado profesionalmente, y el contenido islámico no ha sido revisado por un erudito calificado. Sin embargo, toda la información proviene de fuentes fiables como quran.com, sunnah.com e islamqa.info/en. Verifica cualquier cosa importante de forma independiente. Consulta',
    footerDisclaimerLink: 'Términos',
    footerPlayMore: 'JUEGA MÁS. SONRÍE MÁS.',
    footerRights: 'Todos los derechos reservados',
  },
  fr: {
    navDashboard: '📊 Mon Tableau de Bord',
    navTeacher: '🏫 Tableau de Bord Enseignant',
    navParent: '👪 Tableau de Bord Parent',
    signIn: '☁ Se connecter',
    signOut: 'Se déconnecter',
    signedIn: 'Connecté',

    heroFreeTitle: 'GRATUIT ET SANS PUBLICITÉ',
    heroFreeDesc: "Aucun coût, aucune publicité — les dons sont facultatifs.",
    heroForTitle: 'POUR LES ÉCOLES ET LES FAMILLES',
    heroForDesc: 'Conçu pour les élèves, enseignants, parents et mosquées.',
    heroIslamicTitle: "ÉTUDES ISLAMIQUES ET PLUS",
    heroIslamicDesc: "Coran, invocations, arabe, ainsi que maths, sciences et autres matières scolaires.",
    heroSyncTitle: 'Synchronisation multi-appareils',
    heroSyncDesc: "Joue sur n'importe quel appareil et reprends exactement où tu t'es arrêté.",

    chooseGame: 'Choisis un Jeu',
    chooseGameSub: 'Gratuit, aucun compte nécessaire.',
    catAll: 'Tous les Jeux',
    catIslamic: '🕌 Études Islamiques',
    catMath: '🔢 Maths',
    catEarly: '🧸 Premiers Apprentissages',
    catGeneral: '🌍 Matières Générales',

    donateTitle: 'Cette plateforme est volontairement gratuite et sans publicité.',
    donateBody: "Si ta famille y trouve de la valeur, un don aide à ce que ça le reste.",
    donateBtn: 'Faire un don',
    donateNotNow: 'Pas maintenant',

    footerTagline: "Jeux éducatifs gratuits pour les études islamiques et les matières scolaires générales.",
    footerStudio: 'Studio',
    footerContact: 'Contact',
    footerSource: 'Code Source',
    footerLegal: 'Mentions Légales',
    footerTerms: 'Conditions d\'Utilisation',
    footerPrivacy: 'Politique de Confidentialité',
    footerSupportHeading: 'Soutenir ce projet',
    footerDonate: '💛 Faire un don via PayPal',
    footerDisclaimer: "⚠️ Construit avec l'aide de l'IA — non audité professionnellement, et le contenu islamique n'a pas été relu par un savant qualifié. Toutes les informations proviennent cependant de sources fiables telles que quran.com, sunnah.com et islamqa.info/en. Vérifie indépendamment tout élément important. Voir",
    footerDisclaimerLink: 'les Conditions',
    footerPlayMore: 'JOUE PLUS. SOURIS PLUS.',
    footerRights: 'Tous droits réservés',
  },
  ar: {
    navDashboard: '📊 لوحتي',
    navTeacher: '🏫 لوحة المعلم',
    navParent: '👪 لوحة ولي الأمر',
    signIn: '☁ تسجيل الدخول',
    signOut: 'تسجيل الخروج',
    signedIn: 'تم تسجيل الدخول',

    heroFreeTitle: 'مجاني وخالٍ من الإعلانات',
    heroFreeDesc: 'بدون تكلفة، بدون إعلانات — التبرع اختياري.',
    heroForTitle: 'للمدارس والعائلات',
    heroForDesc: 'مصمم للطلاب والمعلمين وأولياء الأمور والمساجد.',
    heroIslamicTitle: 'الدراسات الإسلامية والمزيد',
    heroIslamicDesc: 'القرآن، الأدعية، اللغة العربية، بالإضافة إلى الرياضيات والعلوم ومواد دراسية أخرى.',
    heroSyncTitle: 'مزامنة بين الأجهزة',
    heroSyncDesc: 'العب على أي جهاز وتابع تمامًا من حيث توقفت.',

    chooseGame: 'اختر لعبة',
    chooseGameSub: 'مجانية للعب، لا حاجة لحساب.',
    catAll: 'كل الألعاب',
    catIslamic: '🕌 الدراسات الإسلامية',
    catMath: '🔢 الرياضيات',
    catEarly: '🧸 التعلم المبكر',
    catGeneral: '🌍 مواد عامة',

    donateTitle: 'هذه المنصة مجانية وخالية من الإعلانات عن قصد.',
    donateBody: 'إذا استفادت عائلتك منها، فإن التبرع يساعد في الحفاظ على ذلك.',
    donateBtn: 'تبرع الآن',
    donateNotNow: 'ليس الآن',

    footerTagline: 'ألعاب تعليمية مجانية للدراسات الإسلامية والمواد الدراسية العامة.',
    footerStudio: 'الاستوديو',
    footerContact: 'تواصل معنا',
    footerSource: 'الكود المصدري',
    footerLegal: 'قانوني',
    footerTerms: 'شروط الخدمة',
    footerPrivacy: 'سياسة الخصوصية',
    footerSupportHeading: 'ادعم هذا المشروع',
    footerDonate: '💛 تبرع عبر PayPal',
    footerDisclaimer: '⚠️ تم بناؤه بمساعدة الذكاء الاصطناعي — لم يخضع لمراجعة احترافية، ولم تتم مراجعة المحتوى الإسلامي من قبل عالم شرعي مؤهَّل. ومع ذلك، جميع المعلومات مأخوذة من مصادر موثوقة مثل quran.com وsunnah.com وislamqa.info/en. يُرجى التحقق من أي معلومة مهمة بشكل مستقل. راجع',
    footerDisclaimerLink: 'الشروط',
    footerPlayMore: 'العب أكثر. ابتسم أكثر.',
    footerRights: 'جميع الحقوق محفوظة',
  },
};

export function t(): Strings {
  return STRINGS[getLang()];
}
