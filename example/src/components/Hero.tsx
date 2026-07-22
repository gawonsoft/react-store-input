export function Hero({ notificationCount }: { notificationCount: number }) {
  return (
    <header className="hero">
      <div>
        <p className="eyebrow">react-store-input · interactive catalog</p>
        <h1>One store. Every form control.</h1>
        <p className="hero-copy">
          Edit any field and watch its typed value update. This page exercises
          the complete core API, native reset behavior, custom bindings, and the
          optional editor entry point.
        </p>
      </div>
      <div className="hero-stats" aria-label="Demo status">
        <span>
          <strong>{notificationCount}</strong> notifications
        </span>
        <span>
          <strong>0.2.0</strong> gw-store
        </span>
      </div>
    </header>
  );
}
