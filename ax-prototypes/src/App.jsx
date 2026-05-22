import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import './App.css'
import AppLayout from './layout/Layout/AppLayout'
import Home from './pages/HomePage'
import ContactsPage from './pages/ContactsPage'
import ContactRecord from './features/Contacts/ContactRecord'
import AppLayoutSidebar from './layout/Layout/AppLayout_bis'
import ConsentsPage from './features/Consents/ConsentsPage'
import PerformancesPage from './features/Performances/PerformancePage'

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
                    <Route path="/consents" element={<ConsentsPage />} />
                    <Route path="/performances" element={<PerformancesPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
