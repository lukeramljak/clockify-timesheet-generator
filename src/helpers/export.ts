import * as XLSX from "xlsx";

const exportToExcel = (resource, callNo, timeEntries, endDate) => {
  try {
    const headers = [
      "Resource",
      "Date",
      "Code",
      "Hours",
      "Totals",
      "CallNo",
      "Description",
    ];
    const rows = timeEntries.map(({ description, timeInterval }) => {
      const startDate = new Date(timeInterval.start);
      const formattedStartDate = startDate.toLocaleDateString("en-GB"); // Format date as DD/MM/YYYY
      const durationSeconds =
        Math.round(
          new Date(timeInterval.end).getTime() -
            new Date(timeInterval.start).getTime(),
        ) / 1000;
      const durationHours = durationSeconds / 3600;
      const roundedDuration = Math.round(durationHours * 4) / 4; // Round to the nearest quarter of an hour
      return [
        resource,
        formattedStartDate,
        "",
        roundedDuration,
        "",
        callNo,
        description,
      ];
    });

    const worksheet = XLSX.utils.json_to_sheet([headers, ...rows]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, {
      type: "array",
      bookType: "xlsx",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const formattedEndDate = new Date(endDate);
    const year = formattedEndDate.getFullYear();
    const month = formattedEndDate.getMonth() + 1;
    const day = formattedEndDate.getDate();
    const fileName = `${resource} Timesheet${year}${month}${day}`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export to Excel:", error);
  }
};

export default exportToExcel;
