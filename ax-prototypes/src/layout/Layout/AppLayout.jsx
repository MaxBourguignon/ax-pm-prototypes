import { Outlet } from 'react-router-dom';
import NavBar from '../Header/NavBar';

function AppLayout() {
    return (
        <div style={{ minWidth: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <NavBar />
            <div style={{ flex: 1, background: '#F4F9FF' }}>
                <Outlet />
            </div>
        </div>
    );
}

export default AppLayout;