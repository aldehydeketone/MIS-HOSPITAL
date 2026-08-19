import { formatDateTime } from '../../utils/formatters';

// Shows last-accessed audit tag beneath a record
export default function AccessAuditTag({ accessedBy, accessedAt }) {
  if (!accessedBy && !accessedAt) return null;
  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-gray-400 mt-1">
      <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <span>
        Last accessed{accessedBy && ` by ${accessedBy}`}
        {accessedAt && (
          <span className="font-mono ml-1">{formatDateTime(accessedAt)}</span>
        )}
      </span>
    </div>
  );
}
