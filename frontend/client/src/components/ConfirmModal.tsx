import React from "react";
import { createPortal } from "react-dom";
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
                    {type === "danger" && "⚠️"}
                    {type === "warning" && "💡"}
                    {type === "info" && "ℹ️"}
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
