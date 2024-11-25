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

const renderComponent = () => {
  render(<ApiKeyInput />);

  return {
    apiKeyInput: screen.getByLabelText(/clockify api key/i),
    clockifyLink: screen.getByRole("link"),
    submitButton: screen.getByRole("button", { name: /submit/i }),
  };
};

describe("ApiKeyInput", () => {
  const user = userEvent.setup();
  const initialStoreState = useUserStore.getState();

  beforeEach(() => {
    useUserStore.setState(initialStoreState, true);
  });

  it("renders the form with all necessary elements", () => {
    const { apiKeyInput, clockifyLink, submitButton } = renderComponent();

    expect(apiKeyInput).toBeInTheDocument();
    expect(clockifyLink).toHaveAttribute(
      "href",
      "https://app.clockify.me/user/preferences#advanced",
    );
    expect(submitButton).toBeInTheDocument();
  });

  it("shows validation error when submitting empty form", async () => {
    const { submitButton } = renderComponent();

    await user.click(submitButton);

    expect(
      await screen.findByText(/field cannot be empty/i),
    ).toBeInTheDocument();
  });

  it("handles successful API key submission", async () => {
    const { apiKeyInput, submitButton } = renderComponent();

    const mockUser = {
      name: "Test User",
      id: "test-id",
      defaultWorkspace: "workspace-id",
    };

    mockGetUser.mockResolvedValueOnce(mockUser);

    await user.type(apiKeyInput, "valid-api-key");
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
    const { apiKeyInput, submitButton } = renderComponent();

    mockGetUser.mockRejectedValue(new Error("Api key does not exist"));

    await user.type(apiKeyInput, "invalid-api-key");
    await user.click(submitButton);

    expect(await screen.findByText(/invalid api key/i)).toBeInTheDocument();
  });

  it("maintains external link properties", () => {
    const { clockifyLink } = renderComponent();

    expect(clockifyLink).toHaveAttribute("target", "_blank");
    expect(clockifyLink).toHaveAttribute("rel", "noreferrer");
  });
});
