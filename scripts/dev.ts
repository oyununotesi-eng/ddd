import { spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const tsxCli = path.join(root, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const children: ChildProcess[] = [];
let stopping = false;

const stop = (exitCode = 0) => {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = exitCode;
};

const start = (name: string, command: string, args: string[]) => {
  const child = spawn(command, args, { cwd: root, stdio: 'inherit' });
  children.push(child);
  child.once('error', (error) => {
    console.error(`${name} failed to start:`, error.message);
    stop(1);
  });
  child.once('exit', (code) => {
    if (!stopping) {
      console.log(`${name} stopped.`);
      stop(code || 0);
    }
  });
};

process.on('SIGINT', () => stop(130));
process.on('SIGTERM', () => stop(143));

start('Workspace API', process.execPath, [tsxCli, 'server/index.ts']);
start('Vite', process.execPath, [viteCli, '--port=3000', '--host=0.0.0.0']);
