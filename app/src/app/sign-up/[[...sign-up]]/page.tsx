import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen grove-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-ink-rich">
            Grove
          </h1>
          <p className="text-ink-muted mt-2">
            Start cultivating your connections
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'glass-container shadow-xl border-white/50',
              headerTitle: 'font-serif text-ink-rich',
              headerSubtitle: 'text-ink-muted',
              formButtonPrimary: 'bg-grove-primary hover:bg-grove-primary-hover',
              footerActionLink: 'text-grove-primary hover:text-grove-primary-hover',
            },
          }}
        />
      </div>
    </div>
  )
}
