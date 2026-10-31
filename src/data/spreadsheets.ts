export interface ImportedTable {
  headers: string[];
  rows: string[][];
  sourceFile: string;
  importedAt: string;
}

export interface ImportedTableBackup {
  id: string;
  target: string;
  targetLabel: string;
  createdAt: string;
  previous: ImportedTable;
}

const IMPORTED_TABLES_KEY = 'murat_imported_tables';
const IMPORT_BACKUPS_KEY = 'murat_import_backups';
const IMPORT_DB_NAME = 'murat_workspace_imports';
const IMPORT_DB_VERSION = 1;
const TABLES_STORE = 'tables';
const BACKUPS_STORE = 'backups';

const readLegacyTableMap = (): Record<string, ImportedTable> => {
  try {
    const saved = localStorage.getItem(IMPORTED_TABLES_KEY);
    return saved ? JSON.parse(saved) as Record<string, ImportedTable> : {};
  } catch {
    return {};
  }
};

const readLegacyBackups = (): ImportedTableBackup[] => {
  try {
    const saved = localStorage.getItem(IMPORT_BACKUPS_KEY);
    return saved ? JSON.parse(saved) as ImportedTableBackup[] : [];
  } catch {
    return [];
  }
};

const requestValue = <T,>(request: IDBRequest<T>): Promise<T> => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error || new Error('Tarayıcı veritabanı okunamadı.'));
});

const transactionComplete = (transaction: IDBTransaction): Promise<void> => new Promise((resolve, reject) => {
  transaction.oncomplete = () => resolve();
  transaction.onerror = () => reject(transaction.error || new Error('Tarayıcı veritabanı işlemi tamamlanamadı.'));
  transaction.onabort = () => reject(transaction.error || new Error('Tarayıcı veritabanı işlemi iptal edildi.'));
});

const openImportDatabase = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  if (typeof indexedDB === 'undefined') {
    reject(new Error('Dosya verileri için IndexedDB desteği gerekli.'));
    return;
  }
  const request = indexedDB.open(IMPORT_DB_NAME, IMPORT_DB_VERSION);
  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(TABLES_STORE)) database.createObjectStore(TABLES_STORE, { keyPath: 'target' });
    if (!database.objectStoreNames.contains(BACKUPS_STORE)) database.createObjectStore(BACKUPS_STORE, { keyPath: 'id' });
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error || new Error('Tarayıcı veritabanı açılamadı.'));
});

let migrationPromise: Promise<void> | null = null;
const migrateLegacyImportData = async () => {
  if (migrationPromise) return migrationPromise;
  migrationPromise = (async () => {
    const oldTables = readLegacyTableMap();
    const oldBackups = readLegacyBackups();
    if (!Object.keys(oldTables).length && !oldBackups.length) return;
    const database = await openImportDatabase();
    try {
      const readTransaction = database.transaction([TABLES_STORE, BACKUPS_STORE], 'readonly');
      const readComplete = transactionComplete(readTransaction);
      const existingTablesRequest = readTransaction.objectStore(TABLES_STORE).getAllKeys();
      const existingBackupsRequest = readTransaction.objectStore(BACKUPS_STORE).getAllKeys();
      const [existingTableKeys, existingBackupKeys] = await Promise.all([
        requestValue(existingTablesRequest),
        requestValue(existingBackupsRequest),
      ]);
      await readComplete;
      const tableKeys = new Set(existingTableKeys.map(String));
      const backupKeys = new Set(existingBackupKeys.map(String));
      const transaction = database.transaction([TABLES_STORE, BACKUPS_STORE], 'readwrite');
      const writeComplete = transactionComplete(transaction);
      for (const [target, table] of Object.entries(oldTables)) {
        if (!tableKeys.has(target)) transaction.objectStore(TABLES_STORE).put({ ...table, target });
      }
      for (const backup of oldBackups) {
        if (!backupKeys.has(backup.id)) transaction.objectStore(BACKUPS_STORE).put(backup);
      }
      await writeComplete;
      localStorage.removeItem(IMPORTED_TABLES_KEY);
      localStorage.removeItem(IMPORT_BACKUPS_KEY);
    } finally {
      database.close();
    }
  })().catch((error) => {
    migrationPromise = null;
    throw error;
  });
  return migrationPromise;
};

