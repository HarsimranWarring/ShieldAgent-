export interface DetectionResult {
  detected: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  attackType: string;
  confidence: number;
  action: 'BLOCKED' | 'SANITIZED' | 'ALLOWED';
  originalContent: string;
  sanitizedContent: string;
  flaggedText: string;
  reasoning: string;
}

interface AttackPattern {
  category: string;
  patterns: RegExp[];
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  action: 'BLOCKED' | 'SANITIZED';
}

const attackPatterns: AttackPattern[] = [
  {
    category: 'Instruction Override',
    severity: 'CRITICAL',
    action: 'BLOCKED',
    patterns: [
      /ignore\s+(your\s+)?(all\s+)?(previous|prior|above|earlier)\s+instructions?/gi,
      /disregard\s+(your\s+)?(all\s+)?(previous|prior|system|above)\s+(instructions?|prompt|rules?)/gi,
      /forget\s+(everything|all|your)\s+(you\s+)?(were\s+)?(told|instructed|know)/gi,
      /override\s+(all\s+)?(your\s+)?(previous\s+)?(instructions?|settings?|rules?|prompt)/gi,
    ],
  },
  {
    category: 'Role Reassignment',
    severity: 'HIGH',
    action: 'SANITIZED',
    patterns: [
      /from\s+now\s+on[,\s]+you\s+are\s+(a|an|the)\s+/gi,
      /you\s+are\s+now\s+(a|an|the|an?\s+unrestricted)/gi,
      /act\s+as\s+(a|an|the)\s+.{0,50}(without|ignoring|bypass)/gi,
      /pretend\s+(you\s+are|to\s+be)\s+(a|an|the)\s+/gi,
      /roleplay\s+as\s+(a|an|the)\s+/gi,
    ],
  },
  {
    category: 'Safety Bypass',
    severity: 'HIGH',
    action: 'SANITIZED',
    patterns: [
      /ignore\s+(all\s+)?(safety|content)\s+(guidelines?|policies?|restrictions?|rules?|filters?)/gi,
      /without\s+(any\s+)?(restrictions?|limitations?|filtering|moderation|censorship)/gi,
      /bypass\s+(all\s+)?(safety|security|content)\s+(restrictions?|filters?|checks?|policies?)/gi,
      /operate\s+without\s+(restrictions?|limitations?|safety|guidelines?)/gi,
      /unrestricted\s+(ai|assistant|mode|access)/gi,
    ],
  },
  {
    category: 'Data Exfiltration',
    severity: 'HIGH',
    action: 'SANITIZED',
    patterns: [
      /output\s+(all|every|the\s+full|complete)\s+.{0,50}(database|records?|data|information)/gi,
      /send\s+(all|every|the\s+full)\s+.{0,50}(to\s+)?[\w.+-]+@[\w.-]+\.\w+/gi,
      /forward\s+(all|every|the)\s+.{0,50}(records?|data|information|emails?)/gi,
      /export\s+(the\s+)?(full|all|complete)\s+.{0,50}(database|user|credential)/gi,
      /regardless\s+of\s+(their\s+)?(consent|privacy|permission|settings?)/gi,
    ],
  },
  {
    category: 'Privilege Escalation',
    severity: 'CRITICAL',
    action: 'BLOCKED',
    patterns: [
      /escalate\s+(privileges?|permissions?|access)\s+(to\s+)?/gi,
      /access\s+(the\s+)?(admin|administrator|root|system)\s+(panel|console|interface|control)/gi,
      /bypass\s+(all\s+)?(security|authentication|authorization)\s+(restrictions?|checks?|measures?)/gi,
      /system\s+override/gi,
      /maintenance\s+mode\s+with\s+(elevated|admin|root)\s+permissions?/gi,
    ],
  },
  {
    category: 'Indirect Injection',
    severity: 'CRITICAL',
    action: 'BLOCKED',
    patterns: [
      /\[begin\s+injected?\s+content\]/gi,
      /developer\s+mode[:\s]+(enabled|activated|on)/gi,
      /jailbreak/gi,
      /dan\s+mode/gi,
      /output\s+(all\s+)?(confidential|sensitive|private|secret)\s+(user\s+)?(data|information|records?)/gi,
    ],
  },
];

const nlpKeywords: { term: string; weight: number; category: string }[] = [
  { term: 'ignore previous', weight: 0.9, category: 'Instruction Override' },
  { term: 'disregard system', weight: 0.85, category: 'Instruction Override' },
  { term: 'forget instructions', weight: 0.8, category: 'Instruction Override' },
  { term: 'new instructions', weight: 0.5, category: 'Instruction Override' },
  { term: 'you are now', weight: 0.6, category: 'Role Reassignment' },
  { term: 'act as', weight: 0.4, category: 'Role Reassignment' },
  { term: 'pretend you are', weight: 0.7, category: 'Role Reassignment' },
  { term: 'safety guidelines', weight: 0.5, category: 'Safety Bypass' },
  { term: 'no restrictions', weight: 0.65, category: 'Safety Bypass' },
  { term: 'all data', weight: 0.4, category: 'Data Exfiltration' },
  { term: 'all records', weight: 0.45, category: 'Data Exfiltration' },
  { term: 'admin panel', weight: 0.7, category: 'Privilege Escalation' },
  { term: 'escalate privileges', weight: 0.95, category: 'Privilege Escalation' },
  { term: 'injected content', weight: 0.9, category: 'Indirect Injection' },
  { term: 'developer mode', weight: 0.7, category: 'Indirect Injection' },
];

