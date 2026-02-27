"use client";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">Ocurrió un error</h1>
      <p className="text-sm text-muted-foreground">{error.message || "Algo salió mal."}</p>
      <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground" onClick={reset}>
        Reintentar
      </button>
    </main>
  );
}
