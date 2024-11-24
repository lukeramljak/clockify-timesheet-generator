import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ApiKeyInput } from "@/components/api-key-input/api-key-input";
import { useUserStore } from "@/store";

const mockGetUser = vi.fn();

vi.mock("clockify-ts", () => ({
  default: vi.fn().mockImplementation(() => ({
    user: {
      get: mockGetUser,
    },
  })),
}));

const mockSetName = vi.fn();
const mockSetUserId = vi.fn();
const mockSetWorkspaceId = vi.fn();
const mockSetApiKey = vi.fn();

vi.spyOn(useUserStore.getState(), "setName").mockImplementation(mockSetName);
vi.spyOn(useUserStore.getState(), "setUserId").mockImplementation(
  mockSetUserId,
);
vi.spyOn(useUserStore.getState(), "setWorkspaceId").mockImplementation(
  mockSetWorkspaceId,
);
vi.spyOn(useUserStore.getState(), "setApiKey").mockImplementation(
  mockSetApiKey,
);

describe("ApiKeyInput", () => {
  const user = userEvent.setup();
  const initialStoreState = useUserStore.getState();

  beforeEach(() => {
    useUserStore.setState(initialStoreState, true);
  });

  it("renders the form with all necessary elements", () => {
    render(<ApiKeyInput />);

    expect(screen.getByLabelText(/clockify api key/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter api key/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    expect(screen.getByText(/get one at/i)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://app.clockify.me/user/preferences#advanced",
    );
  });

  it("shows validation error when submitting empty form", async () => {
    render(<ApiKeyInput />);

    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(
      await screen.findByText(/field cannot be empty/i),
    ).toBeInTheDocument();
  });

  it("handles successful API key submission", async () => {
    const mockUser = {
      name: "Test User",
      id: "test-id",
      defaultWorkspace: "workspace-id",
    };

    mockGetUser.mockResolvedValueOnce(mockUser);

    render(<ApiKeyInput />);

    const input = screen.getByPlaceholderText(/enter api key/i);
    await user.type(input, "valid-api-key");

    const submitButton = screen.getByRole("button", { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSetName).toHaveBeenCalledWith(mockUser.name);
      expect(mockSetUserId).toHaveBeenCalledWith(mockUser.id);
      expect(mockSetWorkspaceId).toHaveBeenCalledWith(
        mockUser.defaultWorkspace,
      );
      expect(mockSetApiKey).toHaveBeenCalledWith("valid-api-key");
    });
  });

  it("handles invalid API key error correctly", async () => {
    mockGetUser.mockRejectedValue(new Error("Api key does not exist"));

    render(<ApiKeyInput />);

    const input = screen.getByPlaceholderText(/enter api key/i);
    await user.type(input, "invalid-api-key");

    const submitButton = screen.getByRole("button", { name: /submit/i });
    await user.click(submitButton);

    expect(await screen.findByText(/invalid api key/i)).toBeInTheDocument();
  });

  it("maintains external link properties", () => {
    render(<ApiKeyInput />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });
});