export const readImportedTable = async (target: string): Promise<ImportedTable | null> => {
  await migrateLegacyImportData();
  const database = await openImportDatabase();
  try {
    const transaction = database.transaction(TABLES_STORE, 'readonly');
    const complete = transactionComplete(transaction);
    const value = await requestValue(transaction.objectStore(TABLES_STORE).get(target)) as (ImportedTable & { target: string }) | undefined;
    await complete;
    if (!value) return null;
    const { target: _target, ...table } = value;
    return table;
  } finally {
    database.close();
  }
};

export const readImportBackups = async (): Promise<ImportedTableBackup[]> => {
  await migrateLegacyImportData();
  const database = await openImportDatabase();
  try {
    const transaction = database.transaction(BACKUPS_STORE, 'readonly');
    const complete = transactionComplete(transaction);
    const backups = await requestValue(transaction.objectStore(BACKUPS_STORE).getAll()) as ImportedTableBackup[];
    await complete;
    return backups.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  } finally {
    database.close();
  }
};

export const getLatestImportBackup = async (target: string) =>
  (await readImportBackups()).find((backup) => backup.target === target) || null;

export const backupAndReplaceTable = async (
  target: string,
  targetLabel: string,
  incoming: ImportedTable,
  fallback: { headers: string[]; rows: string[][] },
): Promise<ImportedTableBackup> => {
  await migrateLegacyImportData();
  const database = await openImportDatabase();
  try {
    const readTransaction = database.transaction([TABLES_STORE, BACKUPS_STORE], 'readonly');
    const readComplete = transactionComplete(readTransaction);
    const currentRequest = readTransaction.objectStore(TABLES_STORE).get(target);
    const backupsRequest = readTransaction.objectStore(BACKUPS_STORE).getAll();
    const [storedCurrent, storedBackups] = await Promise.all([
      requestValue(currentRequest),
      requestValue(backupsRequest),
    ]);
    await readComplete;
    const current = storedCurrent as (ImportedTable & { target: string }) | undefined;
    const { target: _target, ...previousTable } = current || {
      ...fallback,
      sourceFile: 'Workspace başlangıç verisi',
      importedAt: new Date().toISOString(),
    } as ImportedTable & { target?: string };
    const backup: ImportedTableBackup = {
      id: `backup-${Date.now()}`,
      target,
      targetLabel,
      createdAt: new Date().toISOString(),
      previous: previousTable,
    };
    const existingBackups = (storedBackups as ImportedTableBackup[])
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    const retainedIds = new Set([backup.id, ...existingBackups.slice(0, 39).map((item) => item.id)]);
    const transaction = database.transaction([TABLES_STORE, BACKUPS_STORE], 'readwrite');
    const complete = transactionComplete(transaction);
    transaction.objectStore(TABLES_STORE).put({ ...incoming, target });
    transaction.objectStore(BACKUPS_STORE).put(backup);
    for (const oldBackup of existingBackups) {
      if (!retainedIds.has(oldBackup.id)) transaction.objectStore(BACKUPS_STORE).delete(oldBackup.id);
    }
    await complete;
    return backup;
  } finally {
    database.close();
  }
};

export const restoreImportBackup = async (backup: ImportedTableBackup) => {
  await migrateLegacyImportData();
  const database = await openImportDatabase();
  try {
    const transaction = database.transaction(TABLES_STORE, 'readwrite');
    const complete = transactionComplete(transaction);
    transaction.objectStore(TABLES_STORE).put({ ...backup.previous, target: backup.target });
    await complete;
  } finally {
    database.close();
  }
};

const parseDelimitedText = (text: string): string[][] => {
  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  const delimiter = (firstLine.match(/;/g)?.length || 0) > (firstLine.match(/,/g)?.length || 0) ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (inQuotes && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      row.push(value);
      value = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = '';
    } else {
      value += char;
    }
  }
  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
};

const columnIndexFromReference = (reference: string) => {
  const letters = reference.match(/^[A-Z]+/i)?.[0]?.toUpperCase() || 'A';
  let column = 0;
  for (const char of letters) column = column * 26 + char.charCodeAt(0) - 64;
  return column - 1;
};

