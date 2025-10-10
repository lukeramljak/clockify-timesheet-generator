import type { ClockifyProject, ClockifyTimeEntry } from '$lib/types/clockify';
import {
  convertToDate,
  createMergeKey,
  formatTimeEntries,
  getCallNo,
  getCode,
  getDate,
  getDescription,
  getHours,
  getProjectName,
  mergeEntries,
  roundHours,
  sortTimeEntriesByCallNo,
  transformClockifyEntry,
  type FormattedTimeEntry
} from './time-entries';
import { describe, expect, it } from 'vitest';

const mockUser = {
  name: 'Mock User',
  userId: '1',
  workspaceId: '1',
  resource: 'USR',
  callNo: 'usr12345'
};

describe('getDate', () => {
  it('converts the timeInterval to en-GB date format', () => {
    const timeInterval: ClockifyTimeEntry['timeInterval'] = {
      start: new Date('2025-01-01T00:00:00Z'),
      end: new Date('2025-01-01T08:00:00Z'),
      duration: 'PT8H'
    };
    const date = getDate(timeInterval);
    expect(date).toBe('01/01/2025');
  });
});

describe('getHours', () => {
  it('converts the duration to a float', () => {
    const duration = 'PT34M7S';
    const hours = getHours(duration);
    expect(hours).toBeCloseTo(0.57);
  });

  it('handles empty duration string', () => {
    expect(getHours('')).toBe(0);
  });

  it('handles invalid duration format', () => {
    expect(getHours('invalid')).toBe(0);
  });

  it('handles only seconds', () => {
    expect(getHours('PT30S')).toBe(0.01);
  });

  it('handles only minutes', () => {
    expect(getHours('PT45M')).toBe(0.75);
  });

  it('handles only hours', () => {
    expect(getHours('PT5H')).toBe(5);
  });
});

describe('getCallNo', () => {
  it('extracts the callNo from a billable entry', () => {
    const billableDescription = 'abc12345 - Test Description';
    const callNo = getCallNo(billableDescription);
    expect(callNo).toBe('abc12345');
  });

  it('handles description without separator', () => {
    const description = 'NoSeparator';
    expect(getCallNo(description)).toBe('NoSeparator');
  });
});

describe('getCode', () => {
  it('extracts the code from a callNo', () => {
    const billableDescription = 'abc12345 - Test Description';
    const code = getCode(billableDescription);
    expect(code).toBe('abc');
  });

  it('throws error when callNo has no letters', () => {
    const description = '12345 - Task';
    expect(() => getCode(description)).toThrow();
  });
});

describe('getDescription', () => {
  it('extracts the description from a billable entry', () => {
    const billableDescription = 'abc12345 - Test Description';
    const description = getDescription(billableDescription);
    expect(description).toBe('Test Description');
  });

  it('handles description with multiple dashes', () => {
    const description = 'abc12345 - Part-1 - More details';
    expect(getDescription(description)).toBe('Part-1 - More details');
  });

  it('handles description with no dash separator', () => {
    const description = 'NoSeparator';
    expect(getDescription(description)).toBe('');
  });
});

describe('getProjectName', () => {
  it('gets the correct project name', () => {
    const projects: ClockifyProject[] = [
      {
        id: '1234',
        name: 'Test Project'
      }
    ] as ClockifyProject[];
    const projectName = getProjectName(projects, '1234');
    expect(projectName).toBe('Test Project');
  });

  it('returns an empty string if no project is found', () => {
    const projects: ClockifyProject[] = [];
    const projectName = getProjectName(projects, '1234');
    expect(projectName).toBe('');
  });
});

