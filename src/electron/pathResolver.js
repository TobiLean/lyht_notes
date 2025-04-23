import path from "path";
import {app} from 'electron';
import {isDev} from "./utils.js";
import * as electron from "electron";

export function getPrelodePath () {
  return path.join(
    app.getAppPath(),
    isDev() ? '.' : '..',
    'dist-electron/preload.cjs'
  )
}