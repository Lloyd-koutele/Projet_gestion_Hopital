function Sidebar() {
    return (
        <sidebar>
            <h2> Menu </h2>
            <button onClick={() => { window.location.href = '/login'; }}>
                Se deconnecter
            </button>
        </sidebar>
    );
}

export default Sidebar;
