import ExcelJS, { Worksheet } from "exceljs";
import formatEntries from "./format-time-entries";

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
  date: Date,
  includeProject: boolean,
): Promise<void> => {
  try {
    const formattedEntries = formatEntries(
      resource,
      callNo,
      timeEntries,
      includeProject,
    );

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

    formattedEntries.sort((a, b) => {
      if (a.callNo < b.callNo) return -1;
      if (a.callNo > b.callNo) return 1;
      return 0;
    });

    const totals: {
      [callNoValue: string]: { startRow: number; endRow: number };
    } = {};
    const lastIndexByCallNo: { [callNoValue: string]: number } = {};
    const callNoOccurrences: { [callNoValue: string]: number } = {};

    formattedEntries.forEach(
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

    const columnWidths: number[] = [10, 12, 10, 10, 10, 12, 50];
    worksheet.columns.forEach((column, index) => {
      column.width = columnWidths[index];
    });

    const formattedEndDate = new Date(date);
    const year = String(formattedEndDate.getFullYear()).slice(-2);
    const month = String(formattedEndDate.getMonth() + 1).padStart(2, "0");
    const day = String(formattedEndDate.getDate()).padStart(2, "0");
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
