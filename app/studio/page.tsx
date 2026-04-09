import { Suspense } from 'react';
import { Studio } from '@/features/studio/Studio';

export default function StudioPage() {
  return (
    <Suspense>
      <Studio />
    </Suspense>
  );
}
