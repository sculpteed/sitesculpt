import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-warm">
      <SignUp
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
