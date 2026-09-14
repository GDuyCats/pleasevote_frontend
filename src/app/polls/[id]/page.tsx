
import PollDetailContent from '@/components/PollDetailContent';

export default async function PollDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="bg-background">

      <main className="page-shell max-w-2xl">
        <div className="overflow-hidden rounded-card bg-surface ring-1 ring-border">
          <PollDetailContent pollId={id} />
        </div>
      </main>
    </div>
  );
}
