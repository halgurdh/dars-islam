import { getLang, type LangMode } from './systems/Locale';

export interface Strings {
  backToGames: string;
  dashboardTitle: string;
  dashboardSub: string;

  levelStreakHeading: string;
  levelText: (n: number) => string;
  streakText: (n: number) => string;
  xpSub: (into: number, need: number, nextLevel: number, rounds: number) => string;

  badgesHeading: string;

  reportCardHeading: string;
  reportCardSub: string;
  reportTableGame: string;
  reportTableRounds: string;
  reportTableGrade: string;
  certificateBtn: string;
  certificateAchievement: (title: string) => string;
  defaultStudentName: string;

  familyCodeHeading: string;
  familyCodeSub: string;

  gotIt: string;

  assignedHeading: string;
  assignedNote: string;
  dueLabel: (date: string) => string;
  wasDueLabel: (date: string) => string;

  announcementsHeading: string;

  myClassHeading: string;
  rankOf: (rank: number, size: number, myXp: number, avgXp: number) => string;

  joinClassHeading: string;
  joinClassSub: string;
  classCodePlaceholder: string;
  yourNamePlaceholder: string;
  joinBtn: string;
  joinNote: string;
  joinErrorBoth: string;
  joining: string;
  joinedReloading: (className: string) => string;
  joinError: string;
  tooManyAttempts: string;
  reportLink: string;
  reportPromptLabel: string;
  reportSentAlert: string;
  reportFailedAlert: string;
}

