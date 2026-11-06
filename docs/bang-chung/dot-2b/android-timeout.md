# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bank.spec.js >> complete Sandbox journey without console errors
- Location: e2e/bank.spec.js:3:1

# Error details

```
Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - navigation "Điều hướng chính" [ref=e5]:
      - button "Trang chủ" [ref=e6] [cursor=pointer]:
        - generic [ref=e9]: Trang chủ
      - button "Giao dịch" [ref=e10] [cursor=pointer]:
        - generic [ref=e13]: Giao dịch
      - button "Quét QR" [ref=e14] [cursor=pointer]:
        - generic [ref=e17]: Quét QR
      - button "Lịch sử" [active] [ref=e18] [cursor=pointer]:
        - generic [ref=e21]: Lịch sử
      - button "Cá nhân" [ref=e22] [cursor=pointer]:
        - generic [ref=e25]: Cá nhân
  - generic [ref=e26]:
    - banner [ref=e27]:
      - generic [ref=e31]:
        - text: NhTBank
        - generic [ref=e32]: Phiên bản 1.0.1 · Bản thử cục bộ
      - generic [ref=e33]:
        - button "Thông báo" [ref=e35] [cursor=pointer]
        - button "Ảnh đại diện Nhựt Tường" [ref=e38] [cursor=pointer]:
          - img "Ảnh đại diện Nhựt Tường" [ref=e39]: NT
    - generic [ref=e40]:
      - img [ref=e41]
      - generic [ref=e44]: Ngân hàng mô phỏng · Không giao dịch tiền thật
    - main [ref=e45]:
      - generic [ref=e46]:
        - generic [ref=e48]:
          - generic [ref=e49]: DẤU ẤN MỖI NGÀY
          - heading "Lịch sử giao dịch" [level=1] [ref=e50]
          - paragraph [ref=e51]: Theo dõi từng khoản thu chi, thật rõ ràng.
        - generic [ref=e52]:
          - generic [ref=e53]:
            - generic "Lọc giao dịch" [ref=e54]:
              - button "Tất cả" [pressed] [ref=e55] [cursor=pointer]
              - button "Tiền vào" [ref=e56] [cursor=pointer]
              - button "Tiền ra" [ref=e57] [cursor=pointer]
            - textbox "Tìm giao dịch" [ref=e58]:
              - /placeholder: Tìm tên hoặc nội dung…
          - generic [ref=e59]:
            - generic [ref=e60]:
              - img [ref=e62]
              - generic [ref=e66]:
                - strong [ref=e67]: Lương tháng 10
                - generic [ref=e68]: Lương & thu nhập
              - generic [ref=e69]:
                - strong [ref=e70]: +15.000.000 ₫
                - generic [ref=e71]: 25-10 · Thu
            - generic [ref=e72]:
              - img [ref=e74]
              - generic [ref=e76]:
                - strong [ref=e77]: Highlands Coffee
                - generic [ref=e78]: Ăn uống
              - generic [ref=e79]:
                - strong [ref=e80]: −59.000 ₫
                - generic [ref=e81]: 25-10 · Chi
            - generic [ref=e82]:
              - img [ref=e84]
              - generic [ref=e89]:
                - strong [ref=e90]: Trần Minh Anh
                - generic [ref=e91]: Chuyển tiền
              - generic [ref=e92]:
                - strong [ref=e93]: −250.000 ₫
                - generic [ref=e94]: 24-10 · Chi
            - generic [ref=e95]:
              - img [ref=e97]
              - generic [ref=e100]:
                - strong [ref=e101]: Spotify Premium
                - generic [ref=e102]: Giải trí
              - generic [ref=e103]:
                - strong [ref=e104]: −59.000 ₫
                - generic [ref=e105]: 23-10 · Chi
          - paragraph [ref=e106]: Dữ liệu mẫu và giao dịch của phiên hiện tại. Đăng xuất hoặc tải lại trang sẽ đặt lại dữ liệu.
    - contentinfo [ref=e107]:
      - generic [ref=e108]: © 2026 NhTBank. Chạm đến điều tốt đẹp.
      - generic [ref=e109]:
        - img [ref=e110]
        - generic [ref=e113]: Ứng dụng mô phỏng · Không nhập PIN, OTP hoặc mật khẩu ngân hàng thật
      - navigation "Chọn bố cục" [ref=e114]:
        - link "Điện thoại" [ref=e115] [cursor=pointer]:
          - /url: "?view=android"
        - generic [ref=e116]: /
        - link "Máy tính" [ref=e117] [cursor=pointer]:
          - /url: "?view=windows"
```