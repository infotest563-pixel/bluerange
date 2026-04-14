'use client';

import { useState, useEffect } from 'react';

interface CF7FormProps {
    formId: number;
    unitTag: string;
    submitLabel?: string;
    // Optional override fields — if not provided, fetched from WP
    fields?: { name: string; type: string; placeholder?: string; required?: boolean; half?: boolean }[];
}

export default function CF7Form({ formId, unitTag, submitLabel = 'Submit Request', fields: overrideFields }: CF7FormProps) {
    const [fields, setFields] = useState<string[]>([]);
    const [values, setValues] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (overrideFields) {
            const names = overrideFields.map(f => f.name);
            setFields(names);
            setValues(Object.fromEntries(names.map(n => [n, ''])));
            setReady(true);
            return;
        }
        // Fetch real field names from WP via our API proxy
        fetch(`/api/cf7/${formId}`)
            .then(r => r.json())
            .then(data => {
                const names: string[] = data.fields || [];
                setFields(names);
                setValues(Object.fromEntries(names.map((n: string) => [n, ''])));
                setReady(true);
            })
            .catch(() => setReady(true));
    }, [formId, overrideFields]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('loading');

        const body = new FormData();
        body.append('_wpcf7', String(formId));
        body.append('_wpcf7_version', '6.1.3');
        body.append('_wpcf7_locale', 'en_US');
        body.append('_wpcf7_unit_tag', unitTag);
        body.append('_wpcf7_container_post', '0');
        body.append('_wpcf7_posted_data_hash', '');

        fields.forEach(name => {
            body.append(name, values[name] || '');
        });

        try {
            const res = await fetch(`/api/cf7/${formId}`, { method: 'POST', body });
            const json = await res.json();

            if (json.status === 'mail_sent') {
                setStatus('success');
                setMessage(json.message || 'Thank you! Your message has been sent.');
                setValues(Object.fromEntries(fields.map(n => [n, ''])));
                setTimeout(() => setStatus('idle'), 6000);
            } else {
                setStatus('error');
                setMessage(json.message || 'Please fill in all required fields.');
                setTimeout(() => setStatus('idle'), 5000);
            }
        } catch {
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    };

    if (!ready) return <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading form...</div>;

    return (
        <form onSubmit={handleSubmit} className="wpcf7-form">
            <div className="row">
                {fields.map(name => {
                    const override = overrideFields?.find(f => f.name === name);
                    const isTextarea = override?.type === 'textarea' || name.includes('message') || name.includes('textarea') || name.includes('text-area');
                    const isEmail = override?.type === 'email' || name.includes('email') || name.includes('mail');
                    const isTel = override?.type === 'tel' || name.includes('phone') || name.includes('mobile') || name.includes('tel') || name.includes('number');
                    const isHalf = override?.half ?? false;
                    const placeholder = override?.placeholder || name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                    const inputType = isEmail ? 'email' : isTel ? 'tel' : 'text';

                    return (
                        <div key={name} className={isHalf ? 'col-md-6' : 'col-md-12'} style={{ marginBottom: '12px' }}>
                            {isTextarea ? (
                                <textarea
                                    name={name}
                                    placeholder={placeholder}
                                    rows={5}
                                    className="wpcf7-form-control wpcf7-textarea form-control"
                                    value={values[name] || ''}
                                    onChange={e => setValues(v => ({ ...v, [name]: e.target.value }))}
                                    style={{ width: '100%' }}
                                />
                            ) : (
                                <input
                                    type={inputType}
                                    name={name}
                                    placeholder={placeholder}
                                    required={override?.required}
                                    className={`wpcf7-form-control wpcf7-${inputType} form-control`}
                                    value={values[name] || ''}
                                    onChange={e => setValues(v => ({ ...v, [name]: e.target.value }))}
                                    style={{ width: '100%' }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: '8px' }}>
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="wpcf7-form-control wpcf7-submit btn btn-primary"
                    style={{ minWidth: '160px' }}
                >
                    {status === 'loading' ? 'Sending...' : submitLabel}
                </button>
            </div>

            {status === 'success' && (
                <div className="wpcf7-response-output" style={{ marginTop: '16px', padding: '12px 16px', background: '#f0fff4', border: '1px solid #46b450', borderRadius: '4px', color: '#2d6a30' }}>
                    {message}
                </div>
            )}
            {status === 'error' && (
                <div className="wpcf7-response-output" style={{ marginTop: '16px', padding: '12px 16px', background: '#fff5f5', border: '1px solid #dc3232', borderRadius: '4px', color: '#9b1c1c' }}>
                    {message}
                </div>
            )}
        </form>
    );
}
