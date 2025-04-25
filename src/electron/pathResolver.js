import path from "path";
import {app} from 'electron';
import {isDev} from "./utils.js";

// Resolves path depending on if in development mode or not
export function getPrelodePath () {
  return path.join(
    app.getAppPath(),
    isDev() ? '.' : '..',
    'dist-electron/preload.cjs'
  )
}