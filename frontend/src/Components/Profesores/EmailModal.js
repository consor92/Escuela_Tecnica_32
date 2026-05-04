import styles from "./EmailModal.module.css";
import { FaTimes, FaEnvelope } from "react-icons/fa";

const EmailModal = ({ onClose }) => {
    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const message = e.target.message.value;
        
        if (email.endsWith("@bue.edu.ar")) {
            const response = await fetch('/api/submitSuggestion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, message }),
            });

            if (response.ok) {
                alert("Sugerencia enviada correctamente.");
                onClose();
            } else {
                alert("Error al enviar la sugerencia.");
            }
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <FaTimes />
                </button>
                <h2>Enviar Sugerencias</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <input type="email" name="email" placeholder="Correo electrónico" required />
                    <textarea name="message" placeholder="Escribe aquí tu sugerencia para agregar a la página de la escuela" required rows="4"></textarea>
                    <button type="submit" className={styles.submitBtn}>
                        <FaEnvelope /> Enviar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EmailModal;
