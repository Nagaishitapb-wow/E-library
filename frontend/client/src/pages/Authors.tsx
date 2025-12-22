import "../styles/staticPages.css";

const Authors = () => {
    return (
        <div className="static-page">
            <h1>Featured Authors</h1>
            <div className="content">
                <p>Discover some of the incredible authors in our collection.</p>
                <div className="authors-grid">
                    <div className="author-card">
                        <h4>J.K. Rowling</h4>
                        <p>Famous for the Harry Potter series.</p>
                    </div>
                    <div className="author-card">
                        <h4>J.R.R. Tolkien</h4>
                        <p>The creator of Middle-earth.</p>
                    </div>
                    <div className="author-card">
                        <h4>George R.R. Martin</h4>
                        <p>Author of A Song of Ice and Fire.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Authors;
