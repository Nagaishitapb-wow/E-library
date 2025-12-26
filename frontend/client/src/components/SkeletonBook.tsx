import "../styles/skeleton.css";

const SkeletonBook = () => {
    return (
        <div className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
                <div className="skeleton-line title"></div>
                <div className="skeleton-line author"></div>
                <div className="skeleton-line button"></div>
            </div>
        </div>
    );
};

export default SkeletonBook;
