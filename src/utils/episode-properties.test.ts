import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { EndTimesheetInputSchema, StartTimesheetInputSchema, episodeMetricsShape } from '../types/schemas.js';
import { describeEpisodeMetrics, episodeMetricsToProperties, readEpisodeMetrics } from './episode-properties.js';

// Notion page properties as returned by GET/query for a fully populated row
const populatedPageProperties = {
  Weight: { id: 'a', type: 'number', number: 0.5 },
  'Active min': { id: 'b', type: 'number', number: 42 },
  Interruptions: { id: 'c', type: 'number', number: 3 },
  Switches: { id: 'd', type: 'number', number: 17 },
  Evidence: {
    id: 'e',
    type: 'rich_text',
    rich_text: [
      { type: 'text', text: { content: 'analyser 30m, ' }, plain_text: 'analyser 30m, ' },
      { type: 'text', text: { content: 'slack 12m' }, plain_text: 'slack 12m' },
    ],
  },
};

// A row written before the episode properties existed: numbers null, evidence empty
const legacyPageProperties = {
  Weight: { id: 'a', type: 'number', number: null },
  'Active min': { id: 'b', type: 'number', number: null },
  Evidence: { id: 'e', type: 'rich_text', rich_text: [] },
};

describe('episodeMetricsToProperties', () => {
  it('maps every metric to its Notion property name and type', () => {
    expect(
      episodeMetricsToProperties({ weight: 0.25, activeMin: 30, interruptions: 2, switches: 9, evidence: 'repo work' }),
    ).toEqual({
      Weight: { number: 0.25 },
      'Active min': { number: 30 },
      Interruptions: { number: 2 },
      Switches: { number: 9 },
      Evidence: { rich_text: [{ text: { content: 'repo work' } }] },
    });
  });

  it('omits metrics that are not set and keeps zeros', () => {
    expect(episodeMetricsToProperties({ interruptions: 0 })).toEqual({ Interruptions: { number: 0 } });
    expect(episodeMetricsToProperties()).toEqual({});
  });

  it('splits evidence over 2000 characters into segments that join back', () => {
    const evidence = 'x'.repeat(2000) + 'y'.repeat(2000) + 'z'.repeat(5);
    const { Evidence } = episodeMetricsToProperties({ evidence }) as { Evidence: { rich_text: any[] } };
    expect(Evidence.rich_text.map((segment) => segment.text.content.length)).toEqual([2000, 2000, 5]);
    expect(readEpisodeMetrics({ Evidence }).evidence).toBe(evidence);
  });
});

describe('readEpisodeMetrics', () => {
  it('reads every metric from a populated page', () => {
    expect(readEpisodeMetrics(populatedPageProperties)).toEqual({
      weight: 0.5,
      activeMin: 42,
      interruptions: 3,
      switches: 17,
      evidence: 'analyser 30m, slack 12m',
    });
  });

  it('returns null numbers and empty evidence for unset or missing properties', () => {
    expect(readEpisodeMetrics(legacyPageProperties)).toEqual({
      weight: null,
      activeMin: null,
      interruptions: null,
      switches: null,
      evidence: '',
    });
  });
});

describe('describeEpisodeMetrics', () => {
  it('lists only the metrics that are set', () => {
    expect(describeEpisodeMetrics({ weight: 1, evidence: 'abc' })).toBe('\n- Weight: 1\n- Evidence: 3 chars');
    expect(describeEpisodeMetrics({})).toBe('');
  });
});

describe('episodeMetricsShape', () => {
  const metrics = z.object(episodeMetricsShape);

  it.each([
    ['weight above 1', { weight: 1.5 }],
    ['negative weight', { weight: -0.1 }],
    ['negative count', { interruptions: -1 }],
    ['non-integer count', { activeMin: 2.5 }],
    ['empty evidence', { evidence: '' }],
  ])('rejects %s', (_, input) => {
    expect(metrics.safeParse(input).success).toBe(false);
  });

  it('is accepted by both startTimesheet and endTimesheet', () => {
    const input = { weight: 0.5, activeMin: 10, interruptions: 1, switches: 4, evidence: 'e' };
    expect(StartTimesheetInputSchema.parse({ description: 'd', ...input })).toMatchObject(input);
    expect(EndTimesheetInputSchema.parse({ timesheetId: 'id', ...input })).toMatchObject(input);
  });
});
