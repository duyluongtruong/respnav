
import * as fs from 'fs';
import * as path from 'path';
import { Repos } from '../types';

interface Options {
  ignoreCache?: boolean;
}

export function getDirectSubfolders(folderPath: string, options: Options = {}): Repos[] {
  const dirs: Repos[] = [];

  try {
    const nodes = fs.readdirSync(folderPath);

    if (nodes) {
      nodes.forEach((node: string) => {
        const childFolderPath = path.join(folderPath, node);
        const isDir = fs.statSync(childFolderPath).isDirectory();

        if (isDir) {
          const hasPOMFile = isFileExists(path.join(childFolderPath, 'pom.xml'));

          dirs.push({
            path: childFolderPath,
            name: node,
            repoIcon: hasPOMFile ? 'java.png' : 'folder.png'
          });
        }
      });
    }
  } catch (error) {
    console.error('Can not read folder: ', folderPath, '. Detail error: ', error);
  }

  return dirs;
}

/**
 * Check a file is exist or not
 */
export function isFileExists(filePath: string): boolean {
  try {
    fs.accessSync(filePath);
    return true;
  } catch (e) {
    return false;
  }
}
