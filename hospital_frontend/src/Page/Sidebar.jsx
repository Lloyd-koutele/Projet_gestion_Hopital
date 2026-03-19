import {useState} from 'react';
import '../style/Sidebar.css';

function Sidebar({title, children}) {
    const [open, setOpen] = useState(true);
    return (
        <sidebar>
            <div className={open ? 'sidebar-open' : 'sidebar-closed'}>
                <div className='sidebar-header'>
                    {open && <h2 className='titre'> {title} </h2>}
                    <button onClick={() => setOpen(!open)}
                        className='toggle-button'
                    >
                        {open ? "x" : "→"}
                    </button>
                </div>
                <div className='sidebar-content'>
                    {children}
                </div>
            </div>
            <button 
            className='logout-button'
            onClick={() => { window.location.href = '/login'; }}>
                Se deconnecter
            </button>
        </sidebar>
    );
}

export default Sidebar;
