import { createLocale, type LangMode } from './locale';

// Independent of any game's own language — the widget is injected into
// every game AND the wrapper from one shared module instantiated once at
// import time (shared/quiz-kit.ts), so it can't know "which game's language
// is active" without much riskier changes to that shared boot path. It gets
// its own small flag picker instead (see openAuth()/openPanel() below).
export const { getLang, setLang, detectDefaultLang } = createLocale('progress-bar');

export interface Strings {
  showProgress: string;
  hideProgress: string;
  tabProgress: string;
  tabLeaderboard: string;
  xpToLevel: (into: number, need: number, nextLevel: number, rounds: number) => string;
  dayStreak: (n: number) => string;
  namePlaceholderStudent: string;
  namePlaceholderDefault: string;
  save: string;
  syncedAs: (email: string) => string;
  synced: string;
  signInToSave: string;
  linkDashboard: string;
  linkTeacher: string;
  linkParent: string;
  loading: string;
  noEntriesYet: string;
  lvl: (n: number) => string;
  leaderboardError: string;

  syncProgressTitle: string;
  syncProgressBody: string;
  emailPlaceholder: string;
  sendMagicLink: string;
  back: string;
  registerTeacherIntro: string;
  registerTeacherStrong: string;
  registerTeacherLink: string;
  registerTeacherOutro: string;
  registerParentIntro: string;
  registerParentStrong: string;
  registerParentLink: string;
  enterEmailFirst: string;
  sending: string;
  checkEmailTitle: string;
  linkSentTo: (email: string) => string;
  sendFailed: string;

  toastLevelUp: (level: number) => string;
  toastStreak: (n: number) => string;
  toastNewBadge: (name: string) => string;
}

