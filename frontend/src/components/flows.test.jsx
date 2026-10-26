import App from "../App";
import { INITIAL_BALANCE, money } from "../lib/bank";
import { decodeQr } from "../test/decodeQr";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Login from "./Login";
import Transfer from "./Transfer";
import Deposit from "./Deposit";
vi.mock("canvas-confetti", () => ({ default: vi.fn() }));
// Session-state checks do not depend on animation-frame scheduling in jsdom.
vi.mock("./ui", async (importOriginal) => ({
  ...(await importOriginal()),
  Page: ({ children }) => <div>{children}</div>,
}));
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
  it("clears transactions, balance and search on logout without a reload", async () => {
    render(<App />);
    async function unlock() {
      for (const key of "123456") fireEvent.keyDown(window, { key });
      await screen.findByRole(
        "heading",
        { name: /Xin chào/ },
        { timeout: 3000 },
      );
    }
    await unlock();
    fireEvent.click(
      screen.getAllByRole("button", { name: "Chuyển tiền", exact: true })[0],
    );
    await screen.findByLabelText("Ngân hàng nhận");
    fillTransfer();
    fireEvent.click(screen.getByText("Xác nhận thông tin"));
    fireEvent.change(screen.getByLabelText("Mã PIN xác nhận"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByText("Chuyển tiền mô phỏng"));
    fireEvent.click(screen.getByText("Xem lịch sử giao dịch"));
    const search = await screen.findByLabelText("Tìm giao dịch");
    fireEvent.change(search, { target: { value: "Trần Minh Anh" } });
    expect(screen.getAllByText("Trần Minh Anh", { exact: true })).toHaveLength(
      2,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Đăng xuất", exact: true }),
    );
    await unlock();
    expect(
      screen.getByLabelText(`${money(INITIAL_BALANCE)} VNĐ`, { exact: true }),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Lịch sử giao dịch", exact: true }),
    );
    await screen.findByLabelText("Tìm giao dịch");
    expect(screen.getByLabelText("Tìm giao dịch")).toHaveValue("");
    expect(screen.getAllByText("Trần Minh Anh", { exact: true })).toHaveLength(
      1,
    );
  }, 10000);
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
      <Transfer
        balance={INITIAL_BALANCE}
        onTransfer={transfer}
        navigate={vi.fn()}
      />,
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
  it("automatically creates dynamic demo QR and handles an image failure", async () => {
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
    const image = await screen.findByRole("img");
    expect(decodeQr(image.src)).toBe(
      'NHTBANK_SANDBOX:{"amount":250000,"note":"NAP TIEN DEMO"}',
    );
    fireEvent.error(image);
    expect(
      screen.getByText("Chưa hiển thị được QR mô phỏng."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("Tải lại mã"));
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
  it("hides stale QR during rapid edits and uses only the latest amount and note", async () => {
    render(<Deposit navigate={vi.fn()} />);
    await screen.findByRole("img");
    const amount = screen.getByLabelText("Số tiền (VNĐ)");
    fireEvent.change(amount, { target: { value: "200000" } });
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    fireEvent.change(amount, { target: { value: "350000" } });
    fireEvent.change(screen.getByLabelText("Nội dung"), {
      target: { value: "TIET KIEM DEMO" },
    });
    const image = await screen.findByRole("img");
    expect(decodeQr(image.src)).toBe(
      'NHTBANK_SANDBOX:{"amount":350000,"note":"TIET KIEM DEMO"}',
    );
    expect(screen.getByText("TIET KIEM DEMO")).toBeInTheDocument();
  });
  it("does not leave a previous QR available for invalid amounts", async () => {
    render(<Deposit navigate={vi.fn()} />);
    await screen.findByRole("img");
    fireEvent.change(screen.getByLabelText("Số tiền (VNĐ)"), {
      target: { value: "1e4" },
    });
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByText("Sao chép nội dung mẫu")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Nhập số tiền để xem mã QR" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("Tạo mã QR mẫu"));
    expect(screen.getByRole("alert")).toHaveTextContent("1.000");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
