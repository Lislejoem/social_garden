import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen grove-bg flex items-center justify-center p-4">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            card: 'glass-container shadow-xl border-white/50',
            headerTitle: 'font-serif text-ink-rich text-2xl',
            headerSubtitle: 'text-ink-muted',
            formButtonPrimary: 'bg-grove-primary hover:bg-grove-primary-hover',
            footerActionLink: 'text-grove-primary hover:text-grove-primary-hover',
            footer: 'bg-transparent',
            footerAction: 'bg-transparent',
          },
        }}
      />
    </div>
  )
}
