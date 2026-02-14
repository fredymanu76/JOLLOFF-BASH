import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-jollof-bg">
      <Link href="/" className="text-2xl font-bold text-jollof-amber mb-8">
        Jollof Bash
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
