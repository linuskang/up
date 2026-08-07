import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1 px-6">
      <h1 className="text-4xl font-bold mb-4">Upstream Docs</h1>
      <p className="text-lg text-fd-muted-foreground max-w-xl mx-auto mb-8">
        Simple and open event logging for your SaaS projects. Learn how to integrate the SDK, self-host the platform, and manage your events.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/docs"
          className="px-6 py-2 rounded-lg bg-fd-primary text-fd-primary-foreground font-medium"
        >
          Get Started
        </Link>
        <Link
          href="https://github.com/linuskang/up"
          className="px-6 py-2 rounded-lg border font-medium"
        >
          GitHub
        </Link>
      </div>
    </div>
  );
}
