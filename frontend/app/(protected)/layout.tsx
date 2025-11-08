"use client";
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-gray-50">
      <main>{children}</main>
    </div>
  );
}
