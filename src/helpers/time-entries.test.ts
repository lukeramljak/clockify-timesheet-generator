import {
  formatTimeEntries,
  getCallNo,
  getCode,
  getDate,
  getDescription,
  getHours,
  getProjectName,
  sortTimeEntriesByCallNo,
} from "@/helpers/time-entries";
import { User } from "@/store";
import { ProjectType, TimeEntryType } from "clockify-ts";

const mockUser: User = {
  name: "Mock User",
  userId: "1",
  workspaceId: "1",
  apiKey: "",
  resource: "USR",
  callNo: "usr12345",
  projects: [],
  prefersProjectName: false,
};

describe("getDate", () => {
  it("should convert the timeInterval to en-GB date format", () => {
    const timeInterval: TimeEntryType["timeInterval"] = {
      start: new Date("2024-01-01T00:00:00Z"),
      end: new Date("2024-01-01T08:00:00Z"),
      duration: "PT8H",
    };
    const date = getDate(timeInterval);
    expect(date).toBe("01/01/2024");
  });
});

describe("getHours", () => {
  it("should convert the duration to a float", () => {
    const duration = "PT34M7S";
    const hours = getHours(duration);
    expect(hours).toBeCloseTo(0.57);
  });
});

describe("getCallNo", () => {
  it("should extract the callNo from a billable entry", () => {
    const billableDescription = "abc12345 - Test Description";
    const callNo = getCallNo(billableDescription);
    expect(callNo).toBe("abc12345");
  });
});

describe("getCode", () => {
  it("should extract the code from a callNo", () => {
    const billableDescription = "abc12345 - Test Description";
    const code = getCode(billableDescription);
    expect(code).toBe("abc");
  });
});

describe("getDescription", () => {
  it("should extract the description from a billable entry", () => {
    const billableDescription = "abc12345 - Test Description";
    const description = getDescription(billableDescription);
    expect(description).toBe("Test Description");
  });
});

describe("getProjectName", () => {
  it("should get the correct project name", () => {
    const projects: ProjectType[] = [
      {
        id: "1234",
        name: "Test Project",
      },
    ] as ProjectType[];
    const projectName = getProjectName(projects, "1234");
    expect(projectName).toBe("Test Project");
  });

  it("should return an empty string if no project is found", () => {
    const projects: ProjectType[] = [];
    const projectName = getProjectName(projects, "1234");
    expect(projectName).toBe("");
  });
});

