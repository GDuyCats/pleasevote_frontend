import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function CoinsCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <div className="mb-4 text-5xl">😅</div>
          <h1 className="mb-2 text-xl font-bold text-gray-900">Đã huỷ thanh toán</h1>
          <p className="mb-6 text-sm text-gray-500">Bạn có thể quay lại nạp coin bất cứ lúc nào.</p>

          <Link
            href="/coins"
            className="inline-block rounded-lg bg-purple-600 px-6 py-2 text-sm font-semibold text-white hover:bg-purple-700"
          >
            Quay lại nạp coin
          </Link>
        </div>
      </main>
    </div>
  );
}