import "../styles/staticPages.css";
import SupportForm from "../components/SupportForm";

const RequestBook = () => {
    return (
        <div className="static-page">
            <h1>Request a Book</h1>
            <div className="content">
                <p>Can't find what you're looking for? Let us know, and we'll do our best to add it to our collection.</p>
                <div className="contact-form-placeholder">
                    <p>Send your book requests to: <strong>curation@e-library.com</strong></p>
                    <p>Please include the book title and author name.</p>
                </div>

                <div className="or-divider">
                    <span>OR</span>
                </div>

                <SupportForm type="request" title="Book Request" />
            </div>
        </div>
    );
};

export default RequestBook;
