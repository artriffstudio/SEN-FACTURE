// ============================================================
// FACTURIM — Conversion des Nombres en Lettres (MRU - Ouguiyas)
// Support Français, Arabe, Anglais & Chinois conforme aux standards
// ============================================================

const UNITES_FR = [
  "",
  "un",
  "deux",
  "trois",
  "quatre",
  "cinq",
  "six",
  "sept",
  "huit",
  "neuf",
  "dix",
  "onze",
  "douze",
  "treize",
  "quatorze",
  "quinze",
  "seize",
  "dix-sept",
  "dix-huit",
  "dix-neuf",
];

const DIZAINES_FR = [
  "",
  "dix",
  "vingt",
  "trente",
  "quarante",
  "cinquante",
  "soixante",
  "soixante-dix",
  "quatre-vingts",
  "quatre-vingt-dix",
];

function convertCentainesFR(n: number): string {
  let res = "";
  const cent = Math.floor(n / 100);
  const reste = n % 100;

  if (cent > 0) {
    if (cent === 1) {
      res += "cent";
    } else {
      res += UNITES_FR[cent] + " cent";
      if (reste === 0) res += "s";
    }
  }

  if (reste > 0) {
    if (res !== "") res += " ";

    if (reste < 20) {
      res += UNITES_FR[reste];
    } else {
      const dizaine = Math.floor(reste / 10);
      const unite = reste % 10;

      if (dizaine === 7) {
        res += "soixante-" + (unite === 1 ? "et-onze" : UNITES_FR[10 + unite]);
      } else if (dizaine === 9) {
        res += "quatre-vingt-" + UNITES_FR[10 + unite];
      } else {
        if (unite === 0) {
          res += DIZAINES_FR[dizaine];
        } else if (unite === 1 && dizaine !== 8) {
          res += DIZAINES_FR[dizaine] + " et un";
        } else {
          res += DIZAINES_FR[dizaine] + "-" + UNITES_FR[unite];
        }
      }
    }
  }

  return res;
}

export function numberToWordsFR(amount: number): string {
  const integerPart = Math.floor(Math.abs(amount));
  if (integerPart === 0) return "zéro Ouguiya";

  const milliards = Math.floor(integerPart / 1_000_000_000);
  const millions = Math.floor((integerPart % 1_000_000_000) / 1_000_000);
  const milliers = Math.floor((integerPart % 1_000_000) / 1000);
  const unites = integerPart % 1000;

  const parts: string[] = [];

  if (milliards > 0) {
    parts.push(
      milliards === 1 ? "un milliard" : convertCentainesFR(milliards) + " milliards"
    );
  }

  if (millions > 0) {
    parts.push(
      millions === 1 ? "un million" : convertCentainesFR(millions) + " millions"
    );
  }

  if (milliers > 0) {
    if (milliers === 1) {
      parts.push("mille");
    } else {
      parts.push(convertCentainesFR(milliers) + " mille");
    }
  }

  if (unites > 0) {
    parts.push(convertCentainesFR(unites));
  }

  const result = parts.join(" ").trim();
  return result.charAt(0).toUpperCase() + result.slice(1);
}

