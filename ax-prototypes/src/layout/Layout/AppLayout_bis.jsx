import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Header/SideBar';
import TopHeader from '../../components/TopHeader';
import { DS } from '../../utils/designSystem';

function AppLayoutSidebar() {
    // The admin console (CS back-office) gets a reduced top header:
    // breadcrumb + tenant, without the client app's search and icons.
    const admin = useLocation().pathname.startsWith('/admin');
    return (
        // The white band must end where TopBar ends — 72 per the DS (was 68).
        <div style={{ display: 'flex', height: '100vh', background: `linear-gradient(to bottom, ${DS.surfaceCanvas} 72px, ${DS.surfaceAppBackground} 72px)` }}>
            <div style={{ position: 'sticky', top: 0, height: '100vh', flexShrink: 0, zIndex: 40 }}>
                <Sidebar />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', background: DS.surfaceAppBackground }}>
                <TopHeader admin={admin} />
                <div style={{ padding: '24px 32px' }} >
                <Outlet />
                </div>
                
            </div>
        </div>
    );
}

export default AppLayoutSidebar;