// Episode metrics on a timesheet row: the silver-layer fields written by /timesheet.

export interface EpisodeMetrics {
  weight?: number;
  activeMin?: number;
  interruptions?: number;
  switches?: number;
  evidence?: string;
}

export interface EpisodeMetricsEntry {
  weight: number | null;
  activeMin: number | null;
  interruptions: number | null;
  switches: number | null;
  evidence: string;
}

const NUMBER_PROPERTIES = {
  weight: 'Weight',
  activeMin: 'Active min',
  interruptions: 'Interruptions',
  switches: 'Switches',
} as const;

const EVIDENCE_PROPERTY = 'Evidence';

// Notion caps each rich_text segment at 2000 characters.
const RICH_TEXT_SEGMENT_LIMIT = 2000;

function toRichText(text: string) {
  const segments = [];
  for (let i = 0; i < text.length; i += RICH_TEXT_SEGMENT_LIMIT) {
    segments.push({ text: { content: text.slice(i, i + RICH_TEXT_SEGMENT_LIMIT) } });
  }
  return segments;
}

export function episodeMetricsToProperties(metrics: EpisodeMetrics = {}): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  for (const [field, name] of Object.entries(NUMBER_PROPERTIES)) {
    const value = metrics[field as keyof typeof NUMBER_PROPERTIES];
    if (value !== undefined) {
      properties[name] = { number: value };
    }
  }
  if (metrics.evidence !== undefined) {
    properties[EVIDENCE_PROPERTY] = { rich_text: toRichText(metrics.evidence) };
  }
  return properties;
}

// Summary lines ("- Weight: 0.5") for the metrics that are set, for tool responses
export function describeEpisodeMetrics(metrics: EpisodeMetrics): string {
  const lines = Object.entries(NUMBER_PROPERTIES)
    .filter(([field]) => metrics[field as keyof typeof NUMBER_PROPERTIES] !== undefined)
    .map(([field, name]) => `\n- ${name}: ${metrics[field as keyof typeof NUMBER_PROPERTIES]}`);
  if (metrics.evidence !== undefined) {
    lines.push(`\n- ${EVIDENCE_PROPERTY}: ${metrics.evidence.length} chars`);
  }
  return lines.join('');
}

export function readEpisodeMetrics(properties: any): EpisodeMetricsEntry {
  const evidenceSegments: any[] = properties[EVIDENCE_PROPERTY]?.rich_text ?? [];
  return {
    weight: properties[NUMBER_PROPERTIES.weight]?.number ?? null,
    activeMin: properties[NUMBER_PROPERTIES.activeMin]?.number ?? null,
    interruptions: properties[NUMBER_PROPERTIES.interruptions]?.number ?? null,
    switches: properties[NUMBER_PROPERTIES.switches]?.number ?? null,
    evidence: evidenceSegments.map((segment) => segment.plain_text ?? segment.text?.content ?? '').join(''),
  };
}
