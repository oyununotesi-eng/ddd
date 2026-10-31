export type PermissionGroup = 'owner' | 'group' | 'others';

export interface ChmodPermissions {
  owner: number;
  group: number;
  others: number;
  setuid: boolean;
  setgid: boolean;
  sticky: boolean;
}

export type ChmodParseResult =
  | { ok: true; permissions: ChmodPermissions }
  | { ok: false; error: string };

export const DEFAULT_CHMOD_PERMISSIONS: ChmodPermissions = {
  owner: 6,
  group: 4,
  others: 4,
  setuid: false,
  setgid: false,
  sticky: false,
};

const permissionDigits = (permissions: ChmodPermissions) => [permissions.owner, permissions.group, permissions.others];

export const formatChmodOctal = (permissions: ChmodPermissions): string => {
  const special = (permissions.setuid ? 4 : 0) + (permissions.setgid ? 2 : 0) + (permissions.sticky ? 1 : 0);
  const modes = permissionDigits(permissions).join('');
  return special ? `${special}${modes}` : modes;
};

export const formatChmodSymbolic = (permissions: ChmodPermissions): string => {
  const formatGroup = (value: number, special: boolean) => {
    let execute = value & 1 ? 'x' : '-';
    if (special) execute = value & 1 ? 's' : 'S';
    return `${value & 4 ? 'r' : '-'}${value & 2 ? 'w' : '-'}${execute}`;
  };

  const owner = formatGroup(permissions.owner, permissions.setuid);
  const group = formatGroup(permissions.group, permissions.setgid);
  let others = formatGroup(permissions.others, permissions.sticky);
  if (permissions.sticky) others = `${others.slice(0, 2)}${permissions.others & 1 ? 't' : 'T'}`;
  return `${owner}${group}${others}`;
};

export const parseChmodOctal = (value: string): ChmodParseResult => {
  if (!/^[0-7]{3,4}$/.test(value)) {
    return { ok: false, error: 'Octal mode must contain exactly three permission digits or four digits including special bits (0–7).' };
  }

  const digits = value.split('').map(Number);
  const special = digits.length === 4 ? digits[0] : 0;
  const [owner, group, others] = digits.length === 4 ? digits.slice(1) : digits;
  return {
    ok: true,
    permissions: {
      owner,
      group,
      others,
      setuid: Boolean(special & 4),
      setgid: Boolean(special & 2),
      sticky: Boolean(special & 1),
    },
  };
};

export const parseChmodSymbolic = (value: string): ChmodParseResult => {
  if (value.length !== 9) {
    return { ok: false, error: 'Symbolic mode must contain exactly nine characters, such as rwxr-xr-x.' };
  }

  const groups = [value.slice(0, 3), value.slice(3, 6), value.slice(6, 9)];
  const validGroups = [
    /^[r-][w-][xSs-]$/,
    /^[r-][w-][xSs-]$/,
    /^[r-][w-][xTt-]$/,
  ];
  if (groups.some((group, index) => !validGroups[index].test(group))) {
    return { ok: false, error: 'Symbolic mode contains an invalid permission character or special bit.' };
  }

  const digit = (group: string) => (group[0] === 'r' ? 4 : 0) + (group[1] === 'w' ? 2 : 0) + ('xst'.includes(group[2].toLowerCase()) && group[2] !== '-' && group[2] === group[2].toLowerCase() ? 1 : 0);
  const [owner, group, others] = groups;
  return {
    ok: true,
    permissions: {
      owner: digit(owner),
      group: digit(group),
      others: digit(others),
      setuid: owner[2] === 's' || owner[2] === 'S',
      setgid: group[2] === 's' || group[2] === 'S',
      sticky: others[2] === 't' || others[2] === 'T',
    },
  };
};

export const parseChmodMode = (value: string): ChmodParseResult => {
  const normalized = value.trim();
  if (!normalized) return { ok: false, error: 'Enter an octal or symbolic permission mode.' };
  return /^\d+$/.test(normalized) ? parseChmodOctal(normalized) : parseChmodSymbolic(normalized);
};

/** POSIX shell single-quote escaping. The returned value is a literal argument, never executed here. */
export const quoteShellArgument = (value: string): string => {
  if (/^[A-Za-z0-9_./:@+-]+$/.test(value)) return value;
  return `'${value.replace(/'/g, "'\\''")}'`;
};