// Support Arabe
const ONES_AR = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة"];
const TENS_AR = ["", "عشرة", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
const HUNDREDS_AR = ["", "مائة", "مئتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];

function convertThreeDigitsAR(n: number): string {
  const res: string[] = [];
  const h = Math.floor(n / 100);
  const remainder = n % 100;
  const t = Math.floor(remainder / 10);
  const u = remainder % 10;

  if (h > 0) res.push(HUNDREDS_AR[h]);

  if (remainder > 0) {
    if (remainder <= 10) {
      res.push(ONES_AR[remainder]);
    } else if (remainder === 11) {
      res.push("أحد عشر");
    } else if (remainder === 12) {
      res.push("اثنا عشر");
    } else if (remainder < 20) {
      res.push(ONES_AR[u] + " عشر");
    } else {
      if (u > 0) {
        res.push(ONES_AR[u] + " و" + TENS_AR[t]);
      } else {
        res.push(TENS_AR[t]);
      }
    }
  }

  return res.join(" و");
}

export function numberToWordsAR(amount: number): string {
  const integerPart = Math.floor(Math.abs(amount));
  if (integerPart === 0) return "صفر أوقية";

  const millions = Math.floor((integerPart % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((integerPart % 1_000_000) / 1000);
  const units = integerPart % 1000;

  const parts: string[] = [];

  if (millions > 0) {
    if (millions === 1) parts.push("مليون");
    else if (millions === 2) parts.push("مليونان");
    else if (millions >= 3 && millions <= 10) parts.push(convertThreeDigitsAR(millions) + " ملايين");
    else parts.push(convertThreeDigitsAR(millions) + " مليون");
  }

  if (thousands > 0) {
    if (thousands === 1) parts.push("ألف");
    else if (thousands === 2) parts.push("ألفان");
    else if (thousands >= 3 && thousands <= 10) parts.push(convertThreeDigitsAR(thousands) + " آلاف");
    else parts.push(convertThreeDigitsAR(thousands) + " ألف");
  }

  if (units > 0) {
    parts.push(convertThreeDigitsAR(units));
  }

  return parts.join(" و");
}

// Support Anglais
const ONES_EN = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS_EN = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function convertThreeDigitsEN(n: number): string {
  let res = "";
  const h = Math.floor(n / 100);
  const remainder = n % 100;

  if (h > 0) {
    res += ONES_EN[h] + " hundred";
    if (remainder > 0) res += " and ";
  }

  if (remainder > 0) {
    if (remainder < 20) {
      res += ONES_EN[remainder];
    } else {
      const t = Math.floor(remainder / 10);
      const u = remainder % 10;
      res += TENS_EN[t];
      if (u > 0) res += "-" + ONES_EN[u];
    }
  }
  return res;
}

export function numberToWordsEN(amount: number): string {
  const integerPart = Math.floor(Math.abs(amount));
  if (integerPart === 0) return "Zero Ouguiya";

  const millions = Math.floor((integerPart % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((integerPart % 1_000_000) / 1000);
  const units = integerPart % 1000;

  const parts: string[] = [];
  if (millions > 0) parts.push(convertThreeDigitsEN(millions) + " million");
  if (thousands > 0) parts.push(convertThreeDigitsEN(thousands) + " thousand");
  if (units > 0) parts.push(convertThreeDigitsEN(units));

  const result = parts.join(" ").trim();
  return result.charAt(0).toUpperCase() + result.slice(1);
}

// Support Chinois (Majuscules financières Daxie)
const CHINESE_DIGITS = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
const CHINESE_UNITS = ["", "拾", "佰", "仟"];

export function numberToWordsZH(amount: number): string {
  const integerPart = Math.floor(Math.abs(amount));
  if (integerPart === 0) return "零乌吉亚整";

  const s = integerPart.toString();
  let res = "";
  for (let i = 0; i < s.length; i++) {
    const digit = parseInt(s[i], 10);
    const unit = CHINESE_UNITS[(s.length - 1 - i) % 4];
    res += CHINESE_DIGITS[digit] + (digit !== 0 ? unit : "");
  }
  return res + " 乌吉亚整";
}

/**
 * Génère la mention légale complète avec la somme en toutes lettres dans la langue active
 */
export function getLegalAmountInWords(amount: number, language: string = "fr"): string {
  if (language === "ar") {
    const words = numberToWordsAR(amount);
    return `حُـررت هذه الفاتورة بمبلغ إجمالي قدره : ${words} أوقية (MRU)`;
  }
  if (language === "zh") {
    const words = numberToWordsZH(amount);
    return `本发票核定总金额大写为：${words} (MRU)`;
  }
  if (language === "en") {
    const words = numberToWordsEN(amount);
    return `This invoice is certified to the total amount of: ${words} Ouguiyas (MRU)`;
  }
  
  const words = numberToWordsFR(amount);
  return `Arrêtée la présente facture à la somme de : ${words} Ouguiyas (MRU)`;
}
