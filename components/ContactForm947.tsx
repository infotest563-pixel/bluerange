'use client';

import { useState, FormEvent } from 'react';

export default function ContactForm947() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            // Submit through Next.js API route (proxies to WordPress)
            const res = await fetch('/api/cf7/947', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (data.status === 'mail_sent') {
                setMessage('✅ Message sent successfully!');
                form.reset();
            } else {
                setMessage(`❌ Failed: ${data.message || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            setMessage('⚠️ Error sending form');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form id="cf7-form-947" onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="your-name"
                    placeholder="Your Name"
                    required
                    disabled={loading}
                    style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '10px' }}
                />
                <input
                    type="email"
                    name="your-email"
                    placeholder="Your Email"
                    required
                    disabled={loading}
                    style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '10px' }}
                />
                <textarea
                    name="your-message"
                    placeholder="Your Message"
                    disabled={loading}
                    rows={5}
                    style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '10px' }}
                />
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#0070f3',
                        color: '#fff',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </form>

            {message && (
                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: message.startsWith('✅') ? '#d4edda' : '#f8d7da', borderRadius: '4px' }}>
                    {message}
                </div>
            )}
        </div>
    );
}
