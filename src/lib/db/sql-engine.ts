import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

let sqlJsPromise: Promise<SqlJsStatic> | null = null

export async function getSqlJs() {
  if (!sqlJsPromise) {
    sqlJsPromise = initSqlJs({
      locateFile: () => wasmUrl,
    })
  }

  return sqlJsPromise
}

export async function readFileAsUint8Array(file: File) {
  const buffer = await file.arrayBuffer()
  return new Uint8Array(buffer)
}

export async function openSqliteDatabase(file: File): Promise<Database> {
  const SQL = await getSqlJs()
  const bytes = await readFileAsUint8Array(file)
  return new SQL.Database(bytes)
}
