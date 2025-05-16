import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ApiKeyInput } from "@/components/api-key-input/api-key-input";
import { useUserStore } from "@/store";

const mockGetUser = vi.fn();

vi.mock("@/store");
vi.mock("clockify-ts", () => ({
  default: vi.fn().mockImplementation(() => ({
    user: {
      get: mockGetUser,
    },
  })),
}));

const mockSetUser = vi.fn();

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

  beforeEach(() => {
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
        resetUser: vi.fn(),
      }),
    );
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
      expect(mockSetUser).toHaveBeenCalledWith({
        name: mockUser.name,
        userId: mockUser.id,
        workspaceId: mockUser.defaultWorkspace,
        apiKey: "valid-api-key",
      });
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
