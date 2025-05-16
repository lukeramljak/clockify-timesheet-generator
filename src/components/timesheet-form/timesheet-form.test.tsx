import { TimesheetForm } from "@/components/timesheet-form/timesheet-form";
import { exportToExcel } from "@/helpers/export";
import { useUserStore } from "@/store";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { ProjectType, TimeEntryType } from "clockify-ts";
import { isFriday } from "date-fns";
import { toast } from "sonner";
import { describe, expect, it, vi, beforeEach } from "vitest";

const mockSetUser = vi.fn();
const mockResetUser = vi.fn();

vi.mock("@/helpers/export");
vi.mock("@/helpers/time-entries");
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));
vi.mock("@/store");

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

const renderComponent = () => {
  render(<TimesheetForm />);

  return {
    resourceInput: screen.getByLabelText(/resource/i),
    callNoInput: screen.getByLabelText(/call no/i),
    includeProjectNameCheckbox: screen.getByLabelText(/include project name/i),
    exportButton: screen.getByRole("button", { name: /export/i }),
    clearApiKeyButton: screen.getByRole("button", { name: /clear api key/i }),
  };
};

const openCalendarAndSelectFriday = async (user: UserEvent) => {
  const pickerButton = screen.getByText(/pick a date/i);
  await user.click(pickerButton);

  await waitFor(() => {
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  const dateCells = screen.getAllByRole("gridcell");

  for (const cell of dateCells) {
    const text = cell.textContent?.trim();
    const disabled = cell.getAttribute("aria-disabled") === "true";

    if (!text || disabled) continue;

    const day = parseInt(text);
    if (isNaN(day)) continue;

    const today = new Date();
    const testDate = new Date(today.getFullYear(), today.getMonth(), day);

    if (isFriday(testDate)) {
      await user.click(cell);
      return;
    }
  }

  throw new Error("No valid Friday cell found.");
};

describe("TimesheetForm", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useUserStore).mockImplementation((selector) =>
      selector({
        user: {
          name: "",
          userId: "test-user",
          resource: "",
          callNo: "",
          workspaceId: "test-workspace",
          apiKey: "test-api-key",
          projects: [],
          prefersProjectName: false,
        },
        setUser: mockSetUser,
        resetUser: mockResetUser,
      }),
    );
  });

  it("renders all necessary form elements", () => {
    const {
      resourceInput,
      callNoInput,
      includeProjectNameCheckbox,
      exportButton,
      clearApiKeyButton,
    } = renderComponent();

    expect(resourceInput).toBeInTheDocument();
    expect(callNoInput).toBeInTheDocument();
    expect(screen.getByText(/pick a date/i)).toBeInTheDocument();
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
    const { resourceInput, callNoInput, exportButton } = renderComponent();

    const mockProjects: ProjectType[] = [
      { id: "proj1", name: "Project 1" },
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
    await openCalendarAndSelectFriday(user);
    await user.click(exportButton);

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith(
        expect.objectContaining({
          resource: "ABC",
          callNo: "net45678",
          projects: mockProjects,
          prefersProjectName: false,
        }),
      );
      expect(exportToExcel).toHaveBeenCalled();
    });
  });

  it("displays an error for invalid input during submission", async () => {
    const { resourceInput, callNoInput, exportButton } = renderComponent();

    mockGetTimeEntries.mockRejectedValue(new Error("Invalid API Key"));

    await user.type(resourceInput, "XYZ");
    await user.type(callNoInput, "net56789");
    await openCalendarAndSelectFriday(user);
    await user.click(exportButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid API Key");
    });
  });

  it("displays an error if the timer is still running", async () => {
    const { resourceInput, callNoInput, exportButton } = renderComponent();

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
    await openCalendarAndSelectFriday(user);
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
      expect(mockResetUser).toHaveBeenCalled();
    });
  });
});
