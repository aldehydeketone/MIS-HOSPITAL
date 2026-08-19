// Format timestamp to readable string
export function formatDateTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

export function formatDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatTime(t) {
  if (!t) return '—';
  // t might be "10:00:00"
  return t.slice(0, 5);
}

// Generate next patient code suggestion (not used in form, just reference)
export function generatePatientCode(prefix = 'PT') {
  return `${prefix}-${Math.floor(2000 + Math.random() * 9000)}`;
}
