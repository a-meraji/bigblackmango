export function parseContactSnapshot(snapshot: unknown): {
  firstName: string;
  lastName: string;
  mobile: string;
  displayName: string;
} {
  if (!snapshot || typeof snapshot !== 'object') {
    return { firstName: '', lastName: '', mobile: '', displayName: '—' };
  }
  const o = snapshot as Record<string, unknown>;
  const firstName = typeof o.firstName === 'string' ? o.firstName : '';
  const lastName = typeof o.lastName === 'string' ? o.lastName : '';
  const mobile = typeof o.mobile === 'string' ? o.mobile : '';
  const displayName = `${firstName} ${lastName}`.trim() || '—';
  return { firstName, lastName, mobile, displayName };
}

export function parseAddressSnapshot(snapshot: unknown): {
  addressLine: string;
  unit?: string;
  notes?: string;
} {
  if (!snapshot || typeof snapshot !== 'object') {
    return { addressLine: '—' };
  }
  const o = snapshot as Record<string, unknown>;
  const addressLine = typeof o.addressLine === 'string' ? o.addressLine : '—';
  const unit = typeof o.unit === 'string' && o.unit ? o.unit : undefined;
  const notes = typeof o.notes === 'string' && o.notes ? o.notes : undefined;
  return { addressLine, unit, notes };
}
