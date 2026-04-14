'use client';

import { useState } from 'react';

interface CF7Field {
    name: string;
    label?: string;
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
    placeholder?: string;
    required?: boolean;
    options?: string[];
    half?: boolean;
}

interface CF7FormProps {
    formId: number;
    unitTag: string;
    fields: CF7Field[];
    submitLabel?: string;
}

const WP = 'https://dev-bluerange.pantheonsite.io';

export default function CF7Form({ formId, unitTag, fields, submitLabel = 'Submit Request' }: CF7FormProps) {
    const [values, setValues] = useState<Record<string, string>>(() =>
        Object.fromEntries(fields.map(f => [f.name, f.options?.[0] || '']))
    );
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const set = (name: string, value: string) =>
        setValues(prev => ({ ...prev, [name]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        const body = new FormData();
        body.append('_wpcf7', String(formId));
        body.append('_wpcf7_version', '6.1.3');
        body.append('_wpcf7_locale', 'en_US');
        body.append('_wpcf7_unit_tag', unitTag);
        body.append('_wpcf7_container_post', '0');
        body.append('_wpcf7_posted_data_hash', '');

        fields.forEach(f => {
            body.append(f.name, values[f.name] || '');
        });

        try {
            const res = await fetch(
                `${WP}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`,
                { method: 'POST', body }
            );
            const json = await res.json();
            if (json.status === 'mail_sent') {
                setStatus('success');
                setMessage(json.message || 'Thank you! Your message has been sent.');
                setValues(Object.fromEntries(fields.map(f => [f.name, f.options?.[0] || ''])));
                setTimeout(() => setStatus('idle'), 6000);
            } else {
                setStatus('error');
                setMessage(json.message || 'There was an error. Please try again.');
                setTimeout(() => setStatus('idle'), 5000);
            }
        } catch {
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="wpcf7-form">
            <div className="row">
                {fields.map(field => (
                    <div key={field.name} className={field.half ? 'col-md-6' : 'col-md-12'} style={{ marginBottom: '16px' }}>
                        {field.type === 'textarea' ? (
                            <textarea
                                name={field.name}
                                placeholder={field.placeholder || field.label}
                                required={field.required}
                                rows={5}
                                className="wpcf7-form-control wpcf7-textarea form-control"
                                value={values[field.name]}
                                onChange={e => set(field.name, e.target.value)}
                                style={{ width: '100%' }}
                            />
                        ) : field.type === 'select' ? (
                            <select
                                name={field.name}
                                required={field.required}
                                className="wpcf7-form-control wpcf7-select form-control"
                                value={values[field.name]}
                                onChange={e => set(field.name, e.target.value)}
                                style={{ width: '100%' }}
                            >
                                {field.options?.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={field.type}
                                name={field.name}
                                placeholder={field.placeholder || field.label}
                                required={field.required}
                                className={`wpcf7-form-control wpcf7-${field.type} form-control`}
                                value={values[field.name]}
                                onChange={e => set(field.name, e.target.value)}
                                style={{ width: '100%' }}
                            />
                        )}
                    </div>
                ))}
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
                <div style={{ marginTop: '16px', padding: '12px 16px', background: '#f0fff4', border: '1px solid #46b450', borderRadius: '4px', color: '#2d6a30' }}>
                    {message}
                </div>
            )}
            {status === 'error' && (
                <div style={{ marginTop: '16px', padding: '12px 16px', background: '#fff5f5', border: '1px solid #dc3232', borderRadius: '4px', color: '#9b1c1c' }}>
                    {message}
                </div>
            )}
        </form>
    );
}
