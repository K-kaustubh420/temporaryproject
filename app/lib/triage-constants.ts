/**
 * GOOSE TRIAGER v14.0 - CONSTANTS (The Frozen Source of Truth)
 */

export const IMPLICIT_ESCALATION_PATTERNS = [
  'reassess how we proceed', 'operationally and commercially', 'clarity by eod',
  'confirm who owns', 'missing commitments', 'contractually agreed',
  'internal discussion regarding', 'next steps commercially', 'impact on our partnership'
];

export const FAKE_AUTHORITY_PATTERNS = [
  "law act 1861", "central investigation bureau", "department of research and anal",
  "chief of police (pc)", "ref case:", "attention dear", "juvenile pornographic",
  "sex offender registration", "ip traffic by the central"
];

export const PRIMARY_RESPONDER_MAP: Record<string, string> = {
  'Platform & Outage': 'Engineering',
  'Security & Breach': 'Security',
  'Billing & Financial': 'Finance',
  'SLA & Compliance': 'Legal',
  'Scam & Impersonation': 'Trust & Safety',
  'Threats & Violence': 'Trust & Safety',
  'Churn Risk': 'Customer Success',
  'General Support': 'Support'
};

export const THREAT_CREDIBILITY_VECTORS = {
  means: ['gun', 'bomb', 'knife', 'weapon', 'shooting', 'explode', 'firearm', 'assault rifle'],
  targets: ['office', 'building', 'address', 'hq', 'staff', 'employee', 'manager', 'ceo', 'your home'],
  timelines: ['today', 'tomorrow', 'tonight', 'pm', 'am', 'hour', 'minute', 'o\'clock']
};

export interface CategoryConfig {
  label: string;
  baseWeight: number;
  vectors: string[];
  triggers: string[];
}

export const KNOWLEDGE_GRAPH: Record<string, CategoryConfig> = {
  THREATS: {
    label: 'Threats & Violence',
    baseWeight: 4.9,
    vectors: ['kill', 'bomb', 'hurt', 'attack', 'violence', 'harm', 'physically', 'shooting', 'murder', 'assault'],
    triggers: ['find you', 'know where you live', 'pay the price', 'consequences']
  },
  IMPERSONATION: {
    label: 'Scam & Impersonation',
    baseWeight: 3.5,
    vectors: ['court notice', 'police', 'cbi', 'warrant', 'investigation bureau', 'prison', 'interpol', 'fbi'],
    triggers: ['24 hours', 'respond immediately', 'failure to respond', 'sex offender']
  },
  INFRASTRUCTURE: {
    label: 'Platform & Outage',
    baseWeight: 4.5,
    vectors: ['down', '500', '503', 'outage', 'unreachable', 'crash', 'broken', 'latency', 'api failure', 'timeout', 'offline', 'dashboard', 'access issue', 'intermittent'],
    triggers: ['impacting all users', 'blocking production', 'emergency']
  },
  SECURITY: {
    label: 'Security & Breach',
    baseWeight: 4.8, 
    vectors: ['hack', 'unauthorized', 'breach', 'exposed', 'phishing', 'vulnerability', 'exploit', 'leaked', 'compromised', 'suspicious login','login attempt',
    'unfamiliar location',
    'new device',
    'unrecognized activity',
    'unexpected login'],
    triggers: ['data leak', 'security incident', 'legal action']
  },
  FINANCIAL: {
    label: 'Billing & Financial',
    baseWeight: 3.5,
    vectors: ['charge', 'invoice', 'refund', 'overcharged', 'payment failed', 'credit card', 'subscription', 'billing', 'transaction'],
    triggers: ['double charged', 'unauthorized charge', 'dispute']
  },
  RETENTION: {
    label: 'Churn Risk',
    baseWeight: 4.0,
    vectors: ['cancel', 'switching', 'competitor', 'leaving', 'stop using', 'alternative', 'not renewing',    'evaluate other vendors',
    'considering other vendors',
    'looking at alternatives',
    'may need to move',
    'reconsidering'
],
    triggers: ['unhappy', 'dissatisfied', 'too expensive']
  },
  LEGAL: {
    label: 'SLA & Compliance',
    baseWeight: 4.2,
    vectors: ['sla', 'breach', 'contract', 'lawyer', 'legal', 'gdpr', 'ccpa', 'compliance', 'agreement'],
    triggers: ['formal notice', 'breach of contract', 'guarantee']
  },
  SUPPORT: {
    label: 'General Support',
    baseWeight: 1.5,
    vectors: ['how to', 'help', 'setup', 'guide', 'tutorial', 'question', 'configure'],
    triggers: ['assistance', 'confused']
  }
};

export const TRAINING_CORPUS: Record<string, string[]> = {
  'Threats & Violence': ["I will kill you", "Bomb threat to office", "Physical harm promised", "Violence against staff"],
  'Scam & Impersonation': ["Court notice prison", "Police investigation CBI", "Law act 1861 warrant"],
  'Platform & Outage': ["API 500 errors", "Production down", "Dashboard access issues"],
  'Security & Breach': ["Unauthorized login", "Database exposed", "MFA bypassed"],
  'Billing & Financial': ["Charged $500 instead of $50", "Need refund", "Charged twice"],
  'Churn Risk': ["Switching competitor", "Cancel subscription", "Unhappy close account"],
  'SLA & Compliance': ["Uptime violates SLA", "Notice of contract breach"],
  'General Support': ["How to add team member", "Configure webhooks"]
};