export const STRINGS: Record<LangMode, Strings> = {
  en: {
    showProgress: 'Show progress',
    hideProgress: 'Hide progress',
    tabProgress: '📈 Progress',
    tabLeaderboard: '🏆 Leaderboard',
    xpToLevel: (into, need, nextLevel, rounds) => `${into} / ${need} XP to level ${nextLevel} · ${rounds} rounds played`,
    dayStreak: (n) => `${n}-day streak`,
    namePlaceholderStudent: 'Your name (visible to your teacher)',
    namePlaceholderDefault: 'Your name on the leaderboard',
    save: 'Save',
    syncedAs: (email) => `☁ Synced as ${email}`,
    synced: '☁ Synced',
    signInToSave: '☁ Sign in to save & join leaderboard',
    linkDashboard: '📊 My Dashboard',
    linkTeacher: '🏫 Teacher Dashboard',
    linkParent: '👪 Parent Dashboard',
    loading: 'Loading…',
    noEntriesYet: 'No entries yet — sign in and play to be the first!',
    lvl: (n) => `Lvl ${n}`,
    leaderboardError: 'Couldn’t load the leaderboard — try again later.',

    syncProgressTitle: '☁ Sync Progress',
    syncProgressBody: "Enter your email — we'll send a magic link. No password needed.",
    emailPlaceholder: 'you@example.com',
    sendMagicLink: 'Send Magic Link',
    back: '← Back',
    registerTeacherIntro: 'Registering as a',
    registerTeacherStrong: 'teacher, mosque, or school',
    registerTeacherLink: 'Teacher Dashboard',
    registerTeacherOutro: 'instead — it sets up your account automatically.',
    registerParentIntro: 'Registering as a',
    registerParentStrong: 'parent',
    registerParentLink: 'Parent Dashboard',
    enterEmailFirst: 'Please enter your email.',
    sending: 'Sending…',
    checkEmailTitle: '✉ Check your email!',
    linkSentTo: (email) => `Link sent to <strong>${email}</strong>. Click it to sign in.`,
    sendFailed: 'Could not send — try again.',

    toastLevelUp: (level) => `🎉 Level ${level}!`,
    toastStreak: (n) => `🔥 ${n}-day streak`,
    toastNewBadge: (name) => `New badge: ${name}`,
  },
  nl: {
    showProgress: 'Toon voortgang',
    hideProgress: 'Verberg voortgang',
    tabProgress: '📈 Voortgang',
    tabLeaderboard: '🏆 Scorebord',
    xpToLevel: (into, need, nextLevel, rounds) => `${into} / ${need} XP tot level ${nextLevel} · ${rounds} rondes gespeeld`,
    dayStreak: (n) => `${n}-daagse reeks`,
    namePlaceholderStudent: 'Jouw naam (zichtbaar voor je leerkracht)',
    namePlaceholderDefault: 'Jouw naam op het scorebord',
    save: 'Opslaan',
    syncedAs: (email) => `☁ Gesynchroniseerd als ${email}`,
    synced: '☁ Gesynchroniseerd',
    signInToSave: '☁ Log in om op te slaan & mee te doen aan het scorebord',
    linkDashboard: '📊 Mijn Dashboard',
    linkTeacher: '🏫 Docentendashboard',
    linkParent: '👪 Ouderdashboard',
    loading: 'Laden…',
    noEntriesYet: 'Nog geen resultaten — log in en speel om de eerste te zijn!',
    lvl: (n) => `Lvl ${n}`,
    leaderboardError: 'Kon het scorebord niet laden — probeer het later opnieuw.',

    syncProgressTitle: '☁ Voortgang Synchroniseren',
    syncProgressBody: 'Vul je e-mailadres in — we sturen een magische link. Geen wachtwoord nodig.',
    emailPlaceholder: 'jij@voorbeeld.com',
    sendMagicLink: 'Verstuur Magische Link',
    back: '← Terug',
    registerTeacherIntro: 'Registreren als',
    registerTeacherStrong: 'leerkracht, moskee of school',
    registerTeacherLink: 'Docentendashboard',
    registerTeacherOutro: '— dat stelt je account automatisch in.',
    registerParentIntro: 'Registreren als',
    registerParentStrong: 'ouder',
    registerParentLink: 'Ouderdashboard',
    enterEmailFirst: 'Vul je e-mailadres in.',
    sending: 'Versturen…',
    checkEmailTitle: '✉ Controleer je e-mail!',
    linkSentTo: (email) => `Link verstuurd naar <strong>${email}</strong>. Klik erop om in te loggen.`,
    sendFailed: 'Versturen mislukt — probeer het opnieuw.',

    toastLevelUp: (level) => `🎉 Level ${level}!`,
    toastStreak: (n) => `🔥 ${n}-daagse reeks`,
    toastNewBadge: (name) => `Nieuwe badge: ${name}`,
  },
  de: {
    showProgress: 'Fortschritt anzeigen',
    hideProgress: 'Fortschritt ausblenden',
    tabProgress: '📈 Fortschritt',
    tabLeaderboard: '🏆 Bestenliste',
    xpToLevel: (into, need, nextLevel, rounds) => `${into} / ${need} XP bis Level ${nextLevel} · ${rounds} Runden gespielt`,
    dayStreak: (n) => `${n}-Tage-Serie`,
    namePlaceholderStudent: 'Dein Name (für deine Lehrkraft sichtbar)',
    namePlaceholderDefault: 'Dein Name auf der Bestenliste',
    save: 'Speichern',
    syncedAs: (email) => `☁ Synchronisiert als ${email}`,
    synced: '☁ Synchronisiert',
    signInToSave: '☁ Anmelden zum Speichern & für die Bestenliste',
    linkDashboard: '📊 Mein Dashboard',
    linkTeacher: '🏫 Lehrer-Dashboard',
    linkParent: '👪 Eltern-Dashboard',
    loading: 'Lädt…',
    noEntriesYet: 'Noch keine Einträge — melde dich an und spiele als Erste(r)!',
    lvl: (n) => `Lvl ${n}`,
    leaderboardError: 'Bestenliste konnte nicht geladen werden — später erneut versuchen.',

    syncProgressTitle: '☁ Fortschritt Synchronisieren',
    syncProgressBody: 'Gib deine E-Mail-Adresse ein — wir senden einen Magic Link. Kein Passwort nötig.',
    emailPlaceholder: 'du@beispiel.com',
    sendMagicLink: 'Magic Link Senden',
    back: '← Zurück',
    registerTeacherIntro: 'Registrierst du dich als',
    registerTeacherStrong: 'Lehrkraft, Moschee oder Schule',
    registerTeacherLink: 'Lehrer-Dashboard',
    registerTeacherOutro: '— das richtet dein Konto automatisch ein.',
    registerParentIntro: 'Registrierst du dich als',
    registerParentStrong: 'Elternteil',
    registerParentLink: 'Eltern-Dashboard',
    enterEmailFirst: 'Bitte gib deine E-Mail-Adresse ein.',
    sending: 'Wird gesendet…',
    checkEmailTitle: '✉ Prüfe deine E-Mails!',
    linkSentTo: (email) => `Link gesendet an <strong>${email}</strong>. Klicke darauf, um dich anzumelden.`,
    sendFailed: 'Senden fehlgeschlagen — bitte erneut versuchen.',

    toastLevelUp: (level) => `🎉 Level ${level}!`,
    toastStreak: (n) => `🔥 ${n}-Tage-Serie`,
    toastNewBadge: (name) => `Neues Abzeichen: ${name}`,
  },
  es: {
    showProgress: 'Mostrar progreso',
    hideProgress: 'Ocultar progreso',
    tabProgress: '📈 Progreso',
    tabLeaderboard: '🏆 Clasificación',
    xpToLevel: (into, need, nextLevel, rounds) => `${into} / ${need} XP para el nivel ${nextLevel} · ${rounds} rondas jugadas`,
    dayStreak: (n) => `racha de ${n} días`,
    namePlaceholderStudent: 'Tu nombre (visible para tu docente)',
    namePlaceholderDefault: 'Tu nombre en la clasificación',
    save: 'Guardar',
    syncedAs: (email) => `☁ Sincronizado como ${email}`,
    synced: '☁ Sincronizado',
    signInToSave: '☁ Inicia sesión para guardar y unirte a la clasificación',
    linkDashboard: '📊 Mi Panel',
    linkTeacher: '🏫 Panel del Docente',
    linkParent: '👪 Panel de Padres',
    loading: 'Cargando…',
    noEntriesYet: '¡Aún no hay entradas — inicia sesión y juega para ser el primero!',
    lvl: (n) => `Nvl ${n}`,
    leaderboardError: 'No se pudo cargar la clasificación — inténtalo más tarde.',

    syncProgressTitle: '☁ Sincronizar Progreso',
    syncProgressBody: 'Introduce tu correo — te enviaremos un enlace mágico. No hace falta contraseña.',
    emailPlaceholder: 'tu@ejemplo.com',
    sendMagicLink: 'Enviar Enlace Mágico',
    back: '← Atrás',
    registerTeacherIntro: 'Te registras como',
    registerTeacherStrong: 'docente, mezquita o escuela',
    registerTeacherLink: 'Panel del Docente',
    registerTeacherOutro: '— configura tu cuenta automáticamente.',
    registerParentIntro: 'Te registras como',
    registerParentStrong: 'padre o madre',
    registerParentLink: 'Panel de Padres',
    enterEmailFirst: 'Por favor, introduce tu correo.',
    sending: 'Enviando…',
    checkEmailTitle: '✉ ¡Revisa tu correo!',
    linkSentTo: (email) => `Enlace enviado a <strong>${email}</strong>. Haz clic en él para iniciar sesión.`,
    sendFailed: 'No se pudo enviar — inténtalo de nuevo.',

    toastLevelUp: (level) => `🎉 ¡Nivel ${level}!`,
    toastStreak: (n) => `🔥 racha de ${n} días`,
    toastNewBadge: (name) => `Nueva insignia: ${name}`,
  },
  fr: {
    showProgress: 'Afficher la progression',
    hideProgress: 'Masquer la progression',
    tabProgress: '📈 Progression',
    tabLeaderboard: '🏆 Classement',
    xpToLevel: (into, need, nextLevel, rounds) => `${into} / ${need} XP avant le niveau ${nextLevel} · ${rounds} manches jouées`,
    dayStreak: (n) => `série de ${n} jours`,
    namePlaceholderStudent: 'Ton nom (visible par ton enseignant)',
    namePlaceholderDefault: 'Ton nom dans le classement',
    save: 'Enregistrer',
    syncedAs: (email) => `☁ Synchronisé en tant que ${email}`,
    synced: '☁ Synchronisé',
    signInToSave: '☁ Connecte-toi pour sauvegarder et rejoindre le classement',
    linkDashboard: '📊 Mon Tableau de Bord',
    linkTeacher: '🏫 Tableau de Bord Enseignant',
    linkParent: '👪 Tableau de Bord Parent',
    loading: 'Chargement…',
    noEntriesYet: "Pas encore d'entrées — connecte-toi et joue pour être le premier !",
    lvl: (n) => `Niv ${n}`,
    leaderboardError: 'Impossible de charger le classement — réessaie plus tard.',

    syncProgressTitle: '☁ Synchroniser la Progression',
    syncProgressBody: "Entre ton e-mail — nous t'enverrons un lien magique. Aucun mot de passe nécessaire.",
    emailPlaceholder: 'toi@exemple.com',
    sendMagicLink: 'Envoyer le Lien Magique',
    back: '← Retour',
    registerTeacherIntro: "Tu t'inscris en tant que",
    registerTeacherStrong: 'enseignant, mosquée ou école',
    registerTeacherLink: 'Tableau de Bord Enseignant',
    registerTeacherOutro: '— il configure ton compte automatiquement.',
    registerParentIntro: "Tu t'inscris en tant que",
    registerParentStrong: 'parent',
    registerParentLink: 'Tableau de Bord Parent',
    enterEmailFirst: 'Merci de saisir ton e-mail.',
    sending: 'Envoi…',
    checkEmailTitle: '✉ Vérifie tes e-mails !',
    linkSentTo: (email) => `Lien envoyé à <strong>${email}</strong>. Clique dessus pour te connecter.`,
    sendFailed: "Échec de l'envoi — réessaie.",

    toastLevelUp: (level) => `🎉 Niveau ${level} !`,
    toastStreak: (n) => `🔥 série de ${n} jours`,
    toastNewBadge: (name) => `Nouveau badge : ${name}`,
  },
  ar: {
    showProgress: 'إظهار التقدم',
    hideProgress: 'إخفاء التقدم',
    tabProgress: '📈 التقدم',
    tabLeaderboard: '🏆 المتصدرون',
    xpToLevel: (into, need, nextLevel, rounds) => `${into} / ${need} نقطة خبرة للمستوى ${nextLevel} · ${rounds} جولة تم لعبها`,
    dayStreak: (n) => `سلسلة ${n} أيام`,
    namePlaceholderStudent: 'اسمك (مرئي لمعلمك)',
    namePlaceholderDefault: 'اسمك في لوحة المتصدرين',
    save: 'حفظ',
    syncedAs: (email) => `☁ تمت المزامنة باسم ${email}`,
    synced: '☁ تمت المزامنة',
    signInToSave: '☁ سجّل الدخول للحفظ والانضمام إلى لوحة المتصدرين',
    linkDashboard: '📊 لوحتي',
    linkTeacher: '🏫 لوحة المعلم',
    linkParent: '👪 لوحة ولي الأمر',
    loading: 'جارٍ التحميل…',
    noEntriesYet: 'لا توجد نتائج بعد — سجّل الدخول والعب لتكون الأول!',
    lvl: (n) => `المستوى ${n}`,
    leaderboardError: 'تعذر تحميل لوحة المتصدرين — حاول مرة أخرى لاحقًا.',

    syncProgressTitle: '☁ مزامنة التقدم',
    syncProgressBody: 'أدخل بريدك الإلكتروني — سنرسل لك رابط دخول سحري. لا حاجة لكلمة مرور.',
    emailPlaceholder: 'you@example.com',
    sendMagicLink: 'إرسال الرابط السحري',
    back: '← رجوع',
    registerTeacherIntro: 'هل تسجّل كـ',
    registerTeacherStrong: 'معلم أو مسجد أو مدرسة',
    registerTeacherLink: 'لوحة المعلم',
    registerTeacherOutro: '— فهي تُعدّ حسابك تلقائيًا.',
    registerParentIntro: 'هل تسجّل كـ',
    registerParentStrong: 'ولي أمر',
    registerParentLink: 'لوحة ولي الأمر',
    enterEmailFirst: 'يرجى إدخال بريدك الإلكتروني.',
    sending: 'جارٍ الإرسال…',
    checkEmailTitle: '✉ تحقق من بريدك الإلكتروني!',
    linkSentTo: (email) => `تم إرسال رابط إلى <strong>${email}</strong>. اضغط عليه لتسجيل الدخول.`,
    sendFailed: 'تعذر الإرسال — حاول مرة أخرى.',

    toastLevelUp: (level) => `🎉 المستوى ${level}!`,
    toastStreak: (n) => `🔥 سلسلة ${n} أيام`,
    toastNewBadge: (name) => `وسام جديد: ${name}`,
  },
};

export function t(): Strings {
  return STRINGS[getLang()];
}
