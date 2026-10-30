import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import AuthGate from "./AuthGate";

afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

it("opens login and registration when browser storage is blocked", async () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new DOMException("Storage blocked", "SecurityError");
  });
  render(<AuthGate onLogin={vi.fn()} />);
  expect(await screen.findByRole("heading", { name: "Đăng nhập NhTBank" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Đăng ký tài khoản", exact: true }));
  expect(screen.getByRole("heading", { name: "Đăng ký tài khoản", exact: true })).toBeInTheDocument();
});
