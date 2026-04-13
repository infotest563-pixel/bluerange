'use client';

import { useState } from 'react';

export default function DeskToggle() {
    const [open, setOpen] = useState(false);

    return (
        <div className={`desk-toggale${open ? ' active' : ''}`}>
            <span className="desk-show" onClick={() => setOpen(true)}>
                <i className="fa fa-bars" aria-hidden="true"></i>
            </span>
            <div className={`deskside-inner${open ? ' active' : ''}`}>
                <span className="desk-close" onClick={() => setOpen(false)}>
                    <i className="fa fa-window-close" aria-hidden="true"></i>
                </span>
                <div className="deskside-content">
                    {/* Sidebar content */}
                </div>
            </div>
        </div>
    );
}
