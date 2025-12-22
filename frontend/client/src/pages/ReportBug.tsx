import "../styles/staticPages.css";

const ReportBug = () => {
    return (
        <div className="static-page">
            <h1>Report a Bug</h1>
            <div className="content">
                <p>Encountered an issue? Please let us know so we can improve the platform for everyone.</p>
                <div className="contact-form-placeholder">
                    <p>Please send bug reports to: <strong>engineering@e-library.com</strong></p>
                    <p>Include as much detail as possible, such as screenshots and steps to reproduce the issue.</p>
                </div>
            </div>
        </div>
    );
};

export default ReportBug;
