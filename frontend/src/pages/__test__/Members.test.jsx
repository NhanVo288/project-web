import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Members from '../Members'; // chỉnh lại nếu cần

describe('Members component - Thêm độc giả', () => {
  test('Mở modal và nhập đầy đủ thông tin độc giả', async () => {
    render(<Members />);

    // Mở modal
    const addButton = screen.getByText('+ Thêm độc giả');
    userEvent.click(addButton);

    // Chờ modal hiển thị
    const modalTitle = await screen.findByText('Thêm độc giả');
    expect(modalTitle).toBeInTheDocument();

    // Tìm và nhập từng trường
    const fullNameInput = screen.getByRole('textbox', { name: /Họ tên/i });
    const memberTypeSelect = screen.getByRole('combobox', { name: /Loại độc giả/i });
    const dateOfBirthInput = screen.getByLabelText(/Ngày sinh/i);
    const addressInput = screen.getByRole('textbox', { name: /Địa chỉ/i });
    const emailInput = screen.getByRole('textbox', { name: /Email/i });
    const phoneInput = screen.getByRole('textbox', { name: /Số điện thoại/i });
    const cardIssueDateInput = screen.getByLabelText(/Ngày cấp thẻ/i);

    // Nhập thông tin hợp lệ
    await userEvent.clear(fullNameInput);
    await userEvent.type(fullNameInput, 'Nguyễn Văn A');

    await userEvent.selectOptions(memberTypeSelect, 'student');

    await userEvent.clear(dateOfBirthInput);
    await userEvent.type(dateOfBirthInput, '1995-05-20');

    await userEvent.clear(addressInput);
    await userEvent.type(addressInput, 'Hà Nội');

    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'nguyenvana@example.com');

    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, '0987654321');

    await userEvent.clear(cardIssueDateInput);
    await userEvent.type(cardIssueDateInput, '2025-05-20');

    // Kiểm tra giá trị đã nhập đúng
    expect(fullNameInput).toHaveValue('Nguyễn Văn A');
    expect(memberTypeSelect).toHaveValue('student');
    expect(dateOfBirthInput).toHaveValue('1995-05-20');
    expect(addressInput).toHaveValue('Hà Nội');
    expect(emailInput).toHaveValue('nguyenvana@example.com');
    expect(phoneInput).toHaveValue('0987654321');
    expect(cardIssueDateInput).toHaveValue('2025-05-20');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Thêm/i }); // hoặc "Tạo", tùy bạn đặt tên nút
    userEvent.click(submitButton);

    // Kiểm tra modal đóng hoặc hiển thị thông báo thành công
    await waitFor(() => {
      expect(screen.queryByText('Thêm độc giả')).not.toBeInTheDocument();
    });
  });
});
