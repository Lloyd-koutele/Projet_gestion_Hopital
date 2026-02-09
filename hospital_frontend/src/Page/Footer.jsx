import "../style/Footer.css"
function Footer() {
    return (
        <footer>
            <p className="footer">© {new Date().getFullYear()} - Système de Gestion Hospitalière</p>
        </footer>
    );
}

export default Footer;
