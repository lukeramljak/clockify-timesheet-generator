import { useUserStore } from "@/store";
import ExcelJS, { Worksheet } from "exceljs";

export const EXCEL_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const convertColumnToNumber = (worksheet: Worksheet, value: string) => {
  worksheet.getColumn(value).eachCell({ includeEmpty: true }, (cell) => {
    if (!isNaN(cell.value as number)) {
      cell.numFmt = "0.00";
    }
  });
};

export const generateFileName = (resource: string, date: Date): string => {
  const formattedEndDate = new Date(date);
  const year = String(formattedEndDate.getFullYear()).slice(-2);
  const month = String(formattedEndDate.getMonth() + 1).padStart(2, "0");
  const day = String(formattedEndDate.getDate()).padStart(2, "0");
  const fileName = `${resource} Timesheet${year}${month}${day}.xlsx`;
  return fileName;
};

export const downloadFile = (blob: Blob, fileName: string): void => {
  if (blob.type !== EXCEL_MIME_TYPE) {
    throw new Error("Invalid file type. Expected Excel file.");
  }

  if (blob.size === 0) {
    throw new Error("Invalid Excel buffer");
  }

  if (!fileName.endsWith(".xlsx")) {
    throw new Error("Invalid file extension. Must be .xlsx");
  }

  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;

    try {
      document.body.appendChild(a);
      a.click();
    } finally {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error("Failed to download file:", error);
    throw error;
  }
};

export const exportToExcel = async (
  timeEntries: FormattedTimeEntry[],
  date: Date,
): Promise<void> => {
  const resource = useUserStore.getState().user.resource;

  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    const headers = [
      "Resource",
      "Date",
      "Code",
      "Hours",
      "Totals",
      "CallNo",
      "Description",
    ];
    worksheet.addRow(headers);

    const totals: {
      [callNoValue: string]: { startRow: number; endRow: number };
    } = {};
    const lastIndexByCallNo: { [callNoValue: string]: number } = {};
    const callNoOccurrences: { [callNoValue: string]: number } = {};

    timeEntries.forEach(
      ({ resource, date, code, hours, callNo, description }, index) => {
        if (!totals[callNo]) {
          totals[callNo] = {
            startRow: index + 2,
            endRow: index + 2,
          };
          lastIndexByCallNo[callNo] = index;
        } else {
          totals[callNo].endRow = index + 2;
        }

        const row: (string | number)[] = [
          resource,
          date,
          code,
          hours,
          "",
          callNo,
          description,
        ];

        worksheet.addRow(row);

        lastIndexByCallNo[callNo] = index;
        callNoOccurrences[callNo] = (callNoOccurrences[callNo] || 0) + 1;
      },
    );

    convertColumnToNumber(worksheet, "D");
    convertColumnToNumber(worksheet, "E");

    const lastRowNumber = worksheet.rowCount;
    worksheet.getCell(`D${lastRowNumber + 1}`).value = {
      formula: `SUM(D2:D${lastRowNumber})`,
    };
    worksheet.getCell(`D${lastRowNumber + 1}`).numFmt = "0.00";

    worksheet.getCell(`E${lastRowNumber + 1}`).value = {
      formula: `SUM(E2:E${lastRowNumber})`,
    };
    worksheet.getCell(`E${lastRowNumber + 1}`).numFmt = "0.00";

    Object.keys(totals).forEach((callNo) => {
      const { startRow, endRow } = totals[callNo];
      const sumRange = `D${startRow}:D${endRow}`;
      worksheet.getCell(`E${endRow}`).value = { formula: `SUM(${sumRange})` };

      if (callNoOccurrences[callNo] > 1) {
        for (let i = startRow; i < endRow; i++) {
          worksheet.getCell(`F${i}`).value = "";
        }
      }
    });

    const columnWidths: number[] = [10, 12, 10, 10, 10, 12, 80];
    worksheet.columns.forEach((column, index) => {
      column.width = columnWidths[index];
    });

    const fileName = generateFileName(resource, date);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: EXCEL_MIME_TYPE });

    downloadFile(blob, fileName);
  } catch (error) {
    console.error("Failed to export to Excel:", error);
  }
};
