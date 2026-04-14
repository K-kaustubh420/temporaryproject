// @ts-ignore
import nlp from 'compromise';
// @ts-ignore
import compromiseDates from 'compromise-dates';
// @ts-ignore
import compromiseNumbers from 'compromise-numbers';
// @ts-ignore
import compromiseSentences from 'compromise-sentences';
import Classifier from 'ml-classify-text';

import {
  KNOWLEDGE_GRAPH,
  TRAINING_CORPUS,
  IMPLICIT_ESCALATION_PATTERNS,
  FAKE_AUTHORITY_PATTERNS,
  PRIMARY_RESPONDER_MAP,
  THREAT_CREDIBILITY_VECTORS
} from './triage-constants';

nlp.extend(compromiseDates);
nlp.extend(compromiseNumbers);
nlp.extend(compromiseSentences);

export interface TriageTag {
  label: string;
  confidence: number;
  source: 'Heuristic' | 'ML' | 'Hybrid';
}

export interface DeepTriageResult {
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  tags: TriageTag[];
  globalConfidence: number;
  internalSummary: string;
  customerReply: string;
  thoughtProcess: string[];
  riskForecast: {
    churnProbability: number;
    escalationNeeded: boolean;
  };
}

export function runGooseEngine(text: string): DeepTriageResult {
  const thoughts: string[] = ['Engine v15.0 (Final engine) Booting...'];
  const content = text.toLowerCase().trim();
  const doc = nlp(content);

  // -----------------------------
  // Soft Security Detection
  // -----------------------------
  const SOFT_SECURITY_PATTERNS = [
    'login attempt',
    'unfamiliar location',
    'new device',
    'unexpected login',
    'unrecognized activity',
    'not sure if this is expected'
  ];

  const isSoftSecurity = SOFT_SECURITY_PATTERNS.some(p =>
    content.includes(p)
  );

  // -----------------------------
  // Outage Severity Detection
  // -----------------------------
  const OUTAGE_SEVERITY_PATTERNS = [
    'production',
    'inaccessible',
    'down',
    'blocked',
    'all customers',
    'cannot proceed',
    'since yesterday',
    'ops team cannot',
    'dashboard inaccessible'
  ];

  const isSevereOutage = OUTAGE_SEVERITY_PATTERNS.some(p =>
    content.includes(p)
  );

  // -----------------------------
  // Pre-compute signals
  // -----------------------------
  const fakeAuthorityScore =
    FAKE_AUTHORITY_PATTERNS.filter(p =>
      content.includes(p.toLowerCase())
    ).length;

  const implicitEscalationScore =
    IMPLICIT_ESCALATION_PATTERNS.filter(p =>
      content.includes(p.toLowerCase())
    ).length * 1.2;

  // -----------------------------
  // ML Classifier
  // -----------------------------
  const classifier = new Classifier({ nGramMin: 1, nGramMax: 2 });
  Object.entries(TRAINING_CORPUS).forEach(([label, samples]) =>
    classifier.train(samples, label)
  );
  const mlPreds = classifier.predict(text);

  let rawTags: TriageTag[] = [];
  let maxPriorityScore = 0;

  // -----------------------------
  // Tag Scoring
  // -----------------------------
  Object.entries(KNOWLEDGE_GRAPH).forEach(([_, config]) => {
    const matchedVectors = config.vectors.filter(v =>
      content.includes(v)
    );
    const matchedTriggers = config.triggers.filter(t =>
      content.includes(t)
    );

    const hasHeuristic = matchedVectors.length > 0;
    const heuristicScore = hasHeuristic
      ? config.baseWeight + matchedTriggers.length * 0.5
      : 0;

    const mlMatch = mlPreds.find(p => p.label === config.label);
    const mlScore = mlMatch ? mlMatch.confidence * 5 : 0;

    let finalScore =
      hasHeuristic || mlScore > 3.5
        ? Math.max(heuristicScore + implicitEscalationScore, mlScore)
        : mlScore;

    if (config.label === 'Scam & Impersonation' && fakeAuthorityScore > 0)
      finalScore += 2.5;

    if (config.label === 'SLA & Compliance' && fakeAuthorityScore >= 2)
      finalScore -= 2.5;

    if (finalScore >= config.baseWeight - 0.5 || finalScore > 3.8) {
      rawTags.push({
        label: config.label,
        confidence: Math.min(99, Math.round((finalScore / 5) * 100)),
        source:
          hasHeuristic && mlScore > 0
            ? 'Hybrid'
            : hasHeuristic
            ? 'Heuristic'
            : 'ML'
      });

      if (finalScore > maxPriorityScore)
        maxPriorityScore = finalScore;
    }
  });

  // -----------------------------
  // Threat Credibility Gate
  // -----------------------------
  const hasThreats = rawTags.some(t => t.label === 'Threats & Violence');
  let isCredibleThreat = false;

  if (hasThreats) {
    const credibilitySignals = {
      hasTimeline:
        (doc as any).dates().found ||
        THREAT_CREDIBILITY_VECTORS.timelines.some(v =>
          content.includes(v)
        ),
      hasMeans: THREAT_CREDIBILITY_VECTORS.means.some(v =>
        content.includes(v)
      ),
      hasTarget: THREAT_CREDIBILITY_VECTORS.targets.some(v =>
        content.includes(v)
      ),
      hasIdentity:
        content.includes('my name is') ||
        content.includes('i am')
    };

    const score = Object.values(credibilitySignals).filter(Boolean).length;
    isCredibleThreat = score >= 2;

    thoughts.push(
      `Threat Credibility Score: ${score}/4. Credible: ${isCredibleThreat}`
    );

    rawTags = rawTags.filter(t =>
      ['Threats & Violence', 'Scam & Impersonation'].includes(t.label)
    );
  }

  // -----------------------------
  // Priority Resolution
  // -----------------------------
  let priority: DeepTriageResult['priority'] = 'Low';

  const hasOutage = rawTags.some(t => t.label === 'Platform & Outage');
  const hasSecurity = rawTags.some(t => t.label === 'Security & Breach');
  const isScam =
    rawTags.some(t => t.label === 'Scam & Impersonation') && !hasThreats;

  const forceOutageDominance = hasOutage && isSevereOutage;

  if (forceOutageDominance) {
    priority = 'Critical';
  } else if (hasThreats) {
    priority = isCredibleThreat ? 'Critical' : 'High';
  } else if (hasSecurity) {
    priority = isSoftSecurity ? 'Medium' : 'Critical';
  } else if (isScam) {
    priority = maxPriorityScore > 4.5 ? 'High' : 'Medium';
  } else {
    if (maxPriorityScore >= 4.2) priority = 'Critical';
    else if (maxPriorityScore >= 3.2) priority = 'High';
    else if (maxPriorityScore >= 2.2) priority = 'Medium';
  }

  // -----------------------------
  // Confidence Guardrails
  // -----------------------------
  let globalConfidence = 0;

  if (priority === 'Critical' || priority === 'High') {
    globalConfidence = Math.max(
      85,
      Math.round(Math.max(...rawTags.map(t => t.confidence), 0))
    );
  } else {
    globalConfidence =
      rawTags.length > 0
        ? Math.round(
            rawTags.reduce((a, b) => a + b.confidence, 0) / rawTags.length
          )
        : 0;
  }

  globalConfidence = Math.min(globalConfidence, 99);
  if (priority !== 'Low') globalConfidence = Math.max(globalConfidence, 60);

  // -----------------------------
  // Output
  // -----------------------------
  rawTags.sort((a, b) => b.confidence - a.confidence);

  const topTag = forceOutageDominance
    ? 'Platform & Outage'
    : rawTags[0]?.label || 'General Support';

  const responder = PRIMARY_RESPONDER_MAP[topTag] || 'Support';

  const internalSummary = `[${priority}] Primary: ${responder} (${topTag}). Credible: ${
    hasThreats ? isCredibleThreat : 'N/A'
  }. Automated triage — requires human verification before action.`;

  return {
    priority,
    tags: rawTags,
    globalConfidence,
    internalSummary,
    customerReply: generateSafeReply(
      priority,
      hasThreats,
      hasSecurity,
      isSoftSecurity,
      isScam,
      forceOutageDominance
    ),
    thoughtProcess: thoughts,
    riskForecast: {
      churnProbability: isScam ? 40 : 5,
      escalationNeeded: priority === 'Critical'
    }
  };
}

function generateSafeReply(
  priority: string,
  hasThreats: boolean,
  hasSecurity: boolean,
  isSoftSecurity: boolean,
  isScam: boolean,
  forceOutageDominance: boolean
): string {
  if (hasThreats)
    return 'We have received your message. Our safety and security teams have been notified to review this content in accordance with our safety policies.';

  if (forceOutageDominance)
    return 'We are actively investigating a production availability issue impacting customers. Our engineering team has been alerted and is working to restore service as quickly as possible. We will provide updates shortly.';

  if (hasSecurity && isSoftSecurity)
    return 'Thanks for reaching out. We noticed a potentially unusual login activity. Our security team can help confirm whether this behavior is expected and advise on next steps to keep your account secure.';

  if (isScam)
    return 'This message appears to be a fraudulent impersonation attempt. We do not see any verified authority associated with this email. Do not respond or share information.';

  if (priority === 'Critical')
    return 'We recognize the critical nature of this situation. The relevant teams have been alerted and are actively working to address the issues you’ve outlined.';

  return "Thanks for reaching out. We've categorized your request and a specialist will be with you shortly.";
}
