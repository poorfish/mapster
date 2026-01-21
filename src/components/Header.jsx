import './Header.css'

function Header() {
    return (
        <header className="header">
            <div className="header-logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 4h4l4 8 4-8h4v16h-4v-8l-4 8-4-8v8H4V4z" />
                </svg>
                <span className="logo-text">refinity</span>
            </div>
            <div className="header-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                </svg>
            </div>
        </header>
    )
}

export default Header
