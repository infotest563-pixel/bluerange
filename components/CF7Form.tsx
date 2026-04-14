'use client';

import { useState, useEffect } from 'react';

const WP_BASE = 'https://dev-bluerange.pantheonsite.io';

interface CF7Field {
    name: string;
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
    placeholder?: string;
    required?: boolean;
    half?: boolean;
    options?: string[];
}

interface CF7FormProps {
    formId: number;
    unitTag: string;
    submitLabel?: string;
    fields?: CF7Field[];
}

// Map of form IDs to their GUIDs
const FORM_GUID_MAP: Record<number, string> = {
    947: '8e88d3b',
    948: 'cbbde7a',
    955: '1465da7',
    957: 'b990f59',
    943: 'b8c2759',
    70: '70',
};

export default function CF7Form({ formId, unitTag, submitLabel = 'Submit Request', fields: overrideFields }: CF7FormProps) {
    const [fieldNames, setFieldNames] = useState<string[]>([]);
    const [values, setValues] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (overrideFields && overrideFields.length > 0) {
            const names = overrideFields.map((f: CF7Field) => f.name);
            setFieldNames(names);
            const initVals: Record<string, string> = {};
            overrideFields.forEach((f: CF7Field) => {
                initVals[f.name] = f.options?.[0] || '';
            });
            setValues(initVals);
            setReady(true);
            return;
        }
        setReady(true);
    }, [formId, overrideFields]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setStatus('loading');

        // Get the GUID for this form
        const guid = FORM_GUID_MAP[formId] || String(formId);

        const body = new FormData();
        
        // Add CF7 required fields
        body.append('_wpcf7', guid);
        body.append('_wpcf7_version', '6.1.3');
        body.append('_wpcf7_locale', 'en_US');
        body.append('_wpcf7_unit_tag', unitTag);
        body.append('_wpcf7_container_post', '0');
        body.append('_wpcf7_posted_data_hash', '');

        // Add all form fields
        fieldNames.forEach((name: string) => {
            body.append(name, values[name] || '');
        });

        try {
            // Submit directly to WordPress (like ContactForm does)
            const wpEndpoint = `${WP_BASE}/wp-json/contact-form-7/v1/contact-forms/${guid}/feedback`;
            const res = await fetch(wpEndpoint, { method: 'POST', body });
            const json = await res.json();
            
            if (json.status === 'mail_sent') {
                setStatus('success');
                setMessage(json.message || 'Thank you for your message. It has been sent.');
                const cleared: Record<string, string> = {};
                fieldNames.forEach((n: string) => { cleared[n] = ''; });
                setValues(cleared);
                setTimeout(() => setStatus('idle'), 6000);
            } else {
                setStatus('error');
                setMessage(json.message || 'There was an error submitting the form. Please try again.');
                setTimeout(() => setStatus('idle'), 5000);
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error. Please try again.');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    if (!ready) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading form...</div>;
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="wpcf7-form"
            action="#"
            method="post"
        >
            <div className="row">
                {fieldNames.map((name: string) => {
                    const override = overrideFields?.find((f: CF7Field) => f.name === name);
                    const fieldType = override?.type || 'text';
                    const isTextarea = fieldType === 'textarea';
                    const isSelect = fieldType === 'select';
                    const isEmail = fieldType === 'email';
                    const isTel = fieldType === 'tel';
                    const isHalf = override?.half ?? false;
                    const placeholder = override?.placeholder || name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
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
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                        setValues((v: Record<string, string>) => ({ ...v, [name]: e.target.value }))
                                    }
                                    style={{ width: '100%' }}
                                />
                            ) : isSelect ? (
                                <select
                                    name={name}
                                    required={override?.required}
                                    className="wpcf7-form-control wpcf7-select form-control"
                                    value={values[name] || ''}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                        setValues((v: Record<string, string>) => ({ ...v, [name]: e.target.value }))
                                    }
                                    style={{ width: '100%' }}
                                >
                                    {(override?.options || []).map((opt: string) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={inputType}
                                    name={name}
                                    placeholder={placeholder}
                                    required={override?.required}
                                    className={`wpcf7-form-control wpcf7-${inputType} form-control`}
                                    value={values[name] || ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setValues((v: Record<string, string>) => ({ ...v, [name]: e.target.value }))
                                    }
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
