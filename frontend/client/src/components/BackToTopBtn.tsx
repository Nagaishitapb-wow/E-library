import { useEffect, useState } from "react";

const BackToTopBtn = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setVisible(true);
            } else {
                setVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    if (!visible) return null;

    return (
        <button
            onClick={scrollToTop}
            style={{
                position: "fixed",
                bottom: "30px",
                right: "30px",
                backgroundColor: "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                fontSize: "24px",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.transform = "scale(1.1)")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = "scale(1)")}
        >
            ⬆️
        </button>
    );
};

export default BackToTopBtn;
