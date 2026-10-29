import { Outlet } from 'react-router-dom';
import NavBar from '../Header/NavBar';
import {DS} from '../../utils/designSystem';

function AppLayout() {
    return (
        <div style={{ minWidth: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <NavBar />
            <div style={{ flex: 1, background: DS.surfaceAppBackground, padding: '24px 72px' }}>
                <Outlet />
            </div>
        </div>
    );
}

export default AppLayout;