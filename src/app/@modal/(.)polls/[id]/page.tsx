import Modal from '@/components/Modal';
import PollDetailContent from '@/components/PollDetailContent';

export default async function PollModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Modal>
      <PollDetailContent pollId={id} />
    </Modal>
  );
}