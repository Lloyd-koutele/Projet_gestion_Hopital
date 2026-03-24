import { useEffect } from "react";
import '../style/Modal.css';

function Modal({ isOpen, onClose, title, children }) {

    // fermer avec la touche ESC
    useEffect(() => {

        const handleEsc = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEsc);

        return () => {
            document.removeEventListener("keydown", handleEsc);
        };

    }, [onClose]);

    if (!isOpen) return null;

    return (

        <div className="modal-overlay">

            <div className="modal-content">

                <div className="modal-header">

                    <h2>{title}</h2>

                    <button onClick={onClose}>
                        ✕
                    </button>

                </div>

                <div className="modal-body">
                    {children}
                </div>

            </div>

        </div>

    );
}

export default Modal;