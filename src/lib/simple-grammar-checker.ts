// Simple browser-compatible grammar and style checker
export interface SimpleIssue {
  index: number;
  offset: number;
  reason: string;
}

// Common passive voice indicators
const passiveIndicators = [
  /\b(am|is|are|was|were|being|been|be)\s+\w*ed\b/gi,
  /\b(am|is|are|was|were|being|been|be)\s+\w*en\b/gi,
];

// Weasel words that weaken statements  
const weaselWords = [
  /\b(quite|very|really|rather|pretty|somewhat|fairly|sort of|kind of)\b/gi,
  /\b(many|most|some|few|several|various|certain|particular)\b/gi,
  /\b(could|should|would|might|may|can|will)\b/gi,
];

// Common adverbs that can often be removed
const adverbs = [
  /\b\w+ly\b/g,
];

// Overused/cliche phrases
const cliches = [
  /\b(at the end of the day|think outside the box|low hanging fruit|paradigm shift)\b/gi,
  /\b(game changer|move the needle|circle back|touch base)\b/gi,
  /\b(it goes without saying|needless to say|last but not least)\b/gi,
];

// Redundant phrases
const redundancies = [
  /\b(absolutely certain|completely finish|end result|final outcome)\b/gi,
  /\b(past history|advance planning|future plans|close proximity)\b/gi,
];

export function simpleGrammarCheck(text: string): SimpleIssue[] {
  const issues: SimpleIssue[] = [];

  // Check for passive voice
  passiveIndicators.forEach(regex => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      issues.push({
        index: match.index,
        offset: match[0].length,
        reason: "Consider using active voice instead of passive voice"
      });
    }
  });

  // Check for weasel words
  weaselWords.forEach(regex => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      issues.push({
        index: match.index,
        offset: match[0].length,
        reason: "Avoid weasel words that weaken your statement"
      });
    }
  });

  // Check for excessive adverbs
  const adverbMatches = text.match(adverbs[0]) || [];
  adverbMatches.forEach(adverb => {
    const index = text.indexOf(adverb);
    if (index !== -1) {
      issues.push({
        index,
        offset: adverb.length,
        reason: "Consider removing unnecessary adverb for stronger writing"
      });
    }
  });

  // Check for cliches
  cliches.forEach(regex => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      issues.push({
        index: match.index,
        offset: match[0].length,
        reason: "Replace cliche phrase with more original language"
      });
    }
  });

  // Check for redundancies
  redundancies.forEach(regex => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      issues.push({
        index: match.index,
        offset: match[0].length,
        reason: "Remove redundant phrase to improve conciseness"
      });
    }
  });

  // Sort by index for proper display order
  return issues.sort((a, b) => a.index - b.index);
}