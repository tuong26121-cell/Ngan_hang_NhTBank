import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import VietQrStudio from "./VietQrStudio";

describe("VietQR Studio explicit external-service boundary", () => {
  it("does not load an external QR before user consent and action", () => {
    render(<VietQrStudio />);
    expect(screen.queryByRole("img", { name: /Ảnh VietQR/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Không phát sinh yêu cầu/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Số tài khoản nhận"), {
      target: { value: "0788818374" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Tạo ảnh VietQR/ }));
    expect(screen.getByRole("alert")).toHaveTextContent("đồng ý");
    expect(screen.queryByRole("img", { name: /Ảnh VietQR/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Tôi hiểu rằng khi nhấn tạo/));
    fireEvent.click(screen.getByRole("button", { name: /Tạo ảnh VietQR/ }));
    const image = screen.getByRole("img", { name: /Ảnh VietQR/ });
    const url = new URL(image.getAttribute("src"));
    expect(url.searchParams.get("acc")).toBe("0788818374");
    expect(url.searchParams.get("bank")).toBe("MB");
    expect(url.searchParams.has("amount")).toBe(false);
  });
  it("hides stale payment image on edit and never changes sandbox balance", () => {
    render(<VietQrStudio />);
    fireEvent.change(screen.getByLabelText("Số tài khoản nhận"), {
      target: { value: "0788818374" },
    });
    fireEvent.click(screen.getByLabelText(/Tôi hiểu rằng khi nhấn tạo/));
    fireEvent.click(screen.getByRole("button", { name: /Tạo ảnh VietQR/ }));
    expect(screen.getByRole("img", { name: /Ảnh VietQR/ })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Số tiền (VNĐ, có thể để trống)"), {
      target: { value: "500000" },
    });
    expect(screen.queryByRole("img", { name: /Ảnh VietQR/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Tạo ảnh VietQR/ }));
    expect(new URL(screen.getByRole("img", { name: /Ảnh VietQR/ }).getAttribute("src")).searchParams.get("amount")).toBe("500000");
    expect(screen.getByText(/không cập/)).toBeInTheDocument();
  });
});