describe("formatTimeEntries", () => {
  it("formats time entries correctly", () => {
    const timeEntries: TimeEntryType[] = [
      {
        billable: true,
        description: "abc12345 - Task 1",
        timeInterval: {
          start: new Date("2024-11-22T00:00:00Z"),
          end: new Date("2024-11-22T08:00:00Z"),
          duration: "PT8H",
        },
      },
      {
        billable: false,
        description: "Task 2",
        timeInterval: {
          start: new Date("2024-11-23T00:00:00Z"),
          end: new Date("2024-11-23T08:00:00Z"),
          duration: "PT8H",
        },
      },
    ] as TimeEntryType[];

    const expectedOutput: FormattedTimeEntry[] = [
      {
        resource: mockUser.resource,
        date: "22/11/2024",
        code: "abc",
        hours: 8,
        callNo: "abc12345",
        description: "Task 1",
      },
      {
        resource: mockUser.resource,
        date: "23/11/2024",
        code: "net",
        hours: 8,
        callNo: mockUser.callNo,
        description: "Task 2",
      },
    ];

    const result = formatTimeEntries(mockUser, timeEntries);

    expect(result).toEqual(expectedOutput);
  });

  it("merges identical entries from the same day", () => {
    const timeEntries: TimeEntryType[] = [
      {
        billable: false,
        description: "Task",
        timeInterval: {
          start: new Date("2024-11-22T00:00:00Z"),
          end: new Date("2024-11-22T08:00:00Z"),
          duration: "PT4H",
        },
      },
      {
        billable: false,
        description: "Task",
        timeInterval: {
          start: new Date("2024-11-22T00:00:00Z"),
          end: new Date("2024-11-22T08:00:00Z"),
          duration: "PT3H",
        },
      },
    ] as TimeEntryType[];

    const expectedOutput: FormattedTimeEntry[] = [
      {
        resource: mockUser.resource,
        date: "22/11/2024",
        code: "net",
        hours: 7,
        callNo: mockUser.callNo,
        description: "Task",
      },
    ];

    const result = formatTimeEntries(mockUser, timeEntries);

    expect(result).toEqual(expectedOutput);
  });

  it("keeps identical entries from different days separate", () => {
    const timeEntries: TimeEntryType[] = [
      {
        billable: false,
        description: "Task",
        timeInterval: {
          start: new Date("2024-11-22T00:00:00Z"),
          end: new Date("2024-11-22T08:00:00Z"),
          duration: "PT4H",
        },
      },
      {
        billable: false,
        description: "Task",
        timeInterval: {
          start: new Date("2024-11-23T00:00:00Z"),
          end: new Date("2024-11-23T08:00:00Z"),
          duration: "PT3H",
        },
      },
    ] as TimeEntryType[];

    const expectedOutput: FormattedTimeEntry[] = [
      {
        resource: mockUser.resource,
        date: "22/11/2024",
        code: "net",
        hours: 4,
        callNo: mockUser.callNo,
        description: "Task",
      },
      {
        resource: mockUser.resource,
        date: "23/11/2024",
        code: "net",
        hours: 3,
        callNo: mockUser.callNo,
        description: "Task",
      },
    ];

    const result = formatTimeEntries(mockUser, timeEntries);

    expect(result).toEqual(expectedOutput);
  });

  it("handles the code, callNo and description for billable entries", () => {
    const timeEntries: TimeEntryType[] = [
      {
        billable: true,
        description: "abc1234 - Billable Task",
        timeInterval: {
          start: new Date("2024-11-22T00:00:00Z"),
          end: new Date("2024-11-22T08:00:00Z"),
          duration: "PT4H",
        },
      },
    ] as TimeEntryType[];

    const expectedOutput: FormattedTimeEntry[] = [
      {
        resource: mockUser.resource,
        date: "22/11/2024",
        code: "abc",
        hours: 4,
        callNo: "abc1234",
        description: "Billable Task",
      },
    ];

    const result = formatTimeEntries(mockUser, timeEntries);

    expect(result).toEqual(expectedOutput);
  });

  it("handles the code, callNo and description for non-billable entries", () => {
    const timeEntries: TimeEntryType[] = [
      {
        billable: false,
        description: "Non-Billable Task",
        timeInterval: {
          start: new Date("2024-11-22T00:00:00Z"),
          end: new Date("2024-11-22T08:00:00Z"),
          duration: "PT8H",
        },
      },
    ] as TimeEntryType[];

    const expectedOutput: FormattedTimeEntry[] = [
      {
        resource: mockUser.resource,
        date: "22/11/2024",
        code: "net",
        hours: 8,
        callNo: mockUser.callNo,
        description: "Non-Billable Task",
      },
    ];

    const result = formatTimeEntries(mockUser, timeEntries);

    expect(result).toEqual(expectedOutput);
  });

  it("adds the project name to the description", () => {
    const projects: ProjectType[] = [
      {
        id: "1",
        name: "Project Name",
      },
    ] as ProjectType[];

    mockUser.projects = projects;
    mockUser.prefersProjectName = true;

    const timeEntries: TimeEntryType[] = [
      {
        billable: false,
        description: "Non-Billable Task",
        projectId: "1",
        timeInterval: {
          start: new Date("2024-11-22T00:00:00Z"),
          end: new Date("2024-11-22T08:00:00Z"),
          duration: "PT8H",
        },
      },
    ] as TimeEntryType[];

    const expectedOutput: FormattedTimeEntry[] = [
      {
        resource: mockUser.resource,
        date: "22/11/2024",
        code: "net",
        hours: 8,
        callNo: mockUser.callNo,
        description: "Project Name - Non-Billable Task",
      },
    ];

    const result = formatTimeEntries(mockUser, timeEntries);

    expect(result).toEqual(expectedOutput);
  });
});

describe("sortEntriesByCallNo", () => {
  it("should sort time entries alphabetically and numerically by callNo", () => {
    const timeEntries: FormattedTimeEntry[] = [
      {
        resource: mockUser.resource,
        date: "22/11/2024",
        code: "net",
        hours: 8,
        callNo: mockUser.callNo,
        description: "Description",
      },
      {
        resource: mockUser.resource,
        date: "22/11/2024",
        code: "abc",
        hours: 8,
        callNo: "abc23456",
        description: "Description",
      },
      {
        resource: mockUser.resource,
        date: "22/11/2024",
        code: "abc",
        hours: 8,
        callNo: "abc12345",
        description: "Description",
      },
      {
        resource: mockUser.resource,
        date: "22/11/2024",
        code: "xyz",
        hours: 8,
        callNo: "xyz12345",
        description: "Description",
      },
      {
        resource: mockUser.resource,
        date: "22/11/2024",
        code: "def",
        hours: 8,
        callNo: "def12345",
        description: "Description",
      },
    ];

    const expectedOutcome: FormattedTimeEntry[] = [
      {
        resource: mockUser.resource,
        date: "22/11/2024",
        code: "abc",
        hours: 8,
        callNo: "abc12345",
        description: "Description",
      },
      {
        resource: mockUser.resource,
        date: "22/11/2024",
        code: "abc",
        hours: 8,
        callNo: "abc23456",
        description: "Description",
      },
      {
        resource: mockUser.resource,
        date: "22/11/2024",
        code: "def",
        hours: 8,
        callNo: "def12345",
        description: "Description",
      },
      {
        resource: mockUser.resource,
        date: "22/11/2024",
        code: "net",
        hours: 8,
        callNo: mockUser.callNo,
        description: "Description",
      },
      {
        resource: mockUser.resource,
        date: "22/11/2024",
        code: "xyz",
        hours: 8,
        callNo: "xyz12345",
        description: "Description",
      },
    ];

    const sortedEntries = sortTimeEntriesByCallNo(timeEntries);

    expect(sortedEntries).toEqual(expectedOutcome);
  });
});
