import React from "react";
import "../styles/loader.css";

interface LoaderProps {
    fullPage?: boolean;
    size?: "small" | "medium" | "large";
    message?: string;
}

const Loader: React.FC<LoaderProps> = ({
    fullPage = false,
    size = "medium",
    message
}) => {
    const loaderContent = (
        <div className={`loader-container ${size}`}>
            <div className="book-loader">
                <div className="book-page"></div>
                <div className="book-page"></div>
                <div className="book-page"></div>
            </div>
            {message && <p className="loader-message">{message}</p>}
        </div>
    );

    if (fullPage) {
        return (
            <div className="loader-overlay">
                {loaderContent}
            </div>
        );
    }

    return loaderContent;
};

export default Loader;