const readZipEntry = async (archive: ArrayBuffer, entryName: string): Promise<Uint8Array> => {
  const view = new DataView(archive);
  const bytes = new Uint8Array(archive);
  const decoder = new TextDecoder();
  let endRecordOffset = -1;
  for (let offset = Math.max(0, bytes.length - 65_557); offset <= bytes.length - 22; offset += 1) {
    if (view.getUint32(offset, true) === 0x06054b50) endRecordOffset = offset;
  }
  if (endRecordOffset < 0) throw new Error('Excel dosyasının ZIP yapısı okunamadı.');

  const entryCount = view.getUint16(endRecordOffset + 10, true);
  const directoryOffset = view.getUint32(endRecordOffset + 16, true);
  let offset = directoryOffset;
  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) throw new Error('Excel dosyasının içindekiler listesi bozuk.');
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const fileNameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + fileNameLength));
    if (name === entryName) {
      const localNameLength = view.getUint16(localHeaderOffset + 26, true);
      const localExtraLength = view.getUint16(localHeaderOffset + 28, true);
      const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
      const compressed = bytes.subarray(dataStart, dataStart + compressedSize);
      if (method === 0) return compressed;
      if (method !== 8 || typeof DecompressionStream === 'undefined') {
        throw new Error('Bu tarayıcı sıkıştırılmış Excel içeriğini açamıyor. Dosyayı CSV olarak kaydedip yükleyin.');
      }
      const stream = new Blob([compressed.slice().buffer as ArrayBuffer]).stream()
        .pipeThrough(new DecompressionStream('deflate-raw' as CompressionFormat));
      return new Uint8Array(await new Response(stream).arrayBuffer());
    }
    offset += 46 + fileNameLength + extraLength + commentLength;
  }
  throw new Error(`Excel sayfası bulunamadı: ${entryName}`);
};

const parseXlsx = async (file: File): Promise<{ headers: string[]; rows: string[][] }> => {
  const archive = await file.arrayBuffer();
  const decoder = new TextDecoder();
  const sheetXml = decoder.decode(await readZipEntry(archive, 'xl/worksheets/sheet1.xml'));
  let sharedStrings: string[] = [];
  try {
    const sharedXml = decoder.decode(await readZipEntry(archive, 'xl/sharedStrings.xml'));
    const sharedDocument = new DOMParser().parseFromString(sharedXml, 'application/xml');
    sharedStrings = Array.from(sharedDocument.getElementsByTagName('si')).map((item) => item.textContent || '');
  } catch {
    sharedStrings = [];
  }

  const documentXml = new DOMParser().parseFromString(sheetXml, 'application/xml');
  const rowNodes = Array.from(documentXml.getElementsByTagName('row'));
  const rows = rowNodes.map((rowNode) => {
    const cells: string[] = [];
    for (const cell of Array.from(rowNode.getElementsByTagName('c'))) {
      const index = columnIndexFromReference(cell.getAttribute('r') || 'A1');
      const type = cell.getAttribute('t');
      const valueNode = cell.getElementsByTagName('v')[0];
      const inlineNode = cell.getElementsByTagName('is')[0];
      let value = valueNode?.textContent || inlineNode?.textContent || '';
      if (type === 's') value = sharedStrings[Number(value)] || '';
      if (type === 'b') value = value === '1' ? 'TRUE' : 'FALSE';
      cells[index] = value;
    }
    return cells.map((cell) => cell || '');
  }).filter((row) => row.some((cell) => cell.trim()));

  if (rows.length < 2) throw new Error('Excel dosyasında başlık satırı ve en az bir kayıt bulunmalıdır.');
  const width = Math.max(...rows.map((row) => row.length));
  return {
    headers: Array.from({ length: width }, (_, index) => rows[0][index]?.trim() || `Sütun ${index + 1}`),
    rows: rows.slice(1).map((row) => Array.from({ length: width }, (_, index) => row[index] || '')),
  };
};

export const parseSpreadsheetFile = async (file: File): Promise<{ headers: string[]; rows: string[][] }> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'csv') {
    const parsed = parseDelimitedText((await file.text()).replace(/^\uFEFF/, ''));
    if (parsed.length < 2) throw new Error('CSV dosyasında başlık satırı ve en az bir kayıt bulunmalıdır.');
    const width = Math.max(...parsed.map((row) => row.length));
    return {
      headers: Array.from({ length: width }, (_, index) => parsed[0][index]?.trim() || `Sütun ${index + 1}`),
      rows: parsed.slice(1).map((row) => Array.from({ length: width }, (_, index) => row[index] || '')),
    };
  }
  if (extension === 'xlsx') return parseXlsx(file);
  throw new Error('Desteklenen dosyalar .xlsx ve .csv uzantılıdır. Eski .xls dosyasını .xlsx veya .csv olarak kaydedin.');
};
