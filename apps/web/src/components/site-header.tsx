import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";

export async function SiteHeader() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg">
      <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-4 py-3.5 sm:px-5">
        <Link href="/" className="flex items-center gap-2.5 font-display text-2xl font-extrabold tracking-tight">
          {/* Price-tag mark from the mockup. */}
          <span className="relative h-[22px] w-[30px] rounded-[3px_10px_10px_3px] bg-tag after:absolute after:left-1.5 after:top-2 after:size-1.5 after:rounded-full after:bg-bg" />
          BetterMarket
        </Link>
        <nav className="ml-auto flex items-center gap-3 text-sm">
          {session ? (
            <>
              <span className="hidden text-muted sm:inline">{session.user.email}</span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="hover:underline">Sign in</Link>
              <Link href="/sign-up" className="rounded-lg bg-accent px-3 py-1.5 font-bold text-surface">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
