export default function PortalLoading() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-primary text-3xl font-mono">
        <span>{">"}</span>
        <span className="animate-blink">_</span>
      </div>
      <p className="text-muted-foreground text-sm mt-4">Loading portal...</p>
    </main>
  );
}
