import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ProjectList } from '@/features/projects/ProjectList';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return <ProjectList userId={userId} />;
}