export const STRINGS: Record<LangMode, Strings> = {
  en: {
    backToGames: '← Back to games',
    dashboardTitle: '📊 My Dashboard',
    dashboardSub: 'Your progress across every game — just for you.',

    levelStreakHeading: 'Level & Streak',
    levelText: (n) => `⭐ Level ${n}`,
    streakText: (n) => `🔥 ${n}-day streak`,
    xpSub: (into, need, nextLevel, rounds) => `${into} / ${need} XP to level ${nextLevel} · ${rounds} rounds played total`,

    badgesHeading: 'Badges',

    reportCardHeading: 'Report Card',
    reportCardSub: "A friendly read on how much you've practiced each game — there's no failing grade, just keep going!",
    reportTableGame: 'Game',
    reportTableRounds: 'Rounds',
    reportTableGrade: 'Grade',
    certificateBtn: '🏅 Certificate',
    certificateAchievement: (title) => `Gold-level practice in ${title}`,
    defaultStudentName: 'Student',

    familyCodeHeading: 'Family Code',
    familyCodeSub: 'Share this code with a parent so they can see your progress:',

    gotIt: 'Got it',

    assignedHeading: 'Assigned by Your Teacher',
    assignedNote: "Just a reminder — nothing is locked, play in any order.",
    dueLabel: (date) => `due ${date}`,
    wasDueLabel: (date) => `was due ${date}`,

    announcementsHeading: '📣 From Your Teacher',

    myClassHeading: 'My Class',
    rankOf: (rank, size, myXp, avgXp) => `Rank #${rank} of ${size} · ${myXp} XP (class average ${avgXp} XP)`,

    joinClassHeading: 'Join a Class',
    joinClassSub: 'Got a code from your teacher? Enter it here to join their class and appear on their roster.',
    classCodePlaceholder: 'Class code (e.g. AB12CD)',
    yourNamePlaceholder: 'Your name',
    joinBtn: 'Join',
    joinNote: 'Joining signs you in as a student on this device — if someone else is already signed in here, joining will switch to the new student profile.',
    joinErrorBoth: 'Enter both a class code and your name.',
    joining: 'Joining…',
    joinedReloading: (className) => `Joined ${className}! Reloading…`,
    joinError: 'Could not join — check the code and try again.',
    tooManyAttempts: 'Too many attempts. Please wait a few minutes and try again.',
    reportLink: 'Report',
    reportPromptLabel: 'What\'s wrong with this announcement?',
    reportSentAlert: 'Thanks — we\'ll review this as soon as possible.',
    reportFailedAlert: 'Could not send the report — try again.',
  },
  nl: {
    backToGames: '← Terug naar spellen',
    dashboardTitle: '📊 Mijn Dashboard',
    dashboardSub: 'Jouw voortgang bij elk spel — alleen voor jou.',

    levelStreakHeading: 'Level & Reeks',
    levelText: (n) => `⭐ Level ${n}`,
    streakText: (n) => `🔥 ${n}-daagse reeks`,
    xpSub: (into, need, nextLevel, rounds) => `${into} / ${need} XP tot level ${nextLevel} · ${rounds} rondes in totaal gespeeld`,

    badgesHeading: 'Badges',

    reportCardHeading: 'Rapport',
    reportCardSub: 'Een vriendelijke blik op hoeveel je hebt geoefend per spel — er is geen onvoldoende, gewoon doorgaan!',
    reportTableGame: 'Spel',
    reportTableRounds: 'Rondes',
    reportTableGrade: 'Niveau',
    certificateBtn: '🏅 Certificaat',
    certificateAchievement: (title) => `Goud-niveau oefening in ${title}`,
    defaultStudentName: 'Leerling',

    familyCodeHeading: 'Familiecode',
    familyCodeSub: 'Deel deze code met een ouder zodat die jouw voortgang kan zien:',

    gotIt: 'Begrepen',

    assignedHeading: 'Toegewezen door je leerkracht',
    assignedNote: 'Gewoon een herinnering — niets is vergrendeld, speel in elke volgorde.',
    dueLabel: (date) => `deadline ${date}`,
    wasDueLabel: (date) => `deadline was ${date}`,

    announcementsHeading: '📣 Van je leerkracht',

    myClassHeading: 'Mijn Klas',
    rankOf: (rank, size, myXp, avgXp) => `Plaats #${rank} van ${size} · ${myXp} XP (klasgemiddelde ${avgXp} XP)`,

    joinClassHeading: 'Deelnemen aan een Klas',
    joinClassSub: 'Heb je een code van je leerkracht? Vul die hier in om je klas te joinen en op de lijst te verschijnen.',
    classCodePlaceholder: 'Klascode (bijv. AB12CD)',
    yourNamePlaceholder: 'Jouw naam',
    joinBtn: 'Deelnemen',
    joinNote: 'Deelnemen logt je in als leerling op dit apparaat — als iemand anders hier al is ingelogd, wisselt deelnemen naar het nieuwe leerlingprofiel.',
    joinErrorBoth: 'Vul zowel een klascode als je naam in.',
    joining: 'Bezig met deelnemen…',
    joinedReloading: (className) => `Deelgenomen aan ${className}! Herladen…`,
    joinError: 'Kon niet deelnemen — controleer de code en probeer opnieuw.',
    tooManyAttempts: 'Te veel pogingen. Wacht een paar minuten en probeer opnieuw.',
    reportLink: 'Melden',
    reportPromptLabel: 'Wat is er mis met deze mededeling?',
    reportSentAlert: 'Bedankt — we bekijken dit zo snel mogelijk.',
    reportFailedAlert: 'Kon de melding niet versturen — probeer opnieuw.',
  },
  de: {
    backToGames: '← Zurück zu den Spielen',
    dashboardTitle: '📊 Mein Dashboard',
    dashboardSub: 'Dein Fortschritt in jedem Spiel — nur für dich.',

    levelStreakHeading: 'Level & Serie',
    levelText: (n) => `⭐ Level ${n}`,
    streakText: (n) => `🔥 ${n}-Tage-Serie`,
    xpSub: (into, need, nextLevel, rounds) => `${into} / ${need} XP bis Level ${nextLevel} · ${rounds} Runden insgesamt gespielt`,

    badgesHeading: 'Abzeichen',

    reportCardHeading: 'Zeugnis',
    reportCardSub: 'Ein freundlicher Blick darauf, wie viel du in jedem Spiel geübt hast — es gibt keine Note „ungenügend", einfach weitermachen!',
    reportTableGame: 'Spiel',
    reportTableRounds: 'Runden',
    reportTableGrade: 'Note',
    certificateBtn: '🏅 Zertifikat',
    certificateAchievement: (title) => `Gold-Niveau-Übung in ${title}`,
    defaultStudentName: 'Schüler',

    familyCodeHeading: 'Familiencode',
    familyCodeSub: 'Teile diesen Code mit einem Elternteil, damit er deinen Fortschritt sehen kann:',

    gotIt: 'Verstanden',

    assignedHeading: 'Von deiner Lehrkraft zugewiesen',
    assignedNote: 'Nur eine Erinnerung — nichts ist gesperrt, spiele in beliebiger Reihenfolge.',
    dueLabel: (date) => `fällig ${date}`,
    wasDueLabel: (date) => `war fällig am ${date}`,

    announcementsHeading: '📣 Von deiner Lehrkraft',

    myClassHeading: 'Meine Klasse',
    rankOf: (rank, size, myXp, avgXp) => `Platz #${rank} von ${size} · ${myXp} XP (Klassendurchschnitt ${avgXp} XP)`,

    joinClassHeading: 'Einer Klasse beitreten',
    joinClassSub: 'Hast du einen Code von deiner Lehrkraft? Gib ihn hier ein, um der Klasse beizutreten und auf der Liste zu erscheinen.',
    classCodePlaceholder: 'Klassencode (z. B. AB12CD)',
    yourNamePlaceholder: 'Dein Name',
    joinBtn: 'Beitreten',
    joinNote: 'Der Beitritt meldet dich als Schüler auf diesem Gerät an — falls hier bereits jemand anderes angemeldet ist, wechselt der Beitritt zum neuen Schülerprofil.',
    joinErrorBoth: 'Gib sowohl einen Klassencode als auch deinen Namen ein.',
    joining: 'Trete bei…',
    joinedReloading: (className) => `${className} beigetreten! Wird neu geladen…`,
    joinError: 'Beitritt fehlgeschlagen — überprüfe den Code und versuche es erneut.',
    tooManyAttempts: 'Zu viele Versuche. Bitte warte ein paar Minuten und versuche es erneut.',
    reportLink: 'Melden',
    reportPromptLabel: 'Was stimmt mit dieser Ankündigung nicht?',
    reportSentAlert: 'Danke — wir prüfen das so schnell wie möglich.',
    reportFailedAlert: 'Meldung konnte nicht gesendet werden — versuche es erneut.',
  },
  es: {
    backToGames: '← Volver a los juegos',
    dashboardTitle: '📊 Mi Panel',
    dashboardSub: 'Tu progreso en cada juego — solo para ti.',

    levelStreakHeading: 'Nivel y Racha',
    levelText: (n) => `⭐ Nivel ${n}`,
    streakText: (n) => `🔥 racha de ${n} días`,
    xpSub: (into, need, nextLevel, rounds) => `${into} / ${need} XP para el nivel ${nextLevel} · ${rounds} rondas jugadas en total`,

    badgesHeading: 'Insignias',

    reportCardHeading: 'Boletín',
    reportCardSub: 'Una lectura amigable de cuánto has practicado cada juego — no hay nota de suspenso, ¡solo sigue adelante!',
    reportTableGame: 'Juego',
    reportTableRounds: 'Rondas',
    reportTableGrade: 'Nivel',
    certificateBtn: '🏅 Certificado',
    certificateAchievement: (title) => `Práctica de nivel oro en ${title}`,
    defaultStudentName: 'Alumno',

    familyCodeHeading: 'Código Familiar',
    familyCodeSub: 'Comparte este código con un padre o madre para que pueda ver tu progreso:',

    gotIt: 'Entendido',

    assignedHeading: 'Asignado por tu Docente',
    assignedNote: 'Solo un recordatorio — nada está bloqueado, juega en el orden que quieras.',
    dueLabel: (date) => `vence el ${date}`,
    wasDueLabel: (date) => `vencía el ${date}`,

    announcementsHeading: '📣 De tu Docente',

    myClassHeading: 'Mi Clase',
    rankOf: (rank, size, myXp, avgXp) => `Puesto #${rank} de ${size} · ${myXp} XP (promedio de la clase ${avgXp} XP)`,

    joinClassHeading: 'Unirse a una Clase',
    joinClassSub: '¿Tienes un código de tu docente? Introdúcelo aquí para unirte a su clase y aparecer en su lista.',
    classCodePlaceholder: 'Código de clase (p. ej. AB12CD)',
    yourNamePlaceholder: 'Tu nombre',
    joinBtn: 'Unirse',
    joinNote: 'Unirte te inicia sesión como alumno en este dispositivo — si alguien más ya tiene sesión iniciada aquí, unirte cambiará al nuevo perfil de alumno.',
    joinErrorBoth: 'Introduce el código de clase y tu nombre.',
    joining: 'Uniéndose…',
    joinedReloading: (className) => `¡Te uniste a ${className}! Recargando…`,
    joinError: 'No se pudo unir — verifica el código e inténtalo de nuevo.',
    tooManyAttempts: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
    reportLink: 'Reportar',
    reportPromptLabel: '¿Qué tiene de malo este anuncio?',
    reportSentAlert: 'Gracias — lo revisaremos lo antes posible.',
    reportFailedAlert: 'No se pudo enviar el reporte — inténtalo de nuevo.',
  },
  fr: {
    backToGames: '← Retour aux jeux',
    dashboardTitle: '📊 Mon Tableau de Bord',
    dashboardSub: 'Ta progression dans chaque jeu — rien que pour toi.',

    levelStreakHeading: 'Niveau et Série',
    levelText: (n) => `⭐ Niveau ${n}`,
    streakText: (n) => `🔥 série de ${n} jours`,
    xpSub: (into, need, nextLevel, rounds) => `${into} / ${need} XP avant le niveau ${nextLevel} · ${rounds} manches jouées au total`,

    badgesHeading: 'Badges',

    reportCardHeading: 'Bulletin',
    reportCardSub: "Un aperçu bienveillant de combien tu t'es entraîné à chaque jeu — il n'y a pas de note éliminatoire, continue simplement !",
    reportTableGame: 'Jeu',
    reportTableRounds: 'Manches',
    reportTableGrade: 'Niveau',
    certificateBtn: '🏅 Certificat',
    certificateAchievement: (title) => `Pratique de niveau or dans ${title}`,
    defaultStudentName: 'Élève',

    familyCodeHeading: 'Code Familial',
    familyCodeSub: 'Partage ce code avec un parent pour qu\'il puisse voir ta progression :',

    gotIt: 'Compris',

    assignedHeading: 'Assigné par ton Enseignant',
    assignedNote: "Juste un rappel — rien n'est verrouillé, joue dans l'ordre que tu veux.",
    dueLabel: (date) => `à faire pour le ${date}`,
    wasDueLabel: (date) => `devait être fait le ${date}`,

    announcementsHeading: '📣 De ton Enseignant',

    myClassHeading: 'Ma Classe',
    rankOf: (rank, size, myXp, avgXp) => `Rang n°${rank} sur ${size} · ${myXp} XP (moyenne de la classe ${avgXp} XP)`,

    joinClassHeading: 'Rejoindre une Classe',
    joinClassSub: "Tu as un code de ton enseignant ? Saisis-le ici pour rejoindre sa classe et apparaître dans sa liste.",
    classCodePlaceholder: 'Code de classe (ex. AB12CD)',
    yourNamePlaceholder: 'Ton nom',
    joinBtn: 'Rejoindre',
    joinNote: "Rejoindre te connecte en tant qu'élève sur cet appareil — si quelqu'un d'autre est déjà connecté ici, rejoindre basculera vers le nouveau profil d'élève.",
    joinErrorBoth: 'Saisis à la fois un code de classe et ton nom.',
    joining: 'Adhésion en cours…',
    joinedReloading: (className) => `Rejoint ${className} ! Rechargement…`,
    joinError: "Impossible de rejoindre — vérifie le code et réessaie.",
    tooManyAttempts: 'Trop de tentatives. Veuillez patienter quelques minutes et réessayer.',
    reportLink: 'Signaler',
    reportPromptLabel: "Qu'est-ce qui ne va pas avec cette annonce ?",
    reportSentAlert: 'Merci — nous allons examiner cela dès que possible.',
    reportFailedAlert: "Impossible d'envoyer le signalement — réessaie.",
  },
  ar: {
    backToGames: '← العودة إلى الألعاب',
    dashboardTitle: '📊 لوحتي',
    dashboardSub: 'تقدمك في كل لعبة — خاص بك فقط.',

    levelStreakHeading: 'المستوى والسلسلة',
    levelText: (n) => `⭐ المستوى ${n}`,
    streakText: (n) => `🔥 سلسلة ${n} أيام`,
    xpSub: (into, need, nextLevel, rounds) => `${into} / ${need} نقطة خبرة للمستوى ${nextLevel} · ${rounds} جولة تم لعبها بالإجمالي`,

    badgesHeading: 'الأوسمة',

    reportCardHeading: 'التقرير',
    reportCardSub: 'قراءة ودية لمدى تدربك على كل لعبة — لا توجد درجة رسوب، فقط واصل التقدم!',
    reportTableGame: 'اللعبة',
    reportTableRounds: 'الجولات',
    reportTableGrade: 'الدرجة',
    certificateBtn: '🏅 شهادة',
    certificateAchievement: (title) => `تدريب بمستوى ذهبي في ${title}`,
    defaultStudentName: 'الطالب',

    familyCodeHeading: 'رمز العائلة',
    familyCodeSub: 'شارك هذا الرمز مع أحد الوالدين ليتمكن من رؤية تقدمك:',

    gotIt: 'حسنًا',

    assignedHeading: 'مُعيَّن من معلمك',
    assignedNote: 'مجرد تذكير — لا شيء مقفل، العب بأي ترتيب تريد.',
    dueLabel: (date) => `الموعد النهائي ${date}`,
    wasDueLabel: (date) => `كان الموعد النهائي ${date}`,

    announcementsHeading: '📣 من معلمك',

    myClassHeading: 'فصلي',
    rankOf: (rank, size, myXp, avgXp) => `الترتيب #${rank} من ${size} · ${myXp} نقطة خبرة (متوسط الفصل ${avgXp} نقطة خبرة)`,

    joinClassHeading: 'الانضمام إلى فصل',
    joinClassSub: 'هل لديك رمز من معلمك؟ أدخله هنا للانضمام إلى فصله والظهور في قائمته.',
    classCodePlaceholder: 'رمز الفصل (مثال: AB12CD)',
    yourNamePlaceholder: 'اسمك',
    joinBtn: 'انضمام',
    joinNote: 'الانضمام يسجل دخولك كطالب على هذا الجهاز — إذا كان شخص آخر مسجلاً دخوله بالفعل هنا، فسيؤدي الانضمام إلى التبديل إلى ملف الطالب الجديد.',
    joinErrorBoth: 'أدخل رمز الفصل واسمك معًا.',
    joining: 'جارٍ الانضمام…',
    joinedReloading: (className) => `تم الانضمام إلى ${className}! جارٍ إعادة التحميل…`,
    joinError: 'تعذر الانضمام — تحقق من الرمز وحاول مرة أخرى.',
    tooManyAttempts: 'محاولات كثيرة جدًا. يرجى الانتظار بضع دقائق ثم المحاولة مرة أخرى.',
    reportLink: 'إبلاغ',
    reportPromptLabel: 'ما الخطأ في هذا الإعلان؟',
    reportSentAlert: 'شكرًا — سنراجع هذا في أقرب وقت ممكن.',
    reportFailedAlert: 'تعذر إرسال البلاغ — حاول مرة أخرى.',
  },
};

export function t(): Strings {
  return STRINGS[getLang()];
}
