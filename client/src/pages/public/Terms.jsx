import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function Terms() {
  useDocumentTitle('Terms of service');
  return (
    <article className="container page-section prose">
      <h1>Terms of service</h1>
      <p className="muted">Template terms for the Fixora platform — have them reviewed by a legal professional before launch.</p>
      <h2>1. The service</h2>
      <p>Fixora is a marketplace that connects customers with independent home-service providers. Providers are not Fixora employees; each provider is responsible for the quality, safety and legality of their work.</p>
      <h2>2. Accounts</h2>
      <p>You must give accurate information and keep your password secure. You are responsible for activity on your account. We may suspend accounts that break these terms.</p>
      <h2>3. Provider verification</h2>
      <p>Providers are reviewed before appearing in search. Verification reduces risk but is not a guarantee; customers should use normal judgement when inviting anyone into their home.</p>
      <h2>4. Bookings and cancellations</h2>
      <p>A booking request becomes confirmed when the provider accepts it. Customers may cancel free of charge up to the cancellation cutoff shown on the booking. Cancellations after the cutoff are subject to the late-cancellation policy displayed before you confirm.</p>
      <h2>5. Payments</h2>
      <p>Unless stated otherwise, customers pay providers directly (for example in cash) after the service. Prices shown are set by providers.</p>
      <h2>6. Reviews</h2>
      <p>Reviews must be honest and relate to a completed booking. We may remove reviews that are abusive, fraudulent or irrelevant.</p>
      <h2>7. Complaints</h2>
      <p>Raise any issue through the complaints section of your dashboard. Our team will review it and respond.</p>
      <h2>8. Liability</h2>
      <p>To the extent permitted by law, Fixora is not liable for losses arising from services performed by providers. Nothing in these terms limits rights you have under Pakistani consumer protection law.</p>
    </article>
  );
}
