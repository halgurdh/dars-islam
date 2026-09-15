export interface BuilderItem {
  id: number;
  arabic: string;
  transliteration: string;
  meaningEn: string;
  meaningNl: string;
}

// The 25 Prophets named in the Quran, in the traditional order.
export const PROPHETS: BuilderItem[] = [
  { id: 1, arabic: 'آدَم', transliteration: 'Adam', meaningEn: 'The first human being and prophet', meaningNl: 'De eerste mens en profeet' },
  { id: 2, arabic: 'إِدْرِيس', transliteration: 'Idris', meaningEn: 'Known for wisdom and patience; raised to a high station', meaningNl: 'Bekend om wijsheid en geduld; verheven tot een hoge positie' },
  { id: 3, arabic: 'نُوح', transliteration: 'Nuh', meaningEn: 'Built the ark and survived the great flood', meaningNl: 'Bouwde de ark en overleefde de grote vloed' },
  { id: 4, arabic: 'هُود', transliteration: 'Hud', meaningEn: "Sent to the people of 'Ad", meaningNl: "Gezonden naar het volk van 'Ad" },
  { id: 5, arabic: 'صَالِح', transliteration: 'Salih', meaningEn: 'Sent to the people of Thamud, with the miracle of a she-camel', meaningNl: 'Gezonden naar het volk van Thamoed, met het wonder van een kameel' },
  { id: 6, arabic: 'إِبْرَاهِيم', transliteration: 'Ibrahim', meaningEn: 'Known as the Friend of Allah; father of many prophets', meaningNl: 'Bekend als de Vriend van Allah; vader van vele profeten' },
  { id: 7, arabic: 'لُوط', transliteration: 'Lut', meaningEn: 'Sent to warn his people against wrongdoing', meaningNl: 'Gezonden om zijn volk te waarschuwen tegen onrecht' },
  { id: 8, arabic: 'إِسْمَاعِيل', transliteration: 'Ismail', meaningEn: "Son of Ibrahim; helped build the Ka'bah", meaningNl: "Zoon van Ibrahim; hielp de Ka'bah bouwen" },
  { id: 9, arabic: 'إِسْحَاق', transliteration: 'Ishaq', meaningEn: 'Son of Ibrahim', meaningNl: 'Zoon van Ibrahim' },
  { id: 10, arabic: 'يَعْقُوب', transliteration: 'Yaqub', meaningEn: 'Son of Ishaq; father of Yusuf', meaningNl: 'Zoon van Ishaq; vader van Yusuf' },
  { id: 11, arabic: 'يُوسُف', transliteration: 'Yusuf', meaningEn: 'Known for his beauty and gift of interpreting dreams', meaningNl: 'Bekend om zijn schoonheid en gave om dromen te duiden' },
  { id: 12, arabic: 'أَيُّوب', transliteration: 'Ayyub', meaningEn: 'Known for his patience through hardship', meaningNl: 'Bekend om zijn geduld tijdens beproevingen' },
  { id: 13, arabic: 'شُعَيْب', transliteration: 'Shuaib', meaningEn: 'Sent to the people of Madyan', meaningNl: 'Gezonden naar het volk van Madyan' },
  { id: 14, arabic: 'مُوسَى', transliteration: 'Musa', meaningEn: 'Spoke directly with Allah; led his people out of Egypt', meaningNl: 'Sprak rechtstreeks met Allah; leidde zijn volk uit Egypte' },
  { id: 15, arabic: 'هَارُون', transliteration: 'Harun', meaningEn: 'Brother of Musa and his helper', meaningNl: 'Broer van Musa en zijn helper' },
  { id: 16, arabic: 'ذُو الْكِفْل', transliteration: 'Dhul-Kifl', meaningEn: 'Known for his patience and fulfilling his promises', meaningNl: 'Bekend om zijn geduld en trouw aan zijn beloften' },
  { id: 17, arabic: 'دَاوُود', transliteration: 'Dawud', meaningEn: 'Given the Zabur (Psalms); known for his beautiful voice', meaningNl: 'Kreeg de Zaboer; bekend om zijn mooie stem' },
  { id: 18, arabic: 'سُلَيْمَان', transliteration: 'Sulaiman', meaningEn: 'Son of Dawud; could understand the speech of animals', meaningNl: 'Zoon van Dawud; verstond de taal van dieren' },
  { id: 19, arabic: 'إِلْيَاس', transliteration: 'Ilyas', meaningEn: 'Sent to call his people away from idol worship', meaningNl: 'Gezonden om zijn volk van afgoderij af te roepen' },
  { id: 20, arabic: 'اَلْيَسَع', transliteration: 'Al-Yasa', meaningEn: 'Successor to Ilyas', meaningNl: 'Opvolger van Ilyas' },
  { id: 21, arabic: 'يُونُس', transliteration: 'Yunus', meaningEn: 'Swallowed by a great fish after leaving his people', meaningNl: 'Verzwolgen door een grote vis nadat hij zijn volk verliet' },
  { id: 22, arabic: 'زَكَرِيَّا', transliteration: 'Zakariyya', meaningEn: 'Father of Yahya; devoted caretaker of Maryam', meaningNl: 'Vader van Yahya; toegewijde verzorger van Maryam' },
  { id: 23, arabic: 'يَحْيَى', transliteration: 'Yahya', meaningEn: 'Son of Zakariyya, known for his piety', meaningNl: 'Zoon van Zakariyya, bekend om zijn vroomheid' },
  { id: 24, arabic: 'عِيسَى', transliteration: 'Isa', meaningEn: "Son of Maryam; performed miracles by Allah's permission", meaningNl: 'Zoon van Maryam; verrichtte wonderen met Allahs toestemming' },
  { id: 25, arabic: 'مُحَمَّد', transliteration: 'Muhammad', meaningEn: 'The final prophet, sent to all of humanity', meaningNl: 'De laatste profeet, gezonden naar de hele mensheid' },
];
