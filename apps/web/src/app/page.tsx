import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SOURCES } from "@/lib/sources";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <section className="space-y-6">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        {session ? `Welcome back, ${session.user.name}` : "Every local marketplace, one search."}
      </h1>
      <p className="max-w-prose text-muted">
        Search, the personalized feed and saved collections arrive in later phases. This page confirms the app,
        database and auth are wired together.
      </p>
      <ul className="flex flex-wrap gap-2">
        {Object.entries(SOURCES).map(([key, s]) => (
          <li key={key} className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-sm">
            <span className="size-2.5 rounded-full" style={{ background: `var(${s.colorVar})` }} />
            {s.name}
          </li>
        ))}
      </ul>
    </section>
  );
}
