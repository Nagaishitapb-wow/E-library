import { createPortal } from "react-dom";
import { AlertTriangle, Info, Lightbulb } from "lucide-react";
import "../styles/confirmModal.css";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger"
}) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay confirm-modal-overlay">
            <div className="modal-content confirm-modal-content">
                <div className={`modal-header-icon ${type}`}>
                    {type === "danger" && <AlertTriangle size={48} />}
                    {type === "warning" && <Lightbulb size={48} />}
                    {type === "info" && <Info size={48} />}
                </div>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="modal-actions">
                    <button className="btn secondary" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className={`btn ${type}`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmModal;
