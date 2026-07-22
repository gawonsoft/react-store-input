export function Toolbar({
  submittedAt,
  onApplyPreset,
}: {
  submittedAt?: string;
  onApplyPreset: () => void;
}) {
  return (
    <>
      <div className="toolbar">
        <div>
          <strong>Try the controls</strong>
          <span>Every change goes directly to the immutable store.</span>
        </div>
        <div className="toolbar-actions">
          <button
            type="button"
            className="button secondary"
            onClick={onApplyPreset}
          >
            Apply batch preset
          </button>
          <button type="reset" className="button ghost">
            Reset all
          </button>
          <button type="submit" className="button primary">
            Submit snapshot
          </button>
        </div>
      </div>

      {submittedAt && (
        <p className="notice" role="status">
          Snapshot submitted at {submittedAt}. Check the live state panel.
        </p>
      )}
    </>
  );
}