describe('sortEntriesByCallNo', () => {
  it('sorts time entries alphabetically and numerically by callNo', () => {
    const timeEntries: FormattedTimeEntry[] = [
      {
        resource: mockUser.resource,
        date: '22/11/2025',
        code: 'net',
        hours: 8,
        callNo: mockUser.callNo,
        description: 'Description'
      },
      {
        resource: mockUser.resource,
        date: '22/11/2025',
        code: 'abc',
        hours: 8,
        callNo: 'abc23456',
        description: 'Description'
      },
      {
        resource: mockUser.resource,
        date: '22/11/2025',
        code: 'abc',
        hours: 8,
        callNo: 'abc12345',
        description: 'Description'
      },
      {
        resource: mockUser.resource,
        date: '22/11/2025',
        code: 'xyz',
        hours: 8,
        callNo: 'xyz12345',
        description: 'Description'
      },
      {
        resource: mockUser.resource,
        date: '22/11/2025',
        code: 'def',
        hours: 8,
        callNo: 'def12345',
        description: 'Description'
      }
    ];

    const expectedOutcome: FormattedTimeEntry[] = [
      {
        resource: mockUser.resource,
        date: '22/11/2025',
        code: 'abc',
        hours: 8,
        callNo: 'abc12345',
        description: 'Description'
      },
      {
        resource: mockUser.resource,
        date: '22/11/2025',
        code: 'abc',
        hours: 8,
        callNo: 'abc23456',
        description: 'Description'
      },
      {
        resource: mockUser.resource,
        date: '22/11/2025',
        code: 'def',
        hours: 8,
        callNo: 'def12345',
        description: 'Description'
      },
      {
        resource: mockUser.resource,
        date: '22/11/2025',
        code: 'net',
        hours: 8,
        callNo: mockUser.callNo,
        description: 'Description'
      },
      {
        resource: mockUser.resource,
        date: '22/11/2025',
        code: 'xyz',
        hours: 8,
        callNo: 'xyz12345',
        description: 'Description'
      }
    ];

    const sortedEntries = sortTimeEntriesByCallNo(timeEntries);

    expect(sortedEntries).toEqual(expectedOutcome);
  });

  it('sorts by date when callNos are the same', () => {
    const timeEntries: FormattedTimeEntry[] = [
      {
        resource: mockUser.resource,
        date: '23/11/2025',
        code: 'abc',
        hours: 8,
        callNo: 'abc12345',
        description: 'Later'
      },
      {
        resource: mockUser.resource,
        date: '22/11/2025',
        code: 'abc',
        hours: 8,
        callNo: 'abc12345',
        description: 'Earlier'
      }
    ];

    const sortedEntries = sortTimeEntriesByCallNo(timeEntries);

    expect(sortedEntries[0].date).toBe('22/11/2025');
    expect(sortedEntries[1].date).toBe('23/11/2025');
  });
});

describe('convertToDate', () => {
  it('converts DD/MM/YYYY format correctly', () => {
    const date = convertToDate('22/11/2025');
    expect(date.getDate()).toBe(22);
    expect(date.getMonth()).toBe(10); // 0-indexed
    expect(date.getFullYear()).toBe(2025);
  });

  it('handles single digit dates', () => {
    const date = convertToDate('1/1/2025');
    expect(date.getDate()).toBe(1);
    expect(date.getMonth()).toBe(0);
    expect(date.getFullYear()).toBe(2025);
  });

  it('handles malformed date string', () => {
    const date = convertToDate('invalid');
    expect(isNaN(date.getTime())).toBe(true);
  });
});

