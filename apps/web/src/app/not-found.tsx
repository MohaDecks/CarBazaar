import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-display text-6xl font-bold text-gray-200">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-brand-charcoal">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or was moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-md bg-accent px-5 text-sm font-medium text-white"
      >
        Back to home
      </Link>
    </div>
  );
}
