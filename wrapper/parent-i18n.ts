import { getLang, type LangMode } from './systems/Locale';

export interface Strings {
  backToGames: string;
  title: string;
  subtitle: string;

  signInRequiredHeading: string;
  signInRequiredBody: string;

  linkChildHeading: string;
  linkChildSub: string;
  familyCodePlaceholder: string;
  linkBtn: string;
  linking: string;
  linked: string;
  couldNotLink: string;

  screenTimeHeading: string;
  dailyLimitLabel: string;
  dailyLimitPlaceholder: string;
  blockedGamesLabel: string;
  saveControlsBtn: string;
  saving: string;
  saved: string;
  couldNotSave: string;

  yourChildLabel: string;
  progressSuffix: (name: string) => string;
  levelStreakXp: (level: number, streak: number, best: number, xp: number) => string;
  attendanceLabel: (pct: number) => string;
  inactiveNote: string;
  noBadgesYet: string;
  reportCardHeading: string;
  reportCardSub: string;
  certificateBtn: (title: string) => string;
  certificateAchievement: (title: string) => string;
  defaultStudentName: string;

  announcementsHeading: (className: string) => string;

  yourChildrenHeading: string;
  levelWord: string;

  couldNotLoadChildren: string;
}

export const STRINGS: Record<LangMode, Strings> = {
  en: {
    backToGames: '← Back to games',
    title: '👪 Parent Dashboard',
    subtitle: "Link your child's account to see their progress and set limits.",

    signInRequiredHeading: 'Sign In Required',
    signInRequiredBody: "Sign in with the same email you'll use for dars-islam to link your child's account.",

    linkChildHeading: 'Link a Child',
    linkChildSub: 'Ask your child to open "My Dashboard" and share their Family Code.',
    familyCodePlaceholder: 'Family code (e.g. AB12CD)',
    linkBtn: 'Link',
    linking: 'Linking…',
    linked: 'Linked! Loading…',
    couldNotLink: 'Could not link — check the code and try again.',

    screenTimeHeading: 'Screen Time & Content Limits',
    dailyLimitLabel: 'Daily time limit (minutes, blank = no limit)',
    dailyLimitPlaceholder: 'e.g. 60',
    blockedGamesLabel: 'Blocked games:',
    saveControlsBtn: 'Save Controls',
    saving: 'Saving…',
    saved: 'Saved!',
    couldNotSave: 'Could not save — try again.',

    yourChildLabel: 'Your child',
    progressSuffix: (name) => `${name}'s Progress`,
    levelStreakXp: (level, streak, best, xp) => `⭐ Level ${level} · 🔥 ${streak}-day streak (best ${best}) · ${xp} XP`,
    attendanceLabel: (pct) => `🗓️ Attendance: ${pct}%`,
    inactiveNote: "👋 Hasn't played in a few days — might enjoy a nudge to jump back in.",
    noBadgesYet: 'No badges yet.',
    reportCardHeading: 'Report Card',
    reportCardSub: "A lenient, per-game read on practice — there's no failing grade.",
    certificateBtn: (title) => `🏅 ${title} certificate`,
    certificateAchievement: (title) => `Gold-level practice in ${title}`,
    defaultStudentName: 'Student',

    announcementsHeading: (className) => `📣 From ${className}'s Teacher`,

    yourChildrenHeading: 'Your Children',
    levelWord: 'Level',

    couldNotLoadChildren: 'Could not load your linked children.',
  },
  nl: {
    backToGames: '← Terug naar spellen',
    title: '👪 Ouderdashboard',
    subtitle: 'Koppel het account van je kind om hun voortgang te zien en limieten in te stellen.',

    signInRequiredHeading: 'Inloggen Vereist',
    signInRequiredBody: 'Log in met hetzelfde e-mailadres dat je voor dars-islam gebruikt om het account van je kind te koppelen.',

    linkChildHeading: 'Koppel een Kind',
    linkChildSub: 'Vraag je kind om "Mijn Dashboard" te openen en hun Familiecode te delen.',
    familyCodePlaceholder: 'Familiecode (bijv. AB12CD)',
    linkBtn: 'Koppelen',
    linking: 'Bezig met koppelen…',
    linked: 'Gekoppeld! Laden…',
    couldNotLink: 'Kon niet koppelen — controleer de code en probeer opnieuw.',

    screenTimeHeading: 'Schermtijd & Inhoudslimieten',
    dailyLimitLabel: 'Dagelijkse tijdslimiet (minuten, leeg = geen limiet)',
    dailyLimitPlaceholder: 'bijv. 60',
    blockedGamesLabel: 'Geblokkeerde spellen:',
    saveControlsBtn: 'Instellingen Opslaan',
    saving: 'Bezig met opslaan…',
    saved: 'Opgeslagen!',
    couldNotSave: 'Kon niet opslaan — probeer opnieuw.',

    yourChildLabel: 'Je kind',
    progressSuffix: (name) => `Voortgang van ${name}`,
    levelStreakXp: (level, streak, best, xp) => `⭐ Level ${level} · 🔥 ${streak}-daagse reeks (beste ${best}) · ${xp} XP`,
    attendanceLabel: (pct) => `🗓️ Aanwezigheid: ${pct}%`,
    inactiveNote: '👋 Heeft al een paar dagen niet gespeeld — een duwtje kan geen kwaad.',
    noBadgesYet: 'Nog geen badges.',
    reportCardHeading: 'Rapport',
    reportCardSub: 'Een milde, per-spel blik op de oefening — er is geen onvoldoende.',
    certificateBtn: (title) => `🏅 Certificaat ${title}`,
    certificateAchievement: (title) => `Goud-niveau oefening in ${title}`,
    defaultStudentName: 'Leerling',

    announcementsHeading: (className) => `📣 Van de leerkracht van ${className}`,

    yourChildrenHeading: 'Jouw Kinderen',
    levelWord: 'Level',

    couldNotLoadChildren: 'Kon je gekoppelde kinderen niet laden.',
  },
  de: {
    backToGames: '← Zurück zu den Spielen',
    title: '👪 Eltern-Dashboard',
    subtitle: 'Verknüpfe das Konto deines Kindes, um seinen Fortschritt zu sehen und Grenzen festzulegen.',

    signInRequiredHeading: 'Anmeldung Erforderlich',
    signInRequiredBody: 'Melde dich mit derselben E-Mail-Adresse an, die du für dars-islam verwenden wirst, um das Konto deines Kindes zu verknüpfen.',

    linkChildHeading: 'Kind Verknüpfen',
    linkChildSub: 'Bitte dein Kind, "Mein Dashboard" zu öffnen und seinen Familiencode zu teilen.',
    familyCodePlaceholder: 'Familiencode (z. B. AB12CD)',
    linkBtn: 'Verknüpfen',
    linking: 'Wird verknüpft…',
    linked: 'Verknüpft! Wird geladen…',
    couldNotLink: 'Verknüpfung fehlgeschlagen — überprüfe den Code und versuche es erneut.',

    screenTimeHeading: 'Bildschirmzeit & Inhaltsgrenzen',
    dailyLimitLabel: 'Tägliches Zeitlimit (Minuten, leer = kein Limit)',
    dailyLimitPlaceholder: 'z. B. 60',
    blockedGamesLabel: 'Blockierte Spiele:',
    saveControlsBtn: 'Einstellungen Speichern',
    saving: 'Wird gespeichert…',
    saved: 'Gespeichert!',
    couldNotSave: 'Konnte nicht gespeichert werden — bitte erneut versuchen.',

    yourChildLabel: 'Dein Kind',
    progressSuffix: (name) => `Fortschritt von ${name}`,
    levelStreakXp: (level, streak, best, xp) => `⭐ Level ${level} · 🔥 ${streak}-Tage-Serie (beste ${best}) · ${xp} XP`,
    attendanceLabel: (pct) => `🗓️ Anwesenheit: ${pct}%`,
    inactiveNote: '👋 Hat seit ein paar Tagen nicht gespielt — ein kleiner Anstoß könnte helfen.',
    noBadgesYet: 'Noch keine Abzeichen.',
    reportCardHeading: 'Zeugnis',
    reportCardSub: 'Ein nachsichtiger Blick auf die Übung pro Spiel — es gibt keine Note „ungenügend".',
    certificateBtn: (title) => `🏅 Zertifikat ${title}`,
    certificateAchievement: (title) => `Gold-Niveau-Übung in ${title}`,
    defaultStudentName: 'Schüler',

    announcementsHeading: (className) => `📣 Von der Lehrkraft von ${className}`,

    yourChildrenHeading: 'Deine Kinder',
    levelWord: 'Level',

    couldNotLoadChildren: 'Deine verknüpften Kinder konnten nicht geladen werden.',
  },
  es: {
    backToGames: '← Volver a los juegos',
    title: '👪 Panel de Padres',
    subtitle: 'Vincula la cuenta de tu hijo/a para ver su progreso y establecer límites.',

    signInRequiredHeading: 'Inicio de Sesión Requerido',
    signInRequiredBody: 'Inicia sesión con el mismo correo que usarás para dars-islam para vincular la cuenta de tu hijo/a.',

    linkChildHeading: 'Vincular un Hijo/a',
    linkChildSub: 'Pide a tu hijo/a que abra "Mi Panel" y comparta su Código Familiar.',
    familyCodePlaceholder: 'Código familiar (p. ej. AB12CD)',
    linkBtn: 'Vincular',
    linking: 'Vinculando…',
    linked: '¡Vinculado! Cargando…',
    couldNotLink: 'No se pudo vincular — verifica el código e inténtalo de nuevo.',

    screenTimeHeading: 'Tiempo de Pantalla y Límites de Contenido',
    dailyLimitLabel: 'Límite diario de tiempo (minutos, vacío = sin límite)',
    dailyLimitPlaceholder: 'p. ej. 60',
    blockedGamesLabel: 'Juegos bloqueados:',
    saveControlsBtn: 'Guardar Configuración',
    saving: 'Guardando…',
    saved: '¡Guardado!',
    couldNotSave: 'No se pudo guardar — inténtalo de nuevo.',

    yourChildLabel: 'Tu hijo/a',
    progressSuffix: (name) => `Progreso de ${name}`,
    levelStreakXp: (level, streak, best, xp) => `⭐ Nivel ${level} · 🔥 racha de ${streak} días (mejor ${best}) · ${xp} XP`,
    attendanceLabel: (pct) => `🗓️ Asistencia: ${pct}%`,
    inactiveNote: '👋 No ha jugado en unos días — un empujoncito podría animarle.',
    noBadgesYet: 'Aún no hay insignias.',
    reportCardHeading: 'Boletín',
    reportCardSub: 'Una lectura indulgente de la práctica por juego — no hay nota de suspenso.',
    certificateBtn: (title) => `🏅 Certificado de ${title}`,
    certificateAchievement: (title) => `Práctica de nivel oro en ${title}`,
    defaultStudentName: 'Alumno',

    announcementsHeading: (className) => `📣 Del docente de ${className}`,

    yourChildrenHeading: 'Tus Hijos',
    levelWord: 'Nivel',

    couldNotLoadChildren: 'No se pudieron cargar tus hijos vinculados.',
  },
  fr: {
    backToGames: '← Retour aux jeux',
    title: '👪 Tableau de Bord Parent',
    subtitle: "Lie le compte de ton enfant pour voir sa progression et fixer des limites.",

    signInRequiredHeading: 'Connexion Requise',
    signInRequiredBody: "Connecte-toi avec le même e-mail que tu utiliseras pour dars-islam afin de lier le compte de ton enfant.",

    linkChildHeading: 'Lier un Enfant',
    linkChildSub: 'Demande à ton enfant d\'ouvrir « Mon Tableau de Bord » et de partager son Code Familial.',
    familyCodePlaceholder: 'Code familial (ex. AB12CD)',
    linkBtn: 'Lier',
    linking: 'Liaison en cours…',
    linked: 'Lié ! Chargement…',
    couldNotLink: 'Impossible de lier — vérifie le code et réessaie.',

    screenTimeHeading: "Temps d'Écran et Limites de Contenu",
    dailyLimitLabel: 'Limite de temps quotidienne (minutes, vide = pas de limite)',
    dailyLimitPlaceholder: 'ex. 60',
    blockedGamesLabel: 'Jeux bloqués :',
    saveControlsBtn: 'Enregistrer les Réglages',
    saving: 'Enregistrement…',
    saved: 'Enregistré !',
    couldNotSave: "Impossible d'enregistrer — réessaie.",

    yourChildLabel: 'Ton enfant',
    progressSuffix: (name) => `Progression de ${name}`,
    levelStreakXp: (level, streak, best, xp) => `⭐ Niveau ${level} · 🔥 série de ${streak} jours (meilleure ${best}) · ${xp} XP`,
    attendanceLabel: (pct) => `🗓️ Présence : ${pct}%`,
    inactiveNote: "👋 N'a pas joué depuis quelques jours — un petit encouragement pourrait aider.",
    noBadgesYet: 'Pas encore de badges.',
    reportCardHeading: 'Bulletin',
    reportCardSub: "Un aperçu bienveillant de la pratique par jeu — il n'y a pas de note éliminatoire.",
    certificateBtn: (title) => `🏅 Certificat ${title}`,
    certificateAchievement: (title) => `Pratique de niveau or dans ${title}`,
    defaultStudentName: 'Élève',

    announcementsHeading: (className) => `📣 De l'enseignant de ${className}`,

    yourChildrenHeading: 'Tes Enfants',
    levelWord: 'Niveau',

    couldNotLoadChildren: 'Impossible de charger tes enfants liés.',
  },
  ar: {
    backToGames: '← العودة إلى الألعاب',
    title: '👪 لوحة ولي الأمر',
    subtitle: 'اربط حساب طفلك لمشاهدة تقدمه وتحديد الحدود.',

    signInRequiredHeading: 'تسجيل الدخول مطلوب',
    signInRequiredBody: 'سجّل الدخول بنفس البريد الإلكتروني الذي ستستخدمه في dars-islam لربط حساب طفلك.',

    linkChildHeading: 'ربط طفل',
    linkChildSub: 'اطلب من طفلك فتح "لوحتي" ومشاركة رمز العائلة الخاص به.',
    familyCodePlaceholder: 'رمز العائلة (مثال: AB12CD)',
    linkBtn: 'ربط',
    linking: 'جارٍ الربط…',
    linked: 'تم الربط! جارٍ التحميل…',
    couldNotLink: 'تعذر الربط — تحقق من الرمز وحاول مرة أخرى.',

    screenTimeHeading: 'وقت الشاشة وحدود المحتوى',
    dailyLimitLabel: 'الحد الزمني اليومي (بالدقائق، فارغ = بدون حد)',
    dailyLimitPlaceholder: 'مثال: 60',
    blockedGamesLabel: 'الألعاب المحظورة:',
    saveControlsBtn: 'حفظ الإعدادات',
    saving: 'جارٍ الحفظ…',
    saved: 'تم الحفظ!',
    couldNotSave: 'تعذر الحفظ — حاول مرة أخرى.',

    yourChildLabel: 'طفلك',
    progressSuffix: (name) => `تقدم ${name}`,
    levelStreakXp: (level, streak, best, xp) => `⭐ المستوى ${level} · 🔥 سلسلة ${streak} أيام (الأفضل ${best}) · ${xp} نقطة خبرة`,
    attendanceLabel: (pct) => `🗓️ الحضور: ${pct}%`,
    inactiveNote: '👋 لم يلعب منذ بضعة أيام — قد يستمتع بتذكير لطيف للعودة.',
    noBadgesYet: 'لا توجد أوسمة بعد.',
    reportCardHeading: 'التقرير',
    reportCardSub: 'قراءة متساهلة لمدى التدرب على كل لعبة — لا توجد درجة رسوب.',
    certificateBtn: (title) => `🏅 شهادة ${title}`,
    certificateAchievement: (title) => `تدريب بمستوى ذهبي في ${title}`,
    defaultStudentName: 'الطالب',

    announcementsHeading: (className) => `📣 من معلم ${className}`,

    yourChildrenHeading: 'أطفالك',
    levelWord: 'المستوى',

    couldNotLoadChildren: 'تعذر تحميل أطفالك المرتبطين.',
  },
};

export function t(): Strings {
  return STRINGS[getLang()];
}
