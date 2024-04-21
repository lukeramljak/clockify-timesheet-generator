import ExcelJS, { Worksheet } from "exceljs";

interface TimeEntry {
  billable: boolean;
  description: string;
  timeInterval: { duration: string; start: string; end: string };
}

const getDate = (timeInterval: { start: string }): string => {
  const startDate = new Date(timeInterval.start);
  return startDate.toLocaleDateString("en-GB");
};

const getHours = (duration: string): number => {
  const minDuration = 0.25;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(\d+)S/);
  if (match) {
    const hours = match[1] ? parseInt(match[1], 10) : 0;
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const seconds = parseInt(match[3], 10);
    const totalHours = hours + minutes / 60 + seconds / 3600;
    if (totalHours <= minDuration) {
      return minDuration;
    } else {
      const roundedHours = Math.round(totalHours * 4) / 4;
      return roundedHours;
    }
  }
  return 0;
};

const getCallNo = (description: string): string => {
  return description.split(" - ")[0];
};

const getCode = (description: string): string => {
  const callNo = getCallNo(description);
  const regex = /[a-zA-Z]+/;
  return callNo.match(regex)![0];
};

const getDescription = (description: string): string => {
  return description.split(" - ")[1];
};

const convertColumnToNumber = (worksheet: Worksheet, value: string) => {
  worksheet.getColumn(value).eachCell({ includeEmpty: true }, (cell) => {
    if (!isNaN(cell.value as number)) {
      cell.numFmt = "0.00";
    }
  });
};

const exportToExcel = async (
  resource: string,
  callNo: string,
  timeEntries: TimeEntry[],
  endDate: string,
): Promise<void> => {
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

    timeEntries.sort((a, b) => {
      const callNoA = a.billable ? getCallNo(a.description) : callNo;
      const callNoB = b.billable ? getCallNo(b.description) : callNo;
      return callNoA.localeCompare(callNoB);
    });

    const totals: {
      [callNoValue: string]: { startRow: number; endRow: number };
    } = {};
    const lastIndexByCallNo: { [callNoValue: string]: number } = {};

    timeEntries.forEach(({ billable, description, timeInterval }, index) => {
      const dateValue = getDate(timeInterval);
      const codeValue = billable ? getCode(description) : "net";
      const hoursValue = getHours(timeInterval.duration);
      const callNoValue = billable ? getCallNo(description) : callNo;
      const descriptionValue = billable
        ? getDescription(description)
        : description;

      if (!totals[callNoValue]) {
        totals[callNoValue] = {
          startRow: index + 2,
          endRow: index + 2,
        };
        lastIndexByCallNo[callNoValue] = index;
      } else {
        totals[callNoValue].endRow = index + 2;
      }

      const row: (string | number)[] = [
        resource,
        dateValue,
        codeValue,
        hoursValue,
        "",
        callNoValue,
        descriptionValue,
      ];

      worksheet.addRow(row);

      lastIndexByCallNo[callNoValue] = index;
    });

    convertColumnToNumber(worksheet, "D");
    convertColumnToNumber(worksheet, "E");

    const lastRowNumber = worksheet.rowCount;
    worksheet.getCell(`D${lastRowNumber + 1}`).value = {
      formula: `SUM(D2:D${lastRowNumber})`,
    };
    worksheet.getCell(`D${lastRowNumber + 1}`).numFmt = "0.00";

    Object.keys(totals).forEach((callNoValue) => {
      const { startRow, endRow } = totals[callNoValue];
      const sumRange = `D${startRow}:D${endRow}`;
      worksheet.getCell(`E${endRow}`).value = { formula: `SUM(${sumRange})` };
    });

    const columnWidths: number[] = [10, 12, 10, 10, 10, 12, 50];
    worksheet.columns.forEach((column, index) => {
      column.width = columnWidths[index];
    });

    const formattedEndDate = new Date(endDate);
    const year = formattedEndDate.getFullYear();
    const month = formattedEndDate.getMonth() + 1;
    const day = formattedEndDate.getDate();
    const fileName = `${resource} Timesheet${year}${month}${day}.xlsx`;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export to Excel:", error);
  }
};

export default exportToExcel;
