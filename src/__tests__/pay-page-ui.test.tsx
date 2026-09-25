import { render, screen, waitFor } from '@testing-library/react';
import PayPage from '@/app/pay/[paymentId]/page';
import { paymentsApi } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  paymentsApi: {
    getByReference: jest.fn(),
  },
}));

jest.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }: { value: string }) => (
    <div data-testid="qr-code" data-value={value} />
  ),
}));

const mockedGetByReference = paymentsApi.getByReference as jest.Mock;

const basePayment = {
  id: 'pay_1',
  reference: 'ref_1',
  status: 'pending',
  amountUsd: 25,
  amountXlm: 100,
  description: 'Test payment',
  stellarDepositAddress: 'GDESTINATIONADDRESS123',
  stellarMemo: 'memo-123',
  createdAt: new Date().toISOString(),
  expiryMinutes: 30,
};

describe('PayPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the payment amount', async () => {
    mockedGetByReference.mockResolvedValue({ data: basePayment });
    render(<PayPage params={{ paymentId: 'ref_1' }} />);
    await waitFor(() => expect(screen.getByText('$25.00')).toBeInTheDocument());
  });

  it('builds the expected web+stellar URI for the QR code', async () => {
    mockedGetByReference.mockResolvedValue({ data: basePayment });
    render(<PayPage params={{ paymentId: 'ref_1' }} />);

    const qr = await screen.findByTestId('qr-code');
    expect(qr).toHaveAttribute(
      'data-value',
      'web+stellar:pay?destination=GDESTINATIONADDRESS123&amount=100&memo=memo-123&memo_type=text'
    );
  });

  it('encodeURIComponent-escapes special characters in the memo', async () => {
    mockedGetByReference.mockResolvedValue({
      data: { ...basePayment, stellarMemo: 'memo with spaces & symbols/+=?' },
    });
    render(<PayPage params={{ paymentId: 'ref_1' }} />);

    const qr = await screen.findByTestId('qr-code');
    expect(qr).toHaveAttribute(
      'data-value',
      'web+stellar:pay?destination=GDESTINATIONADDRESS123&amount=100&memo=memo%20with%20spaces%20%26%20symbols%2F%2B%3D%3F&memo_type=text'
    );
  });

  it('falls back to amountUsd when amountXlm is missing', async () => {
    mockedGetByReference.mockResolvedValue({
      data: { ...basePayment, amountXlm: undefined },
    });
    render(<PayPage params={{ paymentId: 'ref_1' }} />);

    const qr = await screen.findByTestId('qr-code');
    expect(qr).toHaveAttribute(
      'data-value',
      'web+stellar:pay?destination=GDESTINATIONADDRESS123&amount=25&memo=memo-123&memo_type=text'
    );
  });
});