describe('transformClockifyEntry', () => {
  it('transforms a billable entry correctly', () => {
    const entry: ClockifyTimeEntry = {
      billable: true,
      description: 'abc12345 - Task Description',
      timeInterval: {
        start: new Date('2025-11-22T00:00:00Z'),
        end: new Date('2025-11-22T08:00:00Z'),
        duration: 'PT8H'
      }
    } as ClockifyTimeEntry;

    const result = transformClockifyEntry({
      entry,
      resource: mockUser.resource,
      callNo: mockUser.callNo,
      projects: undefined
    });

    expect(result).toEqual({
      resource: mockUser.resource,
      date: '22/11/2025',
      code: 'abc',
      hours: 8,
      callNo: 'abc12345',
      description: 'Task Description'
    });
  });

  it('transforms a non-billable entry correctly', () => {
    const entry: ClockifyTimeEntry = {
      billable: false,
      description: 'Non-billable task',
      timeInterval: {
        start: new Date('2025-11-22T00:00:00Z'),
        end: new Date('2025-11-22T08:00:00Z'),
        duration: 'PT8H'
      }
    } as ClockifyTimeEntry;

    const result = transformClockifyEntry({
      entry,
      resource: mockUser.resource,
      callNo: mockUser.callNo,
      projects: undefined
    });

    expect(result).toEqual({
      resource: mockUser.resource,
      date: '22/11/2025',
      code: 'net',
      hours: 8,
      callNo: mockUser.callNo,
      description: 'Non-billable task'
    });
  });

  it('includes project name when projects are provided', () => {
    const entry: ClockifyTimeEntry = {
      billable: true,
      description: 'abc12345 - Task Description',
      projectId: '1234',
      timeInterval: {
        start: new Date('2025-11-22T00:00:00Z'),
        end: new Date('2025-11-22T08:00:00Z'),
        duration: 'PT8H'
      }
    } as ClockifyTimeEntry;

    const projects: ClockifyProject[] = [
      {
        id: '1234',
        name: 'Test Project'
      }
    ] as ClockifyProject[];

    const result = transformClockifyEntry({
      entry,
      resource: mockUser.resource,
      callNo: mockUser.callNo,
      projects
    });

    expect(result).toEqual({
      resource: mockUser.resource,
      date: '22/11/2025',
      code: 'abc',
      hours: 8,
      callNo: 'abc12345',
      description: 'Test Project - Task Description'
    });
  });
});

describe('roundHours', () => {
  it('rounds hours to 2 decimal places', () => {
    expect(roundHours(1.234567)).toBe(1.23);
  });

  it('rounds up correctly', () => {
    expect(roundHours(1.995)).toBe(2);
  });

  it('handles whole numbers', () => {
    expect(roundHours(8)).toBe(8);
  });

  it('handles small decimals', () => {
    expect(roundHours(0.005)).toBe(0.01);
  });
});

describe('mergeEntries', () => {
  it('handles empty array', () => {
    expect(mergeEntries([])).toEqual([]);
  });

  it('merges entries with the same merge key', () => {
    const entries: FormattedTimeEntry[] = [
      {
        resource: mockUser.resource,
        date: '22/11/2025',
        code: 'abc',
        hours: 4,
        callNo: 'abc12345',
        description: 'Task 1'
      },
      {
        resource: mockUser.resource,
        date: '22/11/2025',
        code: 'abc',
        hours: 4,
        callNo: 'abc12345',
        description: 'Task 1'
      }
    ];

    const result = mergeEntries(entries);

    expect(result).toHaveLength(1);
    expect(result[0].hours).toBe(8);
  });

  it('keeps separate entries with different merge keys', () => {
    const entries: FormattedTimeEntry[] = [
      {
        resource: mockUser.resource,
        date: '22/11/2025',
        code: 'abc',
        hours: 4,
        callNo: 'abc12345',
        description: 'Task 1'
      },
      {
        resource: mockUser.resource,
        date: '22/11/2025',
        code: 'abc',
        hours: 4,
        callNo: 'abc12345',
        description: 'Task 2'
      }
    ];

    const result = mergeEntries(entries);

    expect(result).toHaveLength(2);
  });

  it('rounds merged hours correctly', () => {
    const entries: FormattedTimeEntry[] = [
      {
        resource: mockUser.resource,
        date: '22/11/2025',
        code: 'abc',
        hours: 1.111,
        callNo: 'abc12345',
        description: 'Task 1'
      },
      {
        resource: mockUser.resource,
        date: '22/11/2025',
        code: 'abc',
        hours: 2.222,
        callNo: 'abc12345',
        description: 'Task 1'
      },
      {
        resource: mockUser.resource,
        date: '22/11/2025',
        code: 'abc',
        hours: 3.333,
        callNo: 'abc12345',
        description: 'Task 1'
      }
    ];

    const result = mergeEntries(entries);

    expect(result).toHaveLength(1);
    expect(result[0].hours).toBe(6.66);
  });

  it('handles multiple groups of mergeable entries', () => {
    const entries: FormattedTimeEntry[] = [
      {
        resource: mockUser.resource,
        date: '22/11/2025',
        code: 'abc',
        hours: 2,
        callNo: 'abc12345',
        description: 'Task 1'
      },
      {
        resource: mockUser.resource,
        date: '22/11/2025',
        code: 'abc',
        hours: 3,
        callNo: 'abc12345',
        description: 'Task 1'
      },
      {
        resource: mockUser.resource,
        date: '22/11/2025',
        code: 'xyz',
        hours: 4,
        callNo: 'xyz98765',
        description: 'Task 2'
      },
      {
        resource: mockUser.resource,
        date: '22/11/2025',
        code: 'xyz',
        hours: 5,
        callNo: 'xyz98765',
        description: 'Task 2'
      }
    ];

    const result = mergeEntries(entries);

    expect(result).toHaveLength(2);
    expect(result.find((e) => e.callNo === 'abc12345')?.hours).toBe(5);
    expect(result.find((e) => e.callNo === 'xyz98765')?.hours).toBe(9);
  });
});

