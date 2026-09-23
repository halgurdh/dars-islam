import { getLang, type LangMode } from './systems/Locale';

export interface Strings {
  backToGames: string;
  title: string;
  subtitle: string;

  signInRequiredHeading: string;
  signInRequiredBody: string;

  createSchoolHeading: string;
  createSchoolSub: string;
  schoolNamePlaceholder: string;
  createBtn: string;
  joinSchoolHeading: string;
  joinSchoolSub: string;
  inviteCodePlaceholder: string;
  joinBtn: string;
  creating: string;
  couldNotCreateSchool: string;
  joining: string;
  inviteCodeNotFound: string;

  inviteTeachersWith: string;
  newClassNamePlaceholder: string;
  createClassBtn: string;
  orgSettingsHeading: string;
  orgSettingsSub: string;
  saveBtn: string;
  saving: string;
  saved: string;
  couldNotSave: string;
  welcomeMessagePlaceholder: string;
  codeLabel: string;
  studentWord: (n: number) => string;
  avgXp: (n: number) => string;
  noClassesYet: string;
  couldNotCreateClass: string;
  topStudentsHeading: string;
  nudgeHeading: string;
  colRank: string;
  colName: string;
  colClass: string;
  colXp: string;
  noStudentsYet: string;
  orgSchool: string;
  orgMosque: string;
  orgHomeschool: string;
  orgOther: string;

  assignedGamesHeading: string;
  noGamesAssigned: string;
  dueDateInputTitle: string;
  dueDateReminderNote: string;
  assignMoreLabel: string;
  assignSelectedBtn: string;
  allGamesAssigned: string;
  assigning: string;
  couldNotAssign: string;

  classAnnouncementsHeading: string;
  noAnnouncementsYet: string;
  announcementPlaceholder: string;
  postBtn: string;
  posting: string;
  couldNotPost: string;

  attendanceHeading: string;
  attendanceSub: string;
  noStudentsYetAttendance: string;
  saveAttendanceBtn: string;
  couldNotSaveAttendance: string;

  backToSchool: (name: string) => string;
  rosterSummary: (count: number, avgXp: number) => string;
  shareCode: string;
  colLevel: string;
  colStreak: string;
  colBadges: string;
  colReportCard: string;
  colAttendance: string;
  colNote: string;
  notePlaceholder: string;
  nudgeTooltip: string;
  exportCsvBtn: string;
  printReportBtn: string;
  printCertsBtn: string;
  certAchievement: string;
  couldNotLoadRoster: string;
  couldNotLoadSchools: string;
  loadingRoster: string;
}

