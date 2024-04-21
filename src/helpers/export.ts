import getProject from "@/services/get-project";
import * as XLSX from "xlsx";

const exportToExcel = async (data) => {
  const worksheet = XLSX.utils.json_to_sheet([
    ["Resource", "Date", "Code", "Hours", "Totals", "CallNo", "Description"],
    ...(await Promise.all(
      data.map(async ({ description, timeInterval, projectId }) => {
        if (!description.trim()) {
          const project = await getProject(projectId);
          description = project?.name || `Project ID: ${projectId}`;
        }

        const startDate = new Date(timeInterval.start);
        const formattedStartDate = startDate.toLocaleDateString("en-GB"); // Format date as DD/MM/YYYY
        const durationSeconds = Math.round(
          new Date(timeInterval.duration).getTime() / 1000,
        );
        const durationHours = durationSeconds / 3600;
        const roundedDuration = Math.round(durationHours * 4) / 4; // Round to the nearest quarter of an hour
        return [
          "LRA",
          formattedStartDate,
          "",
          roundedDuration,
          "",
          "",
          description,
        ];
      }),
    )),
  ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const excelBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "output.xlsx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default exportToExcel;
