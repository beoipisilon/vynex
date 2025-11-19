import "./Sidebar.css"
import "./SidebarM.css"
import { HiHome } from "react-icons/hi"
import { SiYoutubemusic } from "react-icons/si"
import { Subscription, Library } from "../../assets/index"
import { Link, useLocation } from "react-router-dom"
import { useSidebar } from "../../contexts/SidebarContext"

const Sidebar = () => {
    const location = useLocation();
    const { isOpen, closeSidebar } = useSidebar();
    
    const handleLinkClick = () => {
        closeSidebar();
    };
    
    return (
        <>
            {isOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}
            <div className={`sidebar-main flex col gap-1 ${isOpen ? 'sidebar-open' : ''}`}>
                <Link to={"/"} className={`sidebar-nav flex gap-1 ${location.pathname === "/" ? "active" : ""}`} title="Home" onClick={handleLinkClick}>
                    <div className="nav-icon">
                        <HiHome color="var(--text)" size={30} />
                    </div>
                    <span>Home</span>
                </Link>

                <Link to={"/music"} className={`sidebar-nav flex gap-1 ${location.pathname === "/music" ? "active" : ""}`} title="Music" onClick={handleLinkClick}>
                    <div className="nav-icon">
                        <SiYoutubemusic color="var(--text)" size={30} />
                    </div>
                    <span>Music</span>
                </Link>
                
                <Link to={"/library"} className={`sidebar-nav flex gap-1 ${location.pathname === "/library" ? "active" : ""}`} title="Library" onClick={handleLinkClick}>
                    <div className="nav-icon">
                        <Library fill="var(--text)" size={30} />
                    </div>
                    <span>Library</span>
                </Link>
            </div>
        </>
    )
}

export default Sidebar