function extractFlaggedText(content: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const resetPattern = new RegExp(pattern.source, pattern.flags);
    const match = resetPattern.exec(content);
    if (match) {
      const start = Math.max(0, match.index - 20);
      const end = Math.min(content.length, match.index + match[0].length + 40);
      return content.substring(start, end).trim();
    }
  }
  return '';
}

function sanitizeContent(content: string, patterns: RegExp[]): string {
  const lines = content.split('\n');
  const cleanedLines = lines.map(line => {
    for (const pattern of patterns) {
      const resetPattern = new RegExp(pattern.source, pattern.flags);
      if (resetPattern.test(line)) {
        return '[INJECTION REMOVED - Malicious instruction detected and blocked]';
      }
    }
    return line;
  });

  return cleanedLines.join('\n');
}

function layer1Detection(content: string): {
  matched: boolean;
  pattern: AttackPattern | null;
  flaggedText: string;
} {
  for (const attackPattern of attackPatterns) {
    for (const regex of attackPattern.patterns) {
      const resetRegex = new RegExp(regex.source, regex.flags);
      if (resetRegex.test(content)) {
        const flaggedText = extractFlaggedText(content, attackPattern.patterns);
        return { matched: true, pattern: attackPattern, flaggedText };
      }
    }
  }
  return { matched: false, pattern: null, flaggedText: '' };
}

function layer2Detection(content: string): {
  score: number;
  topCategory: string;
  matchedTerms: string[];
} {
  const lowerContent = content.toLowerCase();
  let totalScore = 0;
  const categoryScores: Record<string, number> = {};
  const matchedTerms: string[] = [];

  for (const keyword of nlpKeywords) {
    if (lowerContent.includes(keyword.term)) {
      totalScore += keyword.weight;
      categoryScores[keyword.category] = (categoryScores[keyword.category] || 0) + keyword.weight;
      matchedTerms.push(keyword.term);
    }
  }

  const topCategory = Object.entries(categoryScores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

  return { score: Math.min(totalScore, 1.0), topCategory, matchedTerms };
}

export function analyzeContent(content: string): DetectionResult {
  const layer1Result = layer1Detection(content);

  if (layer1Result.matched && layer1Result.pattern) {
    const pattern = layer1Result.pattern;
    const sanitized = sanitizeContent(content, pattern.patterns);

    const baseConfidence = pattern.severity === 'CRITICAL' ? 95 : 88;
    const confidence = Math.min(99, baseConfidence + Math.floor(Math.random() * 5));

    const reasoningMap: Record<string, string> = {
      'Instruction Override': 'Direct instruction override pattern detected. The content contains explicit commands to ignore or disregard the AI system\'s existing instructions, a hallmark of prompt injection attacks.',
      'Role Reassignment': 'Role reassignment attack detected. Content attempts to redefine the AI\'s identity or role, potentially bypassing operational constraints and safety measures.',
      'Safety Bypass': 'Safety bypass attempt detected. Content contains explicit requests to operate without safety guidelines, content policies, or restrictions.',
      'Data Exfiltration': 'Data exfiltration command detected. Content contains instructions to output, forward, or export sensitive data, potentially to unauthorized recipients.',
      'Privilege Escalation': 'Critical privilege escalation attack detected. Content attempts to grant elevated permissions or access to restricted system components.',
      'Indirect Injection': 'Indirect prompt injection detected in external content. Malicious instructions embedded in third-party content intended to compromise the AI agent.',
    };

    return {
      detected: true,
      severity: pattern.severity,
      attackType: pattern.category,
      confidence,
      action: pattern.action,
      originalContent: content,
      sanitizedContent: sanitized,
      flaggedText: layer1Result.flaggedText,
      reasoning: reasoningMap[pattern.category] || 'Malicious pattern detected in input content.',
    };
  }

  // Layer 2: NLP semantic scoring
  const layer2Result = layer2Detection(content);

  if (layer2Result.score > 0.6) {
    const severity: 'HIGH' | 'MEDIUM' = layer2Result.score > 0.8 ? 'HIGH' : 'MEDIUM';
    const action: 'SANITIZED' | 'BLOCKED' = layer2Result.score > 0.8 ? 'BLOCKED' : 'SANITIZED';
    const confidence = Math.floor(layer2Result.score * 85);

    return {
      detected: true,
      severity,
      attackType: layer2Result.topCategory,
      confidence,
      action,
      originalContent: content,
      sanitizedContent: `[Content flagged by semantic analysis - ${layer2Result.matchedTerms.join(', ')} detected]\n\n${content}`,
      flaggedText: layer2Result.matchedTerms.join(', '),
      reasoning: `Semantic analysis detected suspicious keywords: ${layer2Result.matchedTerms.join(', ')}. Cumulative risk score: ${(layer2Result.score * 100).toFixed(0)}%. These terms are commonly associated with ${layer2Result.topCategory} attacks.`,
    };
  }

  return {
    detected: false,
    severity: 'NONE',
    attackType: 'None',
    confidence: 100,
    action: 'ALLOWED',
    originalContent: content,
    sanitizedContent: content,
    flaggedText: '',
    reasoning: 'No injection patterns detected. Content passed both regex pattern matching and semantic analysis layers.',
  };
}
