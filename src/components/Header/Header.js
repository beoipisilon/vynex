import "./Header.css"
import "./HeaderM.css"
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiSearch } from "react-icons/hi"
import { BsYoutube } from "react-icons/bs"
import { AiOutlineUser } from "react-icons/ai"
import { FaGithub } from "react-icons/fa"
import { Devbase } from "../../assets";

const Header = () => {
    const [showProfile, setShowProfile] = useState(false);
    const SearchRef = useRef(null);
    const profileRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false);
            }
        };

        if (showProfile) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfile]);

    const SearchQuery = (e) => {
        e.preventDefault();
        if (SearchRef.current.value !== "") {
            navigate(`/search/${SearchRef.current.value}`);
            SearchRef.current.value = "";
        }
    }

    return (
        <div className="header-main flex">
            <div className="header-nav flex gap-2">
                <div className="header-logo flex gap-05">
                    <BsYoutube color="var(--logo)" size={40} />
                    <h1>Vy<span style={{ color: "var(--logo)" }}>nex</span></h1>
                </div>
            </div>

            <form onSubmit={SearchQuery} className="header-searchbar flex">
                <input type="text" placeholder="Search" ref={SearchRef} id="search" autoComplete="off" />
                <button type="submit" title="Search" >
                    <HiSearch className="search-icon" color="var(--text)" size={25} />
                </button>
            </form>

            <div className="header-profile" ref={profileRef}>
                <div className="profile-icon" onClick={() => setShowProfile(!showProfile)}>
                    <AiOutlineUser color="var(--text)" size={25} />
                </div>

                {showProfile && (
                    <div className="profile-dropdown">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                <AiOutlineUser color="var(--text)" size={40} />
                            </div>
                            <div className="profile-info">
                                <div className="profile-name">beoipisilon</div>
                                <div className="profile-handle">@beoipisilon</div>
                            </div>
                        </div>

                        <div className="profile-divider"></div>

                        <div className="profile-menu">
                            <a href="https://vynex-phi.vercel.app" className="profile-menu-item" target="_blank" rel="noopener noreferrer">
                                <Devbase fill="var(--text)" size={20} />
                                <span>Vercel</span>
                            </a>
                            <a href="https://github.com/beoipisilon" className="profile-menu-item" target="_blank" rel="noopener noreferrer">
                                <FaGithub color="var(--text)" size={20} />
                                <span>GitHub</span>
                            </a>
                        </div>

                        <div className="profile-divider"></div>

                        <div className="profile-footer">
                            <p>© Copyright 2025 beoipisilon</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Header