describe('createMergeKey', () => {
  it('creates a unique merge key for a time entry', () => {
    const entry: FormattedTimeEntry = {
      resource: mockUser.resource,
      date: '22/11/2025',
      code: 'abc',
      hours: 8,
      callNo: 'abc12345',
      description: 'Description'
    };
    const mergeKey = createMergeKey({
      date: entry.date,
      code: entry.code,
      description: entry.description,
      callNo: entry.callNo
    });
    expect(mergeKey).toBe('22/11/2025_abc_Description_abc12345');
  });
});

describe('formatTimeEntries', () => {
  it('handles empty time entries array', () => {
    const result = formatTimeEntries({
      resource: mockUser.resource,
      callNo: mockUser.callNo,
      timeEntries: []
    });
    expect(result).toEqual([]);
  });

  it('orchestrates transformation, merging, and sorting correctly', () => {
    const projects: ClockifyProject[] = [
      {
        id: '1234',
        name: 'Project Management'
      }
    ] as ClockifyProject[];

    const timeEntries: ClockifyTimeEntry[] = [
      // Duplicate entries that should merge
      {
        billable: true,
        description: 'xyz99999 - Task A',
        projectId: '1234',
        timeInterval: {
          start: new Date('2025-11-22T00:00:00Z'),
          end: new Date('2025-11-22T04:00:00Z'),
          duration: 'PT4H'
        }
      },
      {
        billable: true,
        description: 'xyz99999 - Task A',
        projectId: '1234',
        timeInterval: {
          start: new Date('2025-11-22T04:00:00Z'),
          end: new Date('2025-11-22T08:00:00Z'),
          duration: 'PT4H'
        }
      },
      // Different callNo - should be sorted first
      {
        billable: true,
        description: 'abc12345 - Task B',
        projectId: '1234',
        timeInterval: {
          start: new Date('2025-11-22T00:00:00Z'),
          end: new Date('2025-11-22T08:00:00Z'),
          duration: 'PT8H'
        }
      },
      // Non-billable entry
      {
        billable: false,
        description: 'Non-billable work',
        projectId: '1234',
        timeInterval: {
          start: new Date('2025-11-22T00:00:00Z'),
          end: new Date('2025-11-22T02:00:00Z'),
          duration: 'PT2H'
        }
      }
    ] as ClockifyTimeEntry[];

    const result = formatTimeEntries({
      resource: mockUser.resource,
      callNo: mockUser.callNo,
      projects,
      timeEntries
    });

    // Should have 3 entries (2 merged into 1, plus 2 others)
    expect(result).toHaveLength(3);

    // Should be sorted by callNo
    expect(result[0].callNo).toBe('abc12345');
    expect(result[1].callNo).toBe(mockUser.callNo);
    expect(result[2].callNo).toBe('xyz99999');

    // Merged entry should have combined hours
    expect(result[2].hours).toBe(8);

    // Should include project names
    expect(result[0].description).toBe('Project Management - Task B');

    // Non-billable should have 'net' code
    expect(result[1].code).toBe('net');
  });
});
