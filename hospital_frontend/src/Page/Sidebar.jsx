import { useState } from 'react';
import '../style/Sidebar.css';

function Sidebar({ title, children }) {
    const [open, setOpen] = useState(true);

    return (
        <aside className={open ? 'sidebar sidebar-open' : 'sidebar sidebar-closed'}>
            <div className='sidebar-header'>
                <button onClick={() => setOpen(!open)} className='toggle-button'>
                    {open ? "X" : "->"}
                </button>
            </div>

            {open && (
                <div className='sidebar-content'>
                    {children}
                </div>
            )}

            {open &&
                <button
                    className='logout-button'
                    onClick={() => { window.location.href = '/login'; }}
                >
                    Se déconnecter
                </button>
            }
        </aside>
    );
}

export default Sidebar;