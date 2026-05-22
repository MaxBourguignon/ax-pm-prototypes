import { Outlet } from 'react-router-dom';
import Sidebar from '../Header/SideBar';

function AppLayoutSidebar() {
    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div style={{ position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
                <Sidebar />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', background: '#F3F4F6' }}>
                <Outlet />
            </div>
        </div>
    );
}

export default AppLayoutSidebar;