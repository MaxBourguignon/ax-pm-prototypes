import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import './App.css'
import AppLayout from './layout/Layout/AppLayout'
import Home from './pages/HomePage'
import ContactsPage from './pages/ContactsPage'
import ContactRecord from './features/Contacts/ContactRecord'
import Acquisition from './features/Contacts/Acquisition'
import AppLayoutSidebar from './layout/Layout/AppLayout_bis'
import ConsentsPage from './features/Consents/ConsentsPage'
import ConsentsV3 from './features/Consents/ConsentsV3'
import PerformancesPage from './features/Performances/PerformancePage'
import PerformanceV3 from './features/Performances/PerformanceV3'
import ListsV3 from './features/Lists/ListsV3'
import ArenaForm from './features/Arenaform/Arenaform'
import SmsManagement from './features/Sms/SmsManagement'
import EntityMerge from './features/Admin/EntityMerge'

function App() {

    const [selectedContact, setSelectedContact] = useState(null);

    return (
        <BrowserRouter>
            <Routes>
                {/* <Route path="/" element={<AppLayout />}> */}
                <Route path="/" element={<AppLayoutSidebar />}>
                    <Route index element={<Navigate to="/home" replace />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/contacts" element={<ContactsPage selectedContact = {selectedContact} setSelectedContact = {setSelectedContact} />} />
                    <Route path="/contacts/:id" element={<ContactRecord selectedContact = {selectedContact} />} />
                    <Route path="/acquisition" element={<Acquisition />} />
                    {/* <Route path="/consents" element={<ConsentsPage />} /> */}
                    <Route path="/consents-v3" element={<ConsentsV3 />} />
                    {/* <Route path="/performances" element={<PerformancesPage />} /> */}
                    <Route path="/performances-v3" element={<PerformanceV3 />} />
                    <Route path="/lists-v3" element={<ListsV3 />} />
                    <Route path="/arenaform" element={<ArenaForm />} />
                    <Route path="/sms" element={<SmsManagement />} />
                    <Route path="/admin/entity-merge" element={<EntityMerge />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
