import React, { useState } from "react";
import "../styles/paymentModal.css";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPay: (details: PaymentDetails) => Promise<void>;
    amount: number;
}

export interface PaymentDetails {
    cardNumber: string;
    expiry: string;
    cvv: string;
}

export default function PaymentModal({ isOpen, onClose, onPay, amount }: PaymentModalProps) {
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        await onPay({ cardNumber, expiry, cvv });
        setLoading(false);
        onClose();
    }

    return (
        <div className="payment-overlay">
            <div className="payment-modal">
                <h2>Pay Fine</h2>
                <p className="amount">Total: ₹{amount}</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Card Number</label>
                        <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            value={cardNumber}
                            onChange={e => setCardNumber(e.target.value)}
                            required
                            maxLength={16}
                        />
                    </div>

                    <div className="row">
                        <div className="form-group">
                            <label>Expiry</label>
                            <input
                                type="text"
                                placeholder="MM/YY"
                                value={expiry}
                                onChange={e => setExpiry(e.target.value)}
                                required
                                maxLength={5}
                            />
                        </div>
                        <div className="form-group">
                            <label>CVV</label>
                            <input
                                type="text"
                                placeholder="123"
                                value={cvv}
                                onChange={e => setCvv(e.target.value)}
                                required
                                maxLength={3}
                            />
                        </div>
                    </div>

                    <div className="actions">
                        <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
                        <button type="submit" className="pay-btn" disabled={loading}>
                            {loading ? "Processing..." : "Pay Now"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
