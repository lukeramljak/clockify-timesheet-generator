import ExcelJS from "exceljs";

interface TimeEntry {
  billable: boolean;
  description: string;
  timeInterval: { start: string; end: string };
}

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
      const callNoValue = billable ? getCallNo(description) : callNo;

      const startDate = new Date(timeInterval.start);
      const formattedStartDate = startDate.toLocaleDateString("en-GB"); // Format date as DD/MM/YYYY
      const durationSeconds =
        Math.round(
          new Date(timeInterval.end).getTime() -
            new Date(timeInterval.start).getTime(),
        ) / 1000;
      const durationHours = durationSeconds / 3600;
      const roundedDuration = Math.round(durationHours * 4) / 4; // Round to the nearest quarter of an hour

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
        formattedStartDate,
        billable ? getCode(description) : "net",
        roundedDuration,
        "",
        billable ? getCallNo(description) : callNo,
        billable ? getDescription(description) : description,
      ];

      worksheet.addRow(row);

      lastIndexByCallNo[callNoValue] = index;
    });

    const hoursColumn = worksheet.getColumn("D");
    hoursColumn.eachCell({ includeEmpty: true }, (cell) => {
      if (!isNaN(cell.value as number)) {
        cell.numFmt = "0.00";
      }
    });

    const totalsColumn = worksheet.getColumn("E");
    totalsColumn.eachCell({ includeEmpty: true }, (cell) => {
      if (!isNaN(cell.value as number)) {
        cell.numFmt = "0.00";
      }
    });

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
