import { describe, it, expect, vi } from "vitest";
import {
  exportToExcel,
  generateFileName,
  downloadFile,
  EXCEL_MIME_TYPE,
} from "@/helpers/export";

const mockUser = {
  resource: "USR",
  callNo: "usr12345",
};

vi.mock("exceljs", () => {
  const mockWorksheet = {
    addRow: vi.fn(),
    getColumn: vi.fn(() => ({
      eachCell: vi.fn(),
    })),
    getCell: vi.fn(() => ({ value: null })),
    columns: [],
  };

  const mockWorkbook = {
    addWorksheet: vi.fn(() => mockWorksheet),
    xlsx: {
      writeBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    },
  };

  return {
    default: {
      Workbook: vi.fn(() => mockWorkbook),
    },
  };
});

vi.mock("@/store", () => ({
  useUserStore: {
    getState: vi.fn(() => ({
      resource: mockUser.resource,
    })),
  },
}));

global.URL.createObjectURL = vi.fn(() => "mock-url");

const mockElement = {
  href: "",
  download: "",
} as unknown as HTMLAnchorElement;

vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
  if (tagName === "a") {
    return mockElement;
  }
  return document.createElement(tagName);
});

describe("generateFileName", () => {
  const mockDate = new Date("2024-11-24");

  const mockTimeEntries = [
    {
      resource: mockUser.resource,
      date: "24/11/2024",
      code: "net",
      hours: 8,
      callNo: mockUser.callNo,
      description: "Test description 1",
    },
    {
      resource: mockUser.resource,
      date: "24/11/2024",
      code: "CODE2",
      hours: 4,
      callNo: mockUser.callNo,
      description: "Test description 2",
    },
    {
      resource: mockUser.resource,
      date: "24/11/2024",
      code: "net",
      hours: 6,
      callNo: mockUser.callNo,
      description: "Test description 3",
    },
  ];

  const expectedOutput = "USR Timesheet241124.xlsx";

  it("should format the file name correctly", () => {
    const fileName = generateFileName(mockUser.resource, mockDate);
    expect(fileName).toBe(expectedOutput);
  });

  it("should set the file name of the downloaded file correctly", async () => {
    await exportToExcel(mockTimeEntries, mockDate);
    expect(mockElement.download).toBe(expectedOutput);
  });
});

describe("downloadFile", () => {
  it("should reject blobs with incorrect MIME type", () => {
    const invalidBlob = new Blob(["test"], { type: "text/plain" });

    expect(() => {
      downloadFile(invalidBlob, "test.xlsx");
    }).toThrow(/Invalid file type/i);
  });

  it("should handle empty or invalid buffer", () => {
    expect(() => {
      const emptyBlob = new Blob([], { type: EXCEL_MIME_TYPE });
      downloadFile(emptyBlob, "empty.xlsx");
    }).toThrow(/Invalid Excel buffer/i);
  });

  it("should validate filename extension", () => {
    const validBlob = new Blob([new ArrayBuffer(8)], { type: EXCEL_MIME_TYPE });

    expect(() => {
      downloadFile(validBlob, "test.txt");
    }).toThrow(/Must be .xlsx/i);
  });
});
