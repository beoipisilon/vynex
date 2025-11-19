import { Outlet } from "react-router-dom";
import Header from './Header/Header'
import Sidebar from './Sidebar/Sidebar'
import { SidebarProvider } from '../contexts/SidebarContext'

const Content = () => {
    return (
        <SidebarProvider>
            <div className="Content-main">
                <Header />
                <Sidebar />
                <div className="Outlet">
                    <Outlet />
                </div>
            </div>
        </SidebarProvider>
    )
}

export default Content