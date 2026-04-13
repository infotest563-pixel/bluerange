'use client';

import { useState, useEffect } from 'react';

export default function DeskToggle() {
    const [open, setOpen] = useState(false);

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <>
            <div className="desk-toggale">
                <span
                    className="desk-show"
                    onClick={() => setOpen(true)}
                    style={{ cursor: 'pointer', display: open ? 'none' : 'inline-block' }}
                >
                    <i className="fa fa-bars" aria-hidden="true"></i>
                </span>
            </div>

            {/* Overlay backdrop */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.4)',
                        zIndex: 110,
                    }}
                />
            )}

            {/* Sidebar panel */}
            <div className={`deskside-inner${open ? ' active' : ''}`}>
                <span
                    className="desk-close"
                    onClick={() => setOpen(false)}
                    style={{ cursor: 'pointer', display: 'inline-block' }}
                >
                    <i className="fa fa-window-close" aria-hidden="true"></i>
                </span>
                <div className="deskside-content">
                    {/* Sidebar content goes here */}
                </div>
            </div>
        </>
    );
}
