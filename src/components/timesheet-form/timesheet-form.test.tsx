import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { TimesheetForm } from "@/components/timesheet-form/timesheet-form";
import { useUserStore } from "@/store";
import { toast } from "sonner";
import { exportToExcel } from "@/helpers/export";
import { ProjectType, TimeEntryType } from "clockify-ts";

vi.mock("@/helpers/export");
vi.mock("@/helpers/time-entries");
vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const mockGetTimeEntries = vi.fn();
const mockGetProjects = vi.fn();

vi.mock("clockify-ts", () => ({
  default: vi.fn().mockImplementation(() => ({
    workspace: {
      withId: vi.fn().mockImplementation(() => ({
        users: {
          withId: vi.fn().mockImplementation(() => ({
            timeEntries: {
              get: mockGetTimeEntries,
            },
          })),
        },
        projects: {
          get: mockGetProjects,
        },
      })),
    },
  })),
}));

const mockSetResource = vi.fn();
const mockSetCallNo = vi.fn();
const mockSetProjects = vi.fn();
const mockSetPrefersProjectName = vi.fn();
const mockReset = vi.fn();

vi.spyOn(useUserStore.getState(), "setResource").mockImplementation(
  mockSetResource,
);
vi.spyOn(useUserStore.getState(), "setCallNo").mockImplementation(
  mockSetCallNo,
);
vi.spyOn(useUserStore.getState(), "setProjects").mockImplementation(
  mockSetProjects,
);
vi.spyOn(useUserStore.getState(), "setPrefersProjectName").mockImplementation(
  mockSetPrefersProjectName,
);
vi.spyOn(useUserStore.getState(), "reset").mockImplementation(mockReset);

const renderComponent = () => {
  render(<TimesheetForm />);

  return {
    resourceInput: screen.getByLabelText(/resource/i),
    callNoInput: screen.getByLabelText(/call no/i),
    weekEndingPicker: screen.getByLabelText(/week ending/i),
    includeProjectNameCheckbox: screen.getByLabelText(/include project name/i),
    exportButton: screen.getByRole("button", { name: /export/i }),
    clearApiKeyButton: screen.getByRole("button", { name: /clear api key/i }),
  };
};

const getDateCell = () => {
  const dateCells = screen.queryAllByRole("gridcell");
  const enabledDateCell = dateCells.find(
    (cell) => !cell.hasAttribute("disabled"),
  );
  if (enabledDateCell) {
    return enabledDateCell;
  } else {
    throw new Error("No enabled gridcell found");
  }
};

describe("TimesheetForm", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    useUserStore.setState({
      userId: "test-user",
      workspaceId: "test-workspace",
      apiKey: "test-api-key",
      resource: "",
      callNo: "",
      prefersProjectName: false,
    });
  });

  it("renders all necessary form elements", () => {
    const {
      resourceInput,
      callNoInput,
      weekEndingPicker,
      includeProjectNameCheckbox,
      exportButton,
      clearApiKeyButton,
    } = renderComponent();

    expect(resourceInput).toBeInTheDocument();
    expect(callNoInput).toBeInTheDocument();
    expect(weekEndingPicker).toBeInTheDocument();
    expect(includeProjectNameCheckbox).toBeInTheDocument();
    expect(exportButton).toBeInTheDocument();
    expect(clearApiKeyButton).toBeInTheDocument();
  });

  it("shows validation errors for empty input", async () => {
    const { exportButton } = renderComponent();

    await user.click(exportButton);

    await waitFor(() => {
      expect(screen.getAllByText(/must be/i)).toHaveLength(2);
    });
  });

  it("shows a validation error for incorrect callNo input", async () => {
    const { callNoInput, exportButton } = renderComponent();

    await user.clear(callNoInput);
    await user.type(callNoInput, "abc12345");

    await user.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid format/i)).toBeInTheDocument();
    });
  });

  it("handles successful submission", async () => {
    const { resourceInput, callNoInput, weekEndingPicker, exportButton } =
      renderComponent();

    const mockProjects: ProjectType[] = [
      {
        id: "proj1",
        name: "Project 1",
      },
    ] as ProjectType[];
    const mockTimeEntries: TimeEntryType[] = [
      {
        billable: false,
        description: "Entry 1",
        timeInterval: {
          duration: "PT8H",
          end: new Date(),
          start: new Date(),
        },
      },
    ] as TimeEntryType[];

    mockGetProjects.mockResolvedValue(mockProjects);
    mockGetTimeEntries.mockResolvedValue(mockTimeEntries);

    await user.type(resourceInput, "ABC");
    await user.type(callNoInput, "net45678");
    await user.click(weekEndingPicker);

    const dateCell = getDateCell();
    await user.click(dateCell);

    await user.click(exportButton);

    await waitFor(() => {
      expect(mockSetProjects).toHaveBeenCalledWith(mockProjects);
      expect(exportToExcel).toHaveBeenCalled();
    });
  });

  it("displays an error for invalid input during submission", async () => {
    const { resourceInput, callNoInput, weekEndingPicker, exportButton } =
      renderComponent();

    mockGetTimeEntries.mockRejectedValue(new Error("Invalid API Key"));

    await user.type(resourceInput, "XYZ");
    await user.type(callNoInput, "net56789");
    await user.click(weekEndingPicker);

    const dateCell = getDateCell();
    await user.click(dateCell);

    await user.click(exportButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid API Key");
    });
  });

  it("displays an error if the timer is still running", async () => {
    const { resourceInput, callNoInput, weekEndingPicker, exportButton } =
      renderComponent();

    const mockTimeEntries: TimeEntryType[] = [
      {
        billable: false,
        description: "Entry 1",
        timeInterval: {
          duration: "",
          end: new Date(),
          start: new Date(),
        },
      },
    ] as TimeEntryType[];

    mockGetTimeEntries.mockResolvedValue(mockTimeEntries);

    await user.type(resourceInput, "ABC");
    await user.type(callNoInput, "net45678");
    await user.click(weekEndingPicker);

    const dateCell = getDateCell();
    await user.click(dateCell);

    await user.click(exportButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringMatching(/active timer/i),
      );
    });
  });

  it("clears the API key when Clear API Key is clicked", async () => {
    const { clearApiKeyButton } = renderComponent();

    await user.click(clearApiKeyButton);

    await waitFor(() => {
      expect(mockReset).toHaveBeenCalled();
    });
  });
});
