export default async function LangLayout({
    children,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    return <>{children}</>;
}

