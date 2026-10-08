/** Shown instead of the app when the Firebase web config is missing from client/.env. */
export default function SetupNotice() {
  return (
    <main className="setup-notice">
      <div className="card stack">
        <h1>Fixora needs Firebase configuration</h1>
        <p>
          The web client could not find its Firebase settings. Copy <code>client/.env.example</code> to <code>client/.env</code>, fill in the
          values from <em>Firebase Console → Project settings → Your apps → Web app</em>, then restart <code>npm run dev</code>.
        </p>
        <p className="muted">Full instructions are in docs/SETUP.md.</p>
      </div>
    </main>
  );
}
