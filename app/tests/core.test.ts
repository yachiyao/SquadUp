import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildIcs, escapeIcsText, foldLine, googleCalendarUrl, icsFilename } from '../lib/calendarExport';
import { setWholeDay, slotKey, toggleSlot } from '../lib/draft';
import { hashPasscode, isUnlockTokenValid, unlockToken, verifyPasscode } from '../lib/passcode';
import { dateOverlaps, rankSlots, slotAttendees, voterCount, type VoteRow } from '../lib/scoring';
import type { SlotConfig } from '../lib/slots';
import { createEventSchema } from '../lib/validation';

describe('Validation: Event Creation & Capacity (1..20)', () => {
  const base = {
    title: '週五火鍋局',
    hostNickname: 'Alice',
    locations: [{ name: '辛殿麻辣鍋', mapUrl: 'https://maps.google.com/?q=xindian', notes: '松江南京站' }],
    passcode: '1234',
    maxParticipants: 20,
    expiryDays: 7,
    slotMode: 'COARSE' as const,
    hourStart: 9,
    hourEnd: 22,
  };

  it('accepts valid capacities between 1 and 20', () => {
    for (const cap of [1, 3, 10, 20]) {
      const res = createEventSchema.safeParse({ ...base, maxParticipants: cap });
      assert.equal(res.success, true, `capacity ${cap} should be valid`);
    }
  });

  it('rejects 0, 21, negative numbers, decimals, and NaN', () => {
    for (const bad of [0, -1, 21, 100, 3.5, Number.NaN]) {
      const res = createEventSchema.safeParse({ ...base, maxParticipants: bad });
      assert.equal(res.success, false, `capacity ${bad} should be rejected`);
    }
  });

  it('validates passcode length (3..8 non-whitespace chars) and optional empty string', () => {
    assert.equal(createEventSchema.safeParse({ ...base, passcode: '' }).success, true);
    assert.equal(createEventSchema.safeParse({ ...base, passcode: 'abc' }).success, true);
    assert.equal(createEventSchema.safeParse({ ...base, passcode: '12345678' }).success, true);
    assert.equal(createEventSchema.safeParse({ ...base, passcode: '12' }).success, false);
    assert.equal(createEventSchema.safeParse({ ...base, passcode: '123456789' }).success, false);
    assert.equal(createEventSchema.safeParse({ ...base, passcode: 'ab cd' }).success, false);
  });

  it('enforces max 3 candidate locations and valid http(s) URLs', () => {
    const fourLocations = [
      { name: 'A' },
      { name: 'B' },
      { name: 'C' },
      { name: 'D' },
    ];
    assert.equal(createEventSchema.safeParse({ ...base, locations: fourLocations }).success, false);
    assert.equal(
      createEventSchema.safeParse({
        ...base,
        locations: [{ name: 'Bad URL', mapUrl: 'javascript:alert(1)' }],
      }).success,
      false,
    );
  });
});

describe('Heatmap Overlaps & Top 3 Leaderboard Scoring', () => {
  const coarseConfig: SlotConfig = { slotMode: 'COARSE', hourStart: 9, hourEnd: 22 };
  const hourlyConfig: SlotConfig = { slotMode: 'HOURLY', hourStart: 18, hourEnd: 22 };

  it('counts ALL_DAY toward all coarse periods and computes Top 3 accurately', () => {
    const votes: VoteRow[] = [
      { participantId: 'p1', date: '2026-11-15', slot: 'ALL_DAY' },
      { participantId: 'p2', date: '2026-11-15', slot: 'EVENING' },
      { participantId: 'p3', date: '2026-11-15', slot: 'EVENING' },
      { participantId: 'p1', date: '2026-11-16', slot: 'MORNING' },
      { participantId: 'p2', date: '2026-11-16', slot: 'MORNING' },
    ];

    assert.equal(voterCount(votes), 3);

    const { map, max } = dateOverlaps(votes, coarseConfig);
    assert.equal(max, 3);
    assert.equal(map.get('2026-11-15')?.count, 3);
    assert.equal(map.get('2026-11-16')?.count, 2);

    const eveningAttendees = slotAttendees(votes, '2026-11-15', 'EVENING', coarseConfig);
    assert.deepEqual(eveningAttendees.sort(), ['p1', 'p2', 'p3']);

    const top = rankSlots(votes, coarseConfig, 3, 2);
    assert.equal(top.length, 2);
    assert.equal(top[0].date, '2026-11-15');
    assert.equal(top[0].slot, 'EVENING');
    assert.equal(top[0].count, 3);
    assert.equal(top[1].date, '2026-11-16');
    assert.equal(top[1].slot, 'MORNING');
    assert.equal(top[1].count, 2);
  });

  it('merges contiguous hourly slots with identical attendees', () => {
    const votes: VoteRow[] = [
      { participantId: 'p1', date: '2026-11-20', slot: '18:00-19:00' },
      { participantId: 'p1', date: '2026-11-20', slot: '19:00-20:00' },
      { participantId: 'p2', date: '2026-11-20', slot: '18:00-19:00' },
      { participantId: 'p2', date: '2026-11-20', slot: '19:00-20:00' },
    ];
    const top = rankSlots(votes, hourlyConfig, 3, 2);
    assert.equal(top.length, 1);
    assert.equal(top[0].slot, '18:00-20:00');
    assert.equal(top[0].count, 2);
  });

  it('toggles coarse ALL_DAY and individual periods cleanly in draft state', () => {
    let draft = new Set<string>();
    draft = toggleSlot(draft, '2026-11-15', 'ALL_DAY', coarseConfig);
    assert.equal(draft.has(slotKey('2026-11-15', 'ALL_DAY')), true);

    // Toggling one period when ALL_DAY is active expands to the remaining two periods
    draft = toggleSlot(draft, '2026-11-15', 'MORNING', coarseConfig);
    assert.equal(draft.has(slotKey('2026-11-15', 'ALL_DAY')), false);
    assert.equal(draft.has(slotKey('2026-11-15', 'AFTERNOON')), true);
    assert.equal(draft.has(slotKey('2026-11-15', 'EVENING')), true);

    draft = setWholeDay(draft, '2026-11-15', false, coarseConfig);
    assert.equal(draft.size, 0);
  });
});

describe('Calendar Export (.ics & Google Calendar)', () => {
  it('generates valid RFC 5545 .ics content and Google Calendar URL', () => {
    const input = {
      uid: 'evt_123',
      title: '揪一下：週五火鍋, 桌遊; 聚會',
      date: '2026-11-20',
      slot: 'EVENING',
      location: '台北車站',
      mapUrl: 'https://maps.google.com/?q=Taipei',
      description: '記得準時！',
      url: 'https://squadup.example/g/evt_123',
    };
    const ics = buildIcs(input, new Date('2026-11-09T00:00:00Z'));
    assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
    assert.match(ics, /UID:evt_123@squadup\r\n/);
    assert.match(ics, /DTSTART:20261120T180000\r\n/);
    assert.match(ics, /DTEND:20261120T210000\r\n/);
    assert.match(ics, /END:VCALENDAR\r\n$/);

    const gcal = googleCalendarUrl(input);
    assert.match(gcal, /^https:\/\/calendar\.google\.com\/calendar\/render\?/);
    assert.match(gcal, /dates=20261120T180000%2F20261120T210000/);

    assert.equal(escapeIcsText('a,b;c\nd'), 'a\\,b\\;c\\nd');
    const longLine = 'SUMMARY:' + 'あ'.repeat(40);
    for (const line of foldLine(longLine).split('\r\n')) {
      assert.ok(new TextEncoder().encode(line).length <= 75, 'folded line must be <= 75 UTF-8 bytes');
    }
    assert.equal(icsFilename('週五/火鍋:局*2026'), '週五 火鍋 局 2026.ics');
  });
});

describe('Passcode Hashing & Unlock Token', () => {
  it('hashes with scrypt and verifies timing-safely', () => {
    const hash = hashPasscode('2468');
    assert.equal(verifyPasscode('2468', hash), true);
    assert.equal(verifyPasscode('9999', hash), false);

    const tok = unlockToken('evt_1', hash);
    assert.equal(isUnlockTokenValid('evt_1', hash, tok), true);
    assert.equal(isUnlockTokenValid('evt_2', hash, tok), false);
    assert.equal(isUnlockTokenValid('evt_1', hash, 'tampered'), false);
  });
});
