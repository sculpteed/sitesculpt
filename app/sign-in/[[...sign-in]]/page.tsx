import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-warm">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-[var(--color-bg-elevated)] border border-[var(--color-border)]',
          },
        }}
      />
    </div>
  );
}
