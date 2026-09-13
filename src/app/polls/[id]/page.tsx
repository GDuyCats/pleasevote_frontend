import Navbar from '@/components/Navbar';
import PollDetailContent from '@/components/PollDetailContent';

export default async function PollDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <PollDetailContent pollId={id} />
        </div>
      </main>
    </div>
  );
}