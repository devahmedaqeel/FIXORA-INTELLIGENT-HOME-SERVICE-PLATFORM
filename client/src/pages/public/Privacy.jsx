import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function Privacy() {
  useDocumentTitle('Privacy policy');
  return (
    <article className="container page-section prose">
      <h1>Privacy policy</h1>
      <p className="muted">Template policy for the Fixora platform — review with a legal professional before launch.</p>
      <h2>What we collect</h2>
      <p>Account details (name, email, phone), booking details (service, date, address, notes), reviews, complaints, and messages you send to the Fixora assistant.</p>
      <h2>How we use it</h2>
      <p>To run bookings, show your details to the provider you booked (name, phone and address for that booking only), verify providers, handle complaints, prevent fraud and improve the service.</p>
      <h2>Who can see what</h2>
      <ul>
        <li>Customers see providers’ public profiles. Provider phone numbers are shown only if the provider chooses.</li>
        <li>Providers see the details of bookings made with them — never other customers’ data.</li>
        <li>The assistant only reads data belonging to the signed-in account.</li>
        <li>Administrators can access records to operate and support the platform.</li>
      </ul>
      <h2>Storage & security</h2>
      <p>Data is stored in Google Firebase (Authentication, Cloud Firestore and Storage). Passwords are handled by Firebase Authentication and are never stored by Fixora.</p>
      <h2>Deleting your account</h2>
      <p>You can delete your account from your profile. We remove or anonymise your personal information; booking records needed for accounting and dispute handling are kept in anonymised form.</p>
      <h2>Contact</h2>
      <p>Questions about privacy? Use the Contact page.</p>
    </article>
  );
}
