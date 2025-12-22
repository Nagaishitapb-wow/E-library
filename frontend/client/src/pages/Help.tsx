import "../styles/staticPages.css";

const Help = () => {
    return (
        <div className="static-page">
            <h1>Help Center</h1>
            <div className="content">
                <p>Welcome to the E-Library Help Center. Here you can find answers to common questions and guides on how to use our platform.</p>

                <h3>Frequently Asked Questions</h3>
                <div className="faq">
                    <div className="faq-item">
                        <h4>How do I borrow a book?</h4>
                        <p>Simply navigate to the "Browse Books" page, find a book you like, and click the "Borrow" button. You must be logged in to borrow books.</p>
                    </div>
                    <div className="faq-item">
                        <h4>How long can I keep a borrowed book?</h4>
                        <p>Our standard borrowing period is 14 days. You can view your active borrows and their due dates in your Dashboard.</p>
                    </div>
                    <div className="faq-item">
                        <h4>How do I return a book?</h4>
                        <p>Go to your "My Books" page and click "Request Return". An admin will then confirm your return.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Help;
