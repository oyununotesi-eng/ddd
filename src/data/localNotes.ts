import { OneNotePage } from './knowledge';

interface LocalNoteFile {
  name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<{
    write(contents: string): Promise<void>;
    close(): Promise<void>;
  }>;
}

interface LocalNotesDirectory {
  name: string;
  values(): AsyncIterable<LocalNoteFile>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<LocalNoteFile>;
  requestPermission?(options: { mode: 'readwrite' }): Promise<PermissionState>;
  queryPermission?(options: { mode: 'readwrite' }): Promise<PermissionState>;
}

interface DirectoryPickerWindow extends Window {
  showDirectoryPicker?: (options?: { mode?: 'read' | 'readwrite' }) => Promise<LocalNotesDirectory>;
}

let connectedDirectory: LocalNotesDirectory | null = null;
const DIRECTORY_DB_NAME = 'murat-workspace-local-folders';

const openDirectoryDb = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(DIRECTORY_DB_NAME, 1);
  request.onupgradeneeded = () => request.result.createObjectStore('handles');
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const saveDirectoryHandle = async (directory: LocalNotesDirectory) => {
  const db = await openDirectoryDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction('handles', 'readwrite');
    transaction.objectStore('handles').put(directory, 'onenote-directory');
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
};

const getConnectedDirectory = async (): Promise<LocalNotesDirectory | null> => {
  if (connectedDirectory) return connectedDirectory;
  if (typeof indexedDB === 'undefined') return null;
  const db = await openDirectoryDb();
  const directory = await new Promise<LocalNotesDirectory | null>((resolve, reject) => {
    const request = db.transaction('handles', 'readonly').objectStore('handles').get('onenote-directory');
    request.onsuccess = () => resolve((request.result as LocalNotesDirectory | undefined) || null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  if (!directory) return null;
  const permission = await directory.queryPermission?.({ mode: 'readwrite' });
  if (permission && permission !== 'granted') return null;
  connectedDirectory = directory;
  return directory;
};

export const connectLocalNotesFolder = async (): Promise<string> => {
  const pickerWindow = window as DirectoryPickerWindow;
  if (!pickerWindow.showDirectoryPicker) {
    throw new Error('Bu tarayıcı yerel klasör bağlantısını desteklemiyor.');
  }

  const directory = await pickerWindow.showDirectoryPicker({ mode: 'readwrite' });
  const permission = await directory.requestPermission?.({ mode: 'readwrite' });
  if (permission === 'denied') throw new Error('Klasör için okuma/yazma izni verilmedi.');
  connectedDirectory = directory;
  if (typeof indexedDB !== 'undefined') await saveDirectoryHandle(directory);
  return directory.name;
};

export const readConnectedLocalNotes = async (): Promise<OneNotePage[]> => {
  const directory = await getConnectedDirectory();
  if (!directory) return [];

  const pages: OneNotePage[] = [];
  for await (const entry of directory.values()) {
    if (!/\.(md|markdown|txt|html?)$/i.test(entry.name)) continue;
    const file = await entry.getFile();
    const content = await file.text();
    const title = entry.name.replace(/\.(md|markdown|txt|html?)$/i, '');
    pages.push({
      id: `local:${entry.name}`,
      section: 'LOCAL FILES',
      title,
      content,
      updatedAt: file.lastModified ? new Date(file.lastModified).toISOString().slice(0, 10) : '',
      sourceFile: entry.name,
    });
  }
  return pages.sort((a, b) => a.title.localeCompare(b.title));
};

export const writeConnectedLocalNote = async (fileName: string, content: string) => {
  const directory = await getConnectedDirectory();
  if (!directory) throw new Error('Düzenleme için yerel klasör bağlantısı yok. Klasör iznini yeniden verin.');
  const handle = await directory.getFileHandle(fileName, { create: true });
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
};

export const createConnectedLocalNote = async (title: string, content: string) => {
  const directory = await getConnectedDirectory();
  if (!directory) throw new Error('Yeni sayfa için yerel klasör bağlantısı yok. Klasör iznini yeniden verin.');
  const safeTitle = title.trim().replace(/[<>:"/\\|?*]/g, '-');
  const fileName = `${safeTitle || 'Yeni Sayfa'}.md`;
  await writeConnectedLocalNote(fileName, content);
  return fileName;
};