export const STRINGS: Record<LangMode, Strings> = {
  en: {
    backToGames: '← Back to games',
    title: '🏫 Teacher Dashboard',
    subtitle: 'Schools, classes and student progress at a glance.',

    signInRequiredHeading: 'Sign In Required',
    signInRequiredBody: 'Sign in with the same email you use for dars-islam to create or manage a school.',

    createSchoolHeading: 'Create a School',
    createSchoolSub: "You'll get an invite code to share with other teachers.",
    schoolNamePlaceholder: 'School name',
    createBtn: 'Create',
    joinSchoolHeading: 'Join a School',
    joinSchoolSub: 'Have an invite code from a colleague?',
    inviteCodePlaceholder: 'Invite code',
    joinBtn: 'Join',
    creating: 'Creating…',
    couldNotCreateSchool: 'Could not create the school.',
    joining: 'Joining…',
    inviteCodeNotFound: 'Invite code not found.',

    inviteTeachersWith: 'Invite other teachers with code',
    newClassNamePlaceholder: 'New class name (e.g. Grade 4B)',
    createClassBtn: 'Create Class',
    orgSettingsHeading: '⚙️ Organization Settings',
    orgSettingsSub: 'Label your organization and greet students who join — a mosque, homeschool co-op, or club works exactly like a school here.',
    saveBtn: 'Save',
    saving: 'Saving…',
    saved: 'Saved.',
    couldNotSave: 'Could not save — try again.',
    welcomeMessagePlaceholder: "Optional welcome message shown to students when they join (e.g. 'Welcome to Al-Noor Mosque weekend classes!')",
    codeLabel: 'Code',
    studentWord: (n) => `${n} student${n === 1 ? '' : 's'}`,
    avgXp: (n) => `avg ${n} XP`,
    noClassesYet: 'No classes yet — create one above.',
    couldNotCreateClass: 'Could not create the class.',
    topStudentsHeading: '🏆 Top Students (School-Wide)',
    nudgeHeading: '🌱 Could Use a Nudge',
    colRank: '#',
    colName: 'Name',
    colClass: 'Class',
    colXp: 'XP',
    noStudentsYet: 'No students yet',
    orgSchool: '🏫 School',
    orgMosque: '🕌 Mosque',
    orgHomeschool: '🏡 Homeschool',
    orgOther: '📚 Other',

    assignedGamesHeading: '📌 Assigned Games',
    noGamesAssigned: 'No games assigned yet.',
    dueDateInputTitle: 'Due date (optional — a reminder, not a penalty)',
    dueDateReminderNote: 'Optional due date shown as a reminder chip to students — nothing is locked or penalized.',
    assignMoreLabel: 'Assign more:',
    assignSelectedBtn: 'Assign Selected',
    allGamesAssigned: 'All games are assigned.',
    assigning: 'Assigning…',
    couldNotAssign: 'Could not assign — try again.',

    classAnnouncementsHeading: '📣 Class Announcements',
    noAnnouncementsYet: 'No announcements yet.',
    announcementPlaceholder: 'Homework, reminders, anything for the class…',
    postBtn: 'Post',
    posting: 'Posting…',
    couldNotPost: 'Could not post — try again.',

    attendanceHeading: '🗓️ Attendance — Today',
    attendanceSub: "Check who's present for today's session. Unchecked = absent for this date only.",
    noStudentsYetAttendance: 'No students yet.',
    saveAttendanceBtn: 'Save Attendance',
    couldNotSaveAttendance: 'Could not save — try again.',

    backToSchool: (name) => `← Back to ${name}`,
    rosterSummary: (count, avgXp) => `${count} students · class average ${avgXp} XP`,
    shareCode: 'Share code',
    colLevel: 'Level',
    colStreak: 'Streak',
    colBadges: 'Badges',
    colReportCard: 'Report card',
    colAttendance: 'Attend.',
    colNote: 'Note',
    notePlaceholder: 'Private note…',
    nudgeTooltip: "Hasn't played in a few days — might be worth a friendly nudge",
    exportCsvBtn: '⬇ Export CSV',
    printReportBtn: '🖨 Print Class Report',
    printCertsBtn: '🏅 Print Term Certificates',
    certAchievement: 'Successful Completion of Term',
    couldNotLoadRoster: "Could not load this class's roster.",
    couldNotLoadSchools: 'Could not load your schools.',
    loadingRoster: 'Loading roster…',
  },
  nl: {
    backToGames: '← Terug naar spellen',
    title: '🏫 Docentendashboard',
    subtitle: 'Scholen, klassen en leerlingvoortgang in één oogopslag.',

    signInRequiredHeading: 'Inloggen Vereist',
    signInRequiredBody: 'Log in met hetzelfde e-mailadres dat je voor dars-islam gebruikt om een school aan te maken of te beheren.',

    createSchoolHeading: 'Maak een School Aan',
    createSchoolSub: 'Je krijgt een uitnodigingscode om met andere leerkrachten te delen.',
    schoolNamePlaceholder: 'Schoolnaam',
    createBtn: 'Aanmaken',
    joinSchoolHeading: 'Sluit je aan bij een School',
    joinSchoolSub: 'Heb je een uitnodigingscode van een collega?',
    inviteCodePlaceholder: 'Uitnodigingscode',
    joinBtn: 'Deelnemen',
    creating: 'Bezig met aanmaken…',
    couldNotCreateSchool: 'Kon de school niet aanmaken.',
    joining: 'Bezig met deelnemen…',
    inviteCodeNotFound: 'Uitnodigingscode niet gevonden.',

    inviteTeachersWith: 'Nodig andere leerkrachten uit met code',
    newClassNamePlaceholder: 'Nieuwe klasnaam (bijv. Groep 4B)',
    createClassBtn: 'Klas Aanmaken',
    orgSettingsHeading: '⚙️ Organisatie-instellingen',
    orgSettingsSub: 'Geef je organisatie een label en verwelkom leerlingen die zich aansluiten — een moskee, homeschool-groep of club werkt hier precies als een school.',
    saveBtn: 'Opslaan',
    saving: 'Bezig met opslaan…',
    saved: 'Opgeslagen.',
    couldNotSave: 'Kon niet opslaan — probeer opnieuw.',
    welcomeMessagePlaceholder: "Optioneel welkomstbericht getoond aan leerlingen die zich aansluiten (bijv. 'Welkom bij de weekendlessen van Al-Noor Moskee!')",
    codeLabel: 'Code',
    studentWord: (n) => `${n} leerling${n === 1 ? '' : 'en'}`,
    avgXp: (n) => `gem. ${n} XP`,
    noClassesYet: 'Nog geen klassen — maak er hierboven een aan.',
    couldNotCreateClass: 'Kon de klas niet aanmaken.',
    topStudentsHeading: '🏆 Beste Leerlingen (Hele School)',
    nudgeHeading: '🌱 Kan wel een Zetje Gebruiken',
    colRank: '#',
    colName: 'Naam',
    colClass: 'Klas',
    colXp: 'XP',
    noStudentsYet: 'Nog geen leerlingen',
    orgSchool: '🏫 School',
    orgMosque: '🕌 Moskee',
    orgHomeschool: '🏡 Thuisonderwijs',
    orgOther: '📚 Anders',

    assignedGamesHeading: '📌 Toegewezen Spellen',
    noGamesAssigned: 'Nog geen spellen toegewezen.',
    dueDateInputTitle: 'Deadline (optioneel — een herinnering, geen straf)',
    dueDateReminderNote: 'Optionele deadline getoond als herinneringslabel aan leerlingen — niets is vergrendeld of bestraft.',
    assignMoreLabel: 'Meer toewijzen:',
    assignSelectedBtn: 'Geselecteerde Toewijzen',
    allGamesAssigned: 'Alle spellen zijn toegewezen.',
    assigning: 'Bezig met toewijzen…',
    couldNotAssign: 'Kon niet toewijzen — probeer opnieuw.',

    classAnnouncementsHeading: '📣 Klasmededelingen',
    noAnnouncementsYet: 'Nog geen mededelingen.',
    announcementPlaceholder: 'Huiswerk, herinneringen, iets voor de klas…',
    postBtn: 'Plaatsen',
    posting: 'Bezig met plaatsen…',
    couldNotPost: 'Kon niet plaatsen — probeer opnieuw.',

    attendanceHeading: '🗓️ Aanwezigheid — Vandaag',
    attendanceSub: 'Vink aan wie er aanwezig is voor de sessie van vandaag. Niet aangevinkt = afwezig, alleen voor deze datum.',
    noStudentsYetAttendance: 'Nog geen leerlingen.',
    saveAttendanceBtn: 'Aanwezigheid Opslaan',
    couldNotSaveAttendance: 'Kon niet opslaan — probeer opnieuw.',

    backToSchool: (name) => `← Terug naar ${name}`,
    rosterSummary: (count, avgXp) => `${count} leerlingen · klasgemiddelde ${avgXp} XP`,
    shareCode: 'Deel code',
    colLevel: 'Level',
    colStreak: 'Reeks',
    colBadges: 'Badges',
    colReportCard: 'Rapport',
    colAttendance: 'Aanw.',
    colNote: 'Notitie',
    notePlaceholder: 'Privénotitie…',
    nudgeTooltip: 'Heeft al een paar dagen niet gespeeld — misschien een vriendelijk duwtje waard',
    exportCsvBtn: '⬇ CSV Exporteren',
    printReportBtn: '🖨 Klasrapport Printen',
    printCertsBtn: '🏅 Termijncertificaten Printen',
    certAchievement: 'Succesvolle Afronding van de Termijn',
    couldNotLoadRoster: 'Kon de klaslijst niet laden.',
    couldNotLoadSchools: 'Kon je scholen niet laden.',
    loadingRoster: 'Klaslijst laden…',
  },
  de: {
    backToGames: '← Zurück zu den Spielen',
    title: '🏫 Lehrer-Dashboard',
    subtitle: 'Schulen, Klassen und Schülerfortschritt auf einen Blick.',

    signInRequiredHeading: 'Anmeldung Erforderlich',
    signInRequiredBody: 'Melde dich mit derselben E-Mail-Adresse an, die du für dars-islam verwendest, um eine Schule zu erstellen oder zu verwalten.',

    createSchoolHeading: 'Schule Erstellen',
    createSchoolSub: 'Du erhältst einen Einladungscode zum Teilen mit anderen Lehrkräften.',
    schoolNamePlaceholder: 'Schulname',
    createBtn: 'Erstellen',
    joinSchoolHeading: 'Schule Beitreten',
    joinSchoolSub: 'Hast du einen Einladungscode von einem Kollegen?',
    inviteCodePlaceholder: 'Einladungscode',
    joinBtn: 'Beitreten',
    creating: 'Wird erstellt…',
    couldNotCreateSchool: 'Schule konnte nicht erstellt werden.',
    joining: 'Tritt bei…',
    inviteCodeNotFound: 'Einladungscode nicht gefunden.',

    inviteTeachersWith: 'Lade andere Lehrkräfte ein mit Code',
    newClassNamePlaceholder: 'Neuer Klassenname (z. B. Klasse 4B)',
    createClassBtn: 'Klasse Erstellen',
    orgSettingsHeading: '⚙️ Organisationseinstellungen',
    orgSettingsSub: 'Beschrifte deine Organisation und begrüße beitretende Schüler — eine Moschee, Homeschool-Gruppe oder ein Verein funktioniert hier genau wie eine Schule.',
    saveBtn: 'Speichern',
    saving: 'Wird gespeichert…',
    saved: 'Gespeichert.',
    couldNotSave: 'Konnte nicht gespeichert werden — bitte erneut versuchen.',
    welcomeMessagePlaceholder: "Optionale Willkommensnachricht für beitretende Schüler (z. B. 'Willkommen beim Wochenendunterricht der Al-Noor-Moschee!')",
    codeLabel: 'Code',
    studentWord: (n) => `${n} Schüler${n === 1 ? '' : ''}`,
    avgXp: (n) => `Ø ${n} XP`,
    noClassesYet: 'Noch keine Klassen — erstelle oben eine.',
    couldNotCreateClass: 'Klasse konnte nicht erstellt werden.',
    topStudentsHeading: '🏆 Beste Schüler (Schulweit)',
    nudgeHeading: '🌱 Könnte einen Anstoß gebrauchen',
    colRank: '#',
    colName: 'Name',
    colClass: 'Klasse',
    colXp: 'XP',
    noStudentsYet: 'Noch keine Schüler',
    orgSchool: '🏫 Schule',
    orgMosque: '🕌 Moschee',
    orgHomeschool: '🏡 Homeschooling',
    orgOther: '📚 Andere',

    assignedGamesHeading: '📌 Zugewiesene Spiele',
    noGamesAssigned: 'Noch keine Spiele zugewiesen.',
    dueDateInputTitle: 'Fälligkeitsdatum (optional — eine Erinnerung, keine Strafe)',
    dueDateReminderNote: 'Optionales Fälligkeitsdatum wird Schülern als Erinnerungs-Chip angezeigt — nichts ist gesperrt oder wird bestraft.',
    assignMoreLabel: 'Weitere zuweisen:',
    assignSelectedBtn: 'Auswahl Zuweisen',
    allGamesAssigned: 'Alle Spiele sind zugewiesen.',
    assigning: 'Wird zugewiesen…',
    couldNotAssign: 'Zuweisung fehlgeschlagen — bitte erneut versuchen.',

    classAnnouncementsHeading: '📣 Klassenankündigungen',
    noAnnouncementsYet: 'Noch keine Ankündigungen.',
    announcementPlaceholder: 'Hausaufgaben, Erinnerungen, alles für die Klasse…',
    postBtn: 'Veröffentlichen',
    posting: 'Wird veröffentlicht…',
    couldNotPost: 'Veröffentlichung fehlgeschlagen — bitte erneut versuchen.',

    attendanceHeading: '🗓️ Anwesenheit — Heute',
    attendanceSub: 'Markiere, wer bei der heutigen Sitzung anwesend ist. Nicht markiert = abwesend, nur für dieses Datum.',
    noStudentsYetAttendance: 'Noch keine Schüler.',
    saveAttendanceBtn: 'Anwesenheit Speichern',
    couldNotSaveAttendance: 'Konnte nicht gespeichert werden — bitte erneut versuchen.',

    backToSchool: (name) => `← Zurück zu ${name}`,
    rosterSummary: (count, avgXp) => `${count} Schüler · Klassendurchschnitt ${avgXp} XP`,
    shareCode: 'Code teilen',
    colLevel: 'Level',
    colStreak: 'Serie',
    colBadges: 'Abzeichen',
    colReportCard: 'Zeugnis',
    colAttendance: 'Anw.',
    colNote: 'Notiz',
    notePlaceholder: 'Private Notiz…',
    nudgeTooltip: 'Hat seit ein paar Tagen nicht gespielt — vielleicht einen freundlichen Anstoß wert',
    exportCsvBtn: '⬇ CSV Exportieren',
    printReportBtn: '🖨 Klassenbericht Drucken',
    printCertsBtn: '🏅 Zertifikate Drucken',
    certAchievement: 'Erfolgreicher Abschluss des Semesters',
    couldNotLoadRoster: 'Klassenliste konnte nicht geladen werden.',
    couldNotLoadSchools: 'Deine Schulen konnten nicht geladen werden.',
    loadingRoster: 'Klassenliste wird geladen…',
  },
  es: {
    backToGames: '← Volver a los juegos',
    title: '🏫 Panel del Docente',
    subtitle: 'Escuelas, clases y progreso de los alumnos de un vistazo.',

    signInRequiredHeading: 'Inicio de Sesión Requerido',
    signInRequiredBody: 'Inicia sesión con el mismo correo que usas para dars-islam para crear o gestionar una escuela.',

    createSchoolHeading: 'Crear una Escuela',
    createSchoolSub: 'Recibirás un código de invitación para compartir con otros docentes.',
    schoolNamePlaceholder: 'Nombre de la escuela',
    createBtn: 'Crear',
    joinSchoolHeading: 'Unirse a una Escuela',
    joinSchoolSub: '¿Tienes un código de invitación de un colega?',
    inviteCodePlaceholder: 'Código de invitación',
    joinBtn: 'Unirse',
    creating: 'Creando…',
    couldNotCreateSchool: 'No se pudo crear la escuela.',
    joining: 'Uniéndose…',
    inviteCodeNotFound: 'Código de invitación no encontrado.',

    inviteTeachersWith: 'Invita a otros docentes con el código',
    newClassNamePlaceholder: 'Nombre de la nueva clase (p. ej. 4º B)',
    createClassBtn: 'Crear Clase',
    orgSettingsHeading: '⚙️ Configuración de la Organización',
    orgSettingsSub: 'Etiqueta tu organización y saluda a los alumnos que se unan — una mezquita, un grupo de homeschool o un club funcionan aquí igual que una escuela.',
    saveBtn: 'Guardar',
    saving: 'Guardando…',
    saved: 'Guardado.',
    couldNotSave: 'No se pudo guardar — inténtalo de nuevo.',
    welcomeMessagePlaceholder: "Mensaje de bienvenida opcional mostrado a los alumnos al unirse (p. ej. '¡Bienvenido a las clases de fin de semana de la Mezquita Al-Noor!')",
    codeLabel: 'Código',
    studentWord: (n) => `${n} alumno${n === 1 ? '' : 's'}`,
    avgXp: (n) => `prom. ${n} XP`,
    noClassesYet: 'Aún no hay clases — crea una arriba.',
    couldNotCreateClass: 'No se pudo crear la clase.',
    topStudentsHeading: '🏆 Mejores Alumnos (Toda la Escuela)',
    nudgeHeading: '🌱 Podría Necesitar un Empujoncito',
    colRank: '#',
    colName: 'Nombre',
    colClass: 'Clase',
    colXp: 'XP',
    noStudentsYet: 'Aún no hay alumnos',
    orgSchool: '🏫 Escuela',
    orgMosque: '🕌 Mezquita',
    orgHomeschool: '🏡 Educación en Casa',
    orgOther: '📚 Otro',

    assignedGamesHeading: '📌 Juegos Asignados',
    noGamesAssigned: 'Aún no hay juegos asignados.',
    dueDateInputTitle: 'Fecha límite (opcional — un recordatorio, no una penalización)',
    dueDateReminderNote: 'La fecha límite opcional se muestra como recordatorio a los alumnos — nada está bloqueado ni penalizado.',
    assignMoreLabel: 'Asignar más:',
    assignSelectedBtn: 'Asignar Selección',
    allGamesAssigned: 'Todos los juegos están asignados.',
    assigning: 'Asignando…',
    couldNotAssign: 'No se pudo asignar — inténtalo de nuevo.',

    classAnnouncementsHeading: '📣 Anuncios de la Clase',
    noAnnouncementsYet: 'Aún no hay anuncios.',
    announcementPlaceholder: 'Tareas, recordatorios, cualquier cosa para la clase…',
    postBtn: 'Publicar',
    posting: 'Publicando…',
    couldNotPost: 'No se pudo publicar — inténtalo de nuevo.',

    attendanceHeading: '🗓️ Asistencia — Hoy',
    attendanceSub: 'Marca quién está presente en la sesión de hoy. Sin marcar = ausente, solo para esta fecha.',
    noStudentsYetAttendance: 'Aún no hay alumnos.',
    saveAttendanceBtn: 'Guardar Asistencia',
    couldNotSaveAttendance: 'No se pudo guardar — inténtalo de nuevo.',

    backToSchool: (name) => `← Volver a ${name}`,
    rosterSummary: (count, avgXp) => `${count} alumnos · promedio de la clase ${avgXp} XP`,
    shareCode: 'Compartir código',
    colLevel: 'Nivel',
    colStreak: 'Racha',
    colBadges: 'Insignias',
    colReportCard: 'Boletín',
    colAttendance: 'Asist.',
    colNote: 'Nota',
    notePlaceholder: 'Nota privada…',
    nudgeTooltip: 'No ha jugado en unos días — quizá valga la pena un empujoncito amistoso',
    exportCsvBtn: '⬇ Exportar CSV',
    printReportBtn: '🖨 Imprimir Informe de Clase',
    printCertsBtn: '🏅 Imprimir Certificados de Término',
    certAchievement: 'Finalización Exitosa del Término',
    couldNotLoadRoster: 'No se pudo cargar la lista de la clase.',
    couldNotLoadSchools: 'No se pudieron cargar tus escuelas.',
    loadingRoster: 'Cargando lista de clase…',
  },
  fr: {
    backToGames: '← Retour aux jeux',
    title: '🏫 Tableau de Bord Enseignant',
    subtitle: "Écoles, classes et progression des élèves en un coup d'œil.",

    signInRequiredHeading: 'Connexion Requise',
    signInRequiredBody: "Connecte-toi avec le même e-mail que tu utilises pour dars-islam pour créer ou gérer une école.",

    createSchoolHeading: 'Créer une École',
    createSchoolSub: "Tu recevras un code d'invitation à partager avec d'autres enseignants.",
    schoolNamePlaceholder: "Nom de l'école",
    createBtn: 'Créer',
    joinSchoolHeading: 'Rejoindre une École',
    joinSchoolSub: "Tu as un code d'invitation d'un collègue ?",
    inviteCodePlaceholder: "Code d'invitation",
    joinBtn: 'Rejoindre',
    creating: 'Création…',
    couldNotCreateSchool: "Impossible de créer l'école.",
    joining: 'Adhésion en cours…',
    inviteCodeNotFound: "Code d'invitation introuvable.",

    inviteTeachersWith: "Invite d'autres enseignants avec le code",
    newClassNamePlaceholder: 'Nom de la nouvelle classe (ex. CM1 B)',
    createClassBtn: 'Créer la Classe',
    orgSettingsHeading: '⚙️ Paramètres de l\'Organisation',
    orgSettingsSub: "Nomme ton organisation et accueille les élèves qui rejoignent — une mosquée, un groupe d'école à la maison ou un club fonctionne ici exactement comme une école.",
    saveBtn: 'Enregistrer',
    saving: 'Enregistrement…',
    saved: 'Enregistré.',
    couldNotSave: 'Impossible d\'enregistrer — réessaie.',
    welcomeMessagePlaceholder: "Message de bienvenue optionnel affiché aux élèves qui rejoignent (ex. « Bienvenue aux cours du week-end de la Mosquée Al-Noor ! »)",
    codeLabel: 'Code',
    studentWord: (n) => `${n} élève${n === 1 ? '' : 's'}`,
    avgXp: (n) => `moy. ${n} XP`,
    noClassesYet: 'Pas encore de classe — crées-en une ci-dessus.',
    couldNotCreateClass: 'Impossible de créer la classe.',
    topStudentsHeading: '🏆 Meilleurs Élèves (Toute l\'École)',
    nudgeHeading: '🌱 Pourrait Avoir Besoin d\'un Coup de Pouce',
    colRank: '#',
    colName: 'Nom',
    colClass: 'Classe',
    colXp: 'XP',
    noStudentsYet: "Pas encore d'élèves",
    orgSchool: '🏫 École',
    orgMosque: '🕌 Mosquée',
    orgHomeschool: '🏡 École à la Maison',
    orgOther: '📚 Autre',

    assignedGamesHeading: '📌 Jeux Assignés',
    noGamesAssigned: 'Aucun jeu assigné pour le moment.',
    dueDateInputTitle: "Date limite (optionnelle — un rappel, pas une pénalité)",
    dueDateReminderNote: "La date limite optionnelle est affichée comme un rappel aux élèves — rien n'est verrouillé ni pénalisé.",
    assignMoreLabel: 'Assigner davantage :',
    assignSelectedBtn: 'Assigner la Sélection',
    allGamesAssigned: 'Tous les jeux sont assignés.',
    assigning: 'Attribution…',
    couldNotAssign: "Impossible d'assigner — réessaie.",

    classAnnouncementsHeading: '📣 Annonces de la Classe',
    noAnnouncementsYet: 'Aucune annonce pour le moment.',
    announcementPlaceholder: 'Devoirs, rappels, tout pour la classe…',
    postBtn: 'Publier',
    posting: 'Publication…',
    couldNotPost: 'Impossible de publier — réessaie.',

    attendanceHeading: "🗓️ Présence — Aujourd'hui",
    attendanceSub: "Coche qui est présent pour la séance d'aujourd'hui. Non coché = absent, pour cette date uniquement.",
    noStudentsYetAttendance: "Pas encore d'élèves.",
    saveAttendanceBtn: 'Enregistrer la Présence',
    couldNotSaveAttendance: 'Impossible d\'enregistrer — réessaie.',

    backToSchool: (name) => `← Retour à ${name}`,
    rosterSummary: (count, avgXp) => `${count} élèves · moyenne de la classe ${avgXp} XP`,
    shareCode: 'Partager le code',
    colLevel: 'Niveau',
    colStreak: 'Série',
    colBadges: 'Badges',
    colReportCard: 'Bulletin',
    colAttendance: 'Présence',
    colNote: 'Note',
    notePlaceholder: 'Note privée…',
    nudgeTooltip: "N'a pas joué depuis quelques jours — un petit encouragement pourrait aider",
    exportCsvBtn: '⬇ Exporter en CSV',
    printReportBtn: '🖨 Imprimer le Rapport de Classe',
    printCertsBtn: '🏅 Imprimer les Certificats de Trimestre',
    certAchievement: 'Réussite du Trimestre',
    couldNotLoadRoster: 'Impossible de charger la liste de cette classe.',
    couldNotLoadSchools: 'Impossible de charger tes écoles.',
    loadingRoster: 'Chargement de la liste…',
  },
  ar: {
    backToGames: '← العودة إلى الألعاب',
    title: '🏫 لوحة المعلم',
    subtitle: 'المدارس والفصول وتقدم الطلاب بنظرة واحدة.',

    signInRequiredHeading: 'تسجيل الدخول مطلوب',
    signInRequiredBody: 'سجّل الدخول بنفس البريد الإلكتروني الذي تستخدمه في dars-islam لإنشاء مدرسة أو إدارتها.',

    createSchoolHeading: 'إنشاء مدرسة',
    createSchoolSub: 'ستحصل على رمز دعوة لمشاركته مع معلمين آخرين.',
    schoolNamePlaceholder: 'اسم المدرسة',
    createBtn: 'إنشاء',
    joinSchoolHeading: 'الانضمام إلى مدرسة',
    joinSchoolSub: 'هل لديك رمز دعوة من زميل؟',
    inviteCodePlaceholder: 'رمز الدعوة',
    joinBtn: 'انضمام',
    creating: 'جارٍ الإنشاء…',
    couldNotCreateSchool: 'تعذر إنشاء المدرسة.',
    joining: 'جارٍ الانضمام…',
    inviteCodeNotFound: 'رمز الدعوة غير موجود.',

    inviteTeachersWith: 'ادعُ معلمين آخرين بالرمز',
    newClassNamePlaceholder: 'اسم الفصل الجديد (مثال: الصف 4ب)',
    createClassBtn: 'إنشاء فصل',
    orgSettingsHeading: '⚙️ إعدادات المؤسسة',
    orgSettingsSub: 'أعطِ مؤسستك تسمية ورحّب بالطلاب المنضمين — المسجد أو مجموعة التعليم المنزلي أو النادي تعمل هنا تمامًا مثل المدرسة.',
    saveBtn: 'حفظ',
    saving: 'جارٍ الحفظ…',
    saved: 'تم الحفظ.',
    couldNotSave: 'تعذر الحفظ — حاول مرة أخرى.',
    welcomeMessagePlaceholder: "رسالة ترحيب اختيارية تُعرض للطلاب عند الانضمام (مثال: 'مرحبًا بكم في دروس عطلة نهاية الأسبوع بمسجد النور!')",
    codeLabel: 'الرمز',
    studentWord: (n) => `${n} طالب`,
    avgXp: (n) => `متوسط ${n} نقطة خبرة`,
    noClassesYet: 'لا توجد فصول بعد — أنشئ واحدًا أعلاه.',
    couldNotCreateClass: 'تعذر إنشاء الفصل.',
    topStudentsHeading: '🏆 أفضل الطلاب (على مستوى المدرسة)',
    nudgeHeading: '🌱 قد يحتاج إلى تشجيع',
    colRank: '#',
    colName: 'الاسم',
    colClass: 'الفصل',
    colXp: 'نقاط الخبرة',
    noStudentsYet: 'لا يوجد طلاب بعد',
    orgSchool: '🏫 مدرسة',
    orgMosque: '🕌 مسجد',
    orgHomeschool: '🏡 تعليم منزلي',
    orgOther: '📚 أخرى',

    assignedGamesHeading: '📌 الألعاب المُعيَّنة',
    noGamesAssigned: 'لا توجد ألعاب معيَّنة بعد.',
    dueDateInputTitle: 'تاريخ الاستحقاق (اختياري — تذكير وليس عقوبة)',
    dueDateReminderNote: 'يُعرض تاريخ الاستحقاق الاختياري كتذكير للطلاب — لا شيء مقفل أو معاقَب عليه.',
    assignMoreLabel: 'تعيين المزيد:',
    assignSelectedBtn: 'تعيين المحدد',
    allGamesAssigned: 'تم تعيين جميع الألعاب.',
    assigning: 'جارٍ التعيين…',
    couldNotAssign: 'تعذر التعيين — حاول مرة أخرى.',

    classAnnouncementsHeading: '📣 إعلانات الفصل',
    noAnnouncementsYet: 'لا توجد إعلانات بعد.',
    announcementPlaceholder: 'واجبات، تذكيرات، أي شيء للفصل…',
    postBtn: 'نشر',
    posting: 'جارٍ النشر…',
    couldNotPost: 'تعذر النشر — حاول مرة أخرى.',

    attendanceHeading: '🗓️ الحضور — اليوم',
    attendanceSub: 'حدد من هو حاضر لجلسة اليوم. غير محدد = غائب لهذا التاريخ فقط.',
    noStudentsYetAttendance: 'لا يوجد طلاب بعد.',
    saveAttendanceBtn: 'حفظ الحضور',
    couldNotSaveAttendance: 'تعذر الحفظ — حاول مرة أخرى.',

    backToSchool: (name) => `← العودة إلى ${name}`,
    rosterSummary: (count, avgXp) => `${count} طالب · متوسط الفصل ${avgXp} نقطة خبرة`,
    shareCode: 'مشاركة الرمز',
    colLevel: 'المستوى',
    colStreak: 'السلسلة',
    colBadges: 'الأوسمة',
    colReportCard: 'التقرير',
    colAttendance: 'الحضور',
    colNote: 'ملاحظة',
    notePlaceholder: 'ملاحظة خاصة…',
    nudgeTooltip: 'لم يلعب منذ بضعة أيام — قد يستحق تذكيرًا ودودًا',
    exportCsvBtn: '⬇ تصدير CSV',
    printReportBtn: '🖨 طباعة تقرير الفصل',
    printCertsBtn: '🏅 طباعة شهادات الفصل الدراسي',
    certAchievement: 'إتمام الفصل الدراسي بنجاح',
    couldNotLoadRoster: 'تعذر تحميل قائمة هذا الفصل.',
    couldNotLoadSchools: 'تعذر تحميل مدارسك.',
    loadingRoster: 'جارٍ تحميل القائمة…',
  },
};

export function t(): Strings {
  return STRINGS[getLang()];
}
