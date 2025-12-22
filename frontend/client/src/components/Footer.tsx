import { Link } from "react-router-dom";
import "../styles/footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h3>About E-Library</h3>
                    <ul>
                        <li><Link to="/about">About E-Library</Link></li>
                        <li><Link to="/mission">Our Mission</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/books">Browse Books</Link></li>
                        <li><Link to="/categories">Categories</Link></li>
                        <li><Link to="/authors">Authors</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Help & Support</h3>
                    <ul>
                        <li><Link to="/help">Help</Link></li>
                        <li><Link to="/support">Contact Support</Link></li>
                        <li><Link to="/report-bug">Report a Bug</Link></li>
                        <li><Link to="/request-book">Request a Book</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Follow Us</h3>
                    <div className="social-links">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} E-Library. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
