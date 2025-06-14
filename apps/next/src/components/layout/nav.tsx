import Link from "next/link";

export default function Nav() {
  return (
    <nav className="bg-muted flex h-[var(--nav-height)] w-full items-stretch">
      <div className="container flex items-center justify-between !py-4">
        <p className="text-sm font-semibold uppercase">Podcast Summarizer</p>
        <div className="flex items-center gap-6 sm:gap-10">
          <Link href="/">Home</Link>
          <Link href="/#">About</Link>
        </div>
      </div>
    </nav>
  );
}
