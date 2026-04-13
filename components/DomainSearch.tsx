'use client';

import { useState } from 'react';

export default function DomainSearch({ buttonText = 'Search Domain' }: { buttonText?: string }) {
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const raw = domain.trim();
        if (!raw) return;
        setLoading(true);

        try {
            const body = new URLSearchParams({
                action: 'wdc_check_domain',
                domain: raw,
                item_id: '741',
            });
            const res = await fetch('https://dev-bluerange.pantheonsite.io/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body.toString(),
            });
            const json = await res.json();

            if (json?.success) {
                // Domain available — redirect
                window.location.href = `/?s=${encodeURIComponent(raw)}&post_type=domain`;
            } else {
                // Domain not available — stop animation, stay on page
                setLoading(false);
            }
        } catch {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <style>{`
                @keyframes wdc-jump {
                    0%, 60%, 100% { transform: translateY(0px); opacity: 0.3; }
                    30% { transform: translateY(-10px); opacity: 1; }
                }
                .wdc-dot-1 { animation: wdc-jump 1s ease-in-out infinite; animation-delay: 0s; }
                .wdc-dot-2 { animation: wdc-jump 1s ease-in-out infinite; animation-delay: 0.18s; }
                .wdc-dot-3 { animation: wdc-jump 1s ease-in-out infinite; animation-delay: 0.36s; }
            `}</style>

            <form onSubmit={handleSearch} style={{ display: 'flex' }}>
                <input
                    type="text"
                    className="form-control"
                    // placeholder="yourdomain.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    disabled={loading}
                    style={{
                        flex: 1,
                        borderRadius: '4px 0 0 4px',
                        border: 'none',
                        padding: '12px 16px',
                        fontSize: '16px',
                        outline: 'none',
                    }}
                />
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        borderRadius: '0 4px 4px 0',
                        backgroundColor: '#4fc3d9',
                        color: '#fff',
                        padding: '12px 24px',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap',
                        minWidth: 150,
                        fontSize: '15px',
                        opacity: loading ? 0.75 : 1,
                    }}
                >
                    {buttonText}
                </button>
            </form>

            {/* SVG dots — immune to swiper/bootstrap overrides */}
            {loading && (
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                    <svg className="wdc-dot-1" width="8" height="8" viewBox="0 0 14 14" style={{ display: 'block', overflow: 'visible' }}>
                        <circle cx="7" cy="7" r="7" fill="#4fc3d9" />
                    </svg>
                    <svg className="wdc-dot-2" width="8" height="8" viewBox="0 0 14 14" style={{ display: 'block', overflow: 'visible' }}>
                        <circle cx="7" cy="7" r="7" fill="#4fc3d9" />
                    </svg>
                    <svg className="wdc-dot-3" width="8" height="8" viewBox="0 0 14 14" style={{ display: 'block', overflow: 'visible' }}>
                        <circle cx="7" cy="7" r="7" fill="#4fc3d9" />
                    </svg>
                </div>
            )}
        </div>
    );
}
