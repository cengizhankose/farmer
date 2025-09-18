import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stacks Yield Aggregator',
  description: 'Discover and manage DeFi yield opportunities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
          <a href="/" style={{ marginRight: '1rem' }}>Home</a>
          <a href="/opportunities" style={{ marginRight: '1rem' }}>Opportunities</a>
          <a href="/portfolio" style={{ marginRight: '1rem' }}>Portfolio</a>
        </nav>
        <main style={{ padding: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  )
}