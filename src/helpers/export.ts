const getCallNo = (description: string) => {
  return description.split(" - ")[0];
};

const getCode = (description: string) => {
  const callNo = getCallNo(description);
  const regex = /[a-zA-Z]+/;
  return callNo.match(regex)[0];
};

const getDescription = (description: string) => {
  return description.split(" - ")[1];
};

import ExcelJS from "exceljs";

const exportToExcel = async (resource, callNo, timeEntries, endDate) => {
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

    timeEntries.forEach(({ billable, description, timeInterval }, index) => {
      const startDate = new Date(timeInterval.start);
      const formattedStartDate = startDate.toLocaleDateString("en-GB"); // Format date as DD/MM/YYYY
      const durationSeconds =
        Math.round(
          new Date(timeInterval.end).getTime() -
            new Date(timeInterval.start).getTime(),
        ) / 1000;
      const durationHours = durationSeconds / 3600;
      const roundedDuration = Math.round(durationHours * 4) / 4; // Round to the nearest quarter of an hour

      const row = [
        resource,
        formattedStartDate,
        billable ? getCode(description) : "net",
        roundedDuration,
        "",
        billable ? getCallNo(description) : callNo,
        billable ? getDescription(description) : description,
      ];

      worksheet.addRow(row);
    });

    // Set cell type for "Hours" column as number
    const hoursColumn = worksheet.getColumn("D");
    hoursColumn.eachCell({ includeEmpty: true }, (cell) => {
      if (!isNaN(cell.value)) {
        cell.numFmt = "0.00"; // Number format to display two decimal places
      }
    });

    const lastRowNumber = worksheet.rowCount;
    worksheet.getCell(`D${lastRowNumber + 1}`).value = {
      formula: `SUM(D2:D${lastRowNumber})`,
    };
    worksheet.getCell(`D${lastRowNumber + 1}`).numFmt = "0.00";

    // Set filename
    const formattedEndDate = new Date(endDate);
    const year = formattedEndDate.getFullYear();
    const month = formattedEndDate.getMonth() + 1;
    const day = formattedEndDate.getDate();
    const fileName = `${resource} Timesheet${year}${month}${day}.xlsx`;

    // Save workbook to blob
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Create download link and trigger download
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
