import Link from 'next/link';


export default function CoinsCancelPage() {
  return (
    <div className="bg-background">


      <main className="page-shell max-w-md text-center">
        <div className="rounded-card bg-surface p-8 ring-1 ring-border">
          <div className="mb-4 text-5xl">😅</div>
          <h1 className="mb-2 text-foreground text-page-title">Đã huỷ thanh toán</h1>
          <p className="mb-6 text-sm text-muted">Bạn có thể quay lại nạp coin bất cứ lúc nào.</p>

          <Link
            href="/coins"
            className="inline-block rounded-card bg-primary px-6 py-2 text-on-primary hover:bg-primary-hover text-label-lg min-h-11"
          >
            Quay lại nạp coin
          </Link>
        </div>
      </main>
    </div>
  );
}
