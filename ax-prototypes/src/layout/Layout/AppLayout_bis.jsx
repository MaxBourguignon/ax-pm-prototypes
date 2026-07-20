import { Outlet } from 'react-router-dom';
import Sidebar from '../Header/SideBar';
import TopHeader from '../../components/TopHeader';

function AppLayoutSidebar() {
    return (
        <div style={{ display: 'flex', height: '100vh', background: 'linear-gradient(to bottom, #FFFFFF 68px, #F4F9FF 68px)' }}>
            <div style={{ position: 'sticky', top: 0, height: '100vh', flexShrink: 0, zIndex: 40 }}>
                <Sidebar />
                {/* <NewSideBar /> */}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', background: '#F4F9FF' }}>
                <TopHeader />
                <Outlet />
            </div>
        </div>
    );
}

export default AppLayoutSidebar;