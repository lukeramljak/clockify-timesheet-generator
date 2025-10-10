import { describe, it, expect } from 'vitest';
import { generateFileName } from './timesheet';

describe('generateFileName', () => {
  const expectedOutput = 'USR Timesheet251124.xlsx';

  it('should format the file name correctly', () => {
    const fileName = generateFileName('USR', '2025-11-24');
    expect(fileName).toBe(expectedOutput);
  });
});
