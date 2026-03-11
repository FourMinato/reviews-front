import { prefixes, ignoreList, rootWords, badWordsList } from './wordsList'; // import ตัวแปรมาจากไฟล์ของคุณ

const normalizeText = (text: string): string => {
  if (!text) return "";
  return text.replace(/\s+/g, '').toLowerCase();
};

/**
 * ฟังก์ชันหลักสำหรับตรวจสอบคำหยาบ
 * @returns { isBad: boolean, matchedWord: string }
 */
export const checkProfanity = (inputText: string) => {
  const cleanText = normalizeText(inputText);

  if (ignoreList.some(ignore => cleanText === normalizeText(ignore))) {
    return { isBad: false, matchedWord: null };
  }

  for (const prefix of prefixes) {
    for (const root of rootWords) {
      const combined = normalizeText(prefix + root);
      if (cleanText.includes(combined)) {
         return { isBad: true, matchedWord: combined };
      }
    }
  }
  for (const word of rootWords) {
    const cleanWord = normalizeText(word);
    
    if (cleanText.includes(cleanWord)) {
      return { isBad: true, matchedWord: word };
    }
  }
  if (badWordsList.length > 0) {
      for (const word of badWordsList) {
          if (cleanText.includes(normalizeText(word))) {
              return { isBad: true, matchedWord: word };
          }
      }
  }

  return { isBad: false, matchedWord: null };
};