import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Login from "./Login";
import Transfer from "./Transfer";
import Deposit from "./Deposit";
vi.mock("canvas-confetti", () => ({ default: vi.fn() }));
function fillTransfer() {
  fireEvent.change(screen.getByLabelText("Ngân hàng nhận"), {
    target: { value: "MB Bank" },
  });
  fireEvent.change(screen.getByLabelText("Số tài khoản"), {
    target: { value: "123456789" },
  });
  fireEvent.change(screen.getByLabelText("Tên người nhận"), {
    target: { value: "Trần Minh Anh" },
  });
  fireEvent.change(screen.getByLabelText("Số tiền (VNĐ)"), {
    target: { value: "100000" },
  });
  fireEvent.click(screen.getByText("Tiếp tục"));
}
describe("User flows", () => {
  it("rejects wrong login PIN and accepts correct keyboard PIN", async () => {
    const login = vi.fn();
    render(<Login onLogin={login} />);
    for (const key of "000000") fireEvent.keyDown(window, { key });
    expect(screen.getByRole("alert")).toHaveTextContent("PIN chưa đúng");
    expect(login).not.toHaveBeenCalled();
    for (const key of "123456") fireEvent.keyDown(window, { key });
    expect(screen.getByText("Đang mở thế giới của bạn")).toBeInTheDocument();
    await waitFor(() => expect(login).toHaveBeenCalledTimes(1), {
      timeout: 2000,
    });
  });
  it("validates and commits a transfer only once after correct confirmation PIN", () => {
    const transfer = vi.fn(() => ({ id: "NHT-TEST" }));
    render(
      <Transfer balance={7829890} onTransfer={transfer} navigate={vi.fn()} />,
    );
    fireEvent.click(screen.getByText("Tiếp tục"));
    expect(screen.getByRole("alert")).toHaveTextContent("ngân hàng");
    fillTransfer();
    expect(
      screen.getByText("Kiểm tra một lần, an tâm hơn."),
    ).toBeInTheDocument();
    expect(transfer).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Xác nhận thông tin"));
    fireEvent.change(screen.getByLabelText("Mã PIN xác nhận"), {
      target: { value: "000000" },
    });
    fireEvent.click(screen.getByText("Chuyển tiền mô phỏng"));
    expect(screen.getByRole("alert")).toHaveTextContent("chưa đúng");
    expect(transfer).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Mã PIN xác nhận"), {
      target: { value: "123456" },
    });
    const button = screen.getByText("Chuyển tiền mô phỏng");
    fireEvent.click(button);
    fireEvent.click(button);
    expect(transfer).toHaveBeenCalledTimes(1);
    expect(transfer.mock.calls[0][0].amount).toBe("100000");
    expect(screen.getByRole("status")).toHaveTextContent("NHT-TEST");
  });
  it("creates dynamic demo QR and handles an image failure", () => {
    render(<Deposit navigate={vi.fn()} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Số tiền (VNĐ)"), {
      target: { value: "-50" },
    });
    fireEvent.click(screen.getByText("Tạo mã QR mẫu"));
    expect(screen.getByRole("alert")).toHaveTextContent("1.000");
    fireEvent.change(screen.getByLabelText("Số tiền (VNĐ)"), {
      target: { value: "250000" },
    });
    fireEvent.click(screen.getByText("Tạo mã QR mẫu"));
    const image = screen.getByRole("img");
    expect(new URL(image.src).searchParams.get("amount")).toBe("250000");
    fireEvent.error(image);
    expect(screen.getByText("Chưa tải được VietQR.")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Tải lại mã"));
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
});
