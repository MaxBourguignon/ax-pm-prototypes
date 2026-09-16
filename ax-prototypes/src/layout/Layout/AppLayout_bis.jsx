import { Outlet } from 'react-router-dom';
import Sidebar from '../Header/SideBar';
import TopHeader from '../../components/TopHeader';
import { DS } from '../../utils/designSystem';

function AppLayoutSidebar() {
    return (
        // The white band must end where TopBar ends — 72 per the DS (was 68).
        <div style={{ display: 'flex', height: '100vh', background: `linear-gradient(to bottom, ${DS.surfaceCanvas} 72px, ${DS.bgPage} 72px)` }}>
            <div style={{ position: 'sticky', top: 0, height: '100vh', flexShrink: 0, zIndex: 40 }}>
                <Sidebar />
                {/* <NewSideBar /> */}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', background: DS.surfaceAppBackground }}>
                <TopHeader />
                <div style={{ padding: '24px 32px' }} >
                <Outlet />
                </div>
                
            </div>
        </div>
    );
}

export default AppLayoutSidebar;