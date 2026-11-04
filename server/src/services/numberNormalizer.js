/**
 * IndicVoice Lab - Number Normalizer
 * Converts spoken Hindi, Marathi, and English number words into normalized Arabic digits.
 * Resolves ambiguities (e.g. "पाँच सौ" == "500", "twenty five" == "25", "पाचशे" == "500").
 */

const UNITS = {
  // English
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,

  // Hindi (Devanagari 1-100)
  'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पाँच': 5, 'पांच': 5, 'छह': 6, 'छः': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
  'ग्यारह': 11, 'बारह': 12, 'तेरह': 13, 'चौदह': 14, 'पंद्रह': 15, 'सोलह': 16, 'सत्रह': 17, 'अठारह': 18, 'उन्नीस': 19,
  'बीस': 20, 'इक्कीस': 21, 'बाईस': 22, 'तेईस': 23, 'चौबीस': 24, 'पच्चीस': 25, 'छब्बीस': 26, 'सत्ताईस': 27, 'अट्ठाईस': 28, 'उनतीस': 29,
  'तीस': 30, 'इकतीस': 31, 'बत्तीस': 32, 'तैंतीस': 33, 'चौंतीस': 34, 'पैंतीस': 35, 'छत्तीस': 36, 'सैंतीस': 37, 'अड़तीस': 38, 'उनतालीस': 39,
  'चालीस': 40, 'इकतालीस': 41, 'बयालीस': 42, 'तैंतालीस': 43, 'चवालीस': 44, 'पैंतालीस': 45, 'छियालीस': 46, 'सैंतालीस': 47, 'अड़तालीस': 48, 'उनचास': 49,
  'पचास': 50, 'इक्यावन': 51, 'बावन': 52, 'तिरेपन': 53, 'चौवन': 54, 'पचपन': 55, 'छप्पन': 56, 'सत्तावन': 57, 'अट्ठावन': 58, 'उनसठ': 59,
  'साठ': 60, 'इकसठ': 61, 'बासठ': 62, 'तिरसठ': 63, 'चौंसठ': 64, 'पैंसठ': 65, 'छियासठ': 66, 'सरसठ': 67, 'अड़सठ': 68, 'उनहत्तर': 69,
  'सत्तर': 70, 'इकहत्तर': 71, 'बहत्तर': 72, 'तिहत्तर': 73, 'चौहत्तर': 74, 'पचहत्तर': 75, 'छिहत्तर': 76, 'सतहत्तर': 77, 'अठहत्तर': 78, 'उन्नासी': 79,
  'अस्सी': 80, 'इक्यासी': 81, 'बयासी': 82, 'तिरासी': 83, 'चौरासी': 84, 'पचासी': 85, 'छियासी': 86, 'सत्तासी': 87, 'अट्ठासी': 88, 'नवासी': 89,
  'नब्बे': 90, 'इक्यानवे': 91, 'बानवे': 92, 'तिरानवे': 93, 'चौरानवे': 94, 'पंचानवे': 95, 'छियानवे': 96, 'सत्तानवे': 97, 'अट्ठानवे': 98, 'निन्यानवे': 99,

  // Marathi specific
  'दोन': 2, 'पाच': 5, 'सहा': 6, 'नऊ': 9, 'दहा': 10,
  'अकरा': 11, 'बारा': 12, 'तेरा': 13, 'चौदा': 14, 'पंधरा': 15, 'सोळा': 16, 'सतरा': 17, 'अठरा': 18, 'एकोणीस': 19,
  'वीस': 20, 'तीस': 30, 'चाळीस': 40, 'पन्नास': 50, 'ऐंशी': 80, 'नव्वद': 90,

  // Indian direct combinations
  'पाचशे': 500, 'दीडशे': 150, 'अडीचशे': 250, 'दोनशे': 200, 'तीनशे': 300, 'चारशे': 400
};

const MULT = {
  hundred: 100,
  thousand: 1000,
  lakh: 100000,
  lac: 100000,
  crore: 10000000,
  'सौ': 100,
  'शंभर': 100,
  'हज़ार': 1000,
  'हजार': 1000,
  'लाख': 100000,
  'करोड़': 10000000,
  'करोड': 10000000,
  'कोटी': 10000000
};

/**
 * Normalizes number phrases in a string into numeric digits.
 * Example: "I want to send पाँच सौ rupees" -> "I want to send 500 rupees"
 * Example: "Mera amount five thousand hai" -> "Mera amount 5000 hai"
 */
function normalizeNumbers(text) {
  if (!text) return '';
  const toks = String(text).normalize('NFC').split(/\s+/).filter(Boolean);
  const out = [];
  let total = 0, cur = 0, inRun = false;

  const flush = () => {
    if (inRun) {
      out.push(String(total + cur));
      total = 0;
      cur = 0;
      inRun = false;
    }
  };

  for (const t of toks) {
    const w = t.toLowerCase().replace(/[।॥,.?!]/g, '');
    if (w in UNITS) {
      cur += UNITS[w];
      inRun = true;
    } else if (w in MULT) {
      const m = MULT[w];
      if (m === 100) {
        cur = (cur || 1) * 100;
      } else {
        total += (cur || 1) * m;
        cur = 0;
      }
      inRun = true;
    } else {
      flush();
      out.push(w || t);
    }
  }
  flush();
  return out.join(' ');
}

module.exports = {
  normalizeNumbers,
  UNITS,
  MULT
};

