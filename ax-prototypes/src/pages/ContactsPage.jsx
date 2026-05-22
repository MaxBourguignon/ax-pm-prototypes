// import Contacts from '../features/Contacts/Contacts'
import NewContactsPage from '../features/Contacts/Contacts';

function ContactsPage({ selectedContact, setSelectedContact }) {

  return (
    <>
      <div>
        <NewContactsPage selectedContact={selectedContact} setSelectedContact={setSelectedContact} />
      </div>
    </>
  )
}

export default ContactsPage;
