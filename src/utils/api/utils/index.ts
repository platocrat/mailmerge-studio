// src/utils/api/utils/index.ts
// Externals
import { NextResponse } from 'next/server'
// Locals
import { getConsoleMetadata } from '@/utils/misc'


export const JSON_HEADER = { 
  'Content-Type': 'application/json' 
}


/**
 * @dev Function to return a JSON response with a console metadata.
 * @param {any} data - The data to return in the response.
 * @param {number} status - The status code to return in the response.
 * @param {Object} consoleMetadataArgs - The arguments to pass to the console metadata function.
 * @param {string} dataName - The name of the data to log.
 * @param {string} errorMessage - The error message to log.
 * @param {any} error - The error to log.
 */
export function jsonResponse(
  data: any,
  status = 200,
  consoleMetadataArgs: {
    logType: 'CLIENT' | 'SERVER' | 'API_CALL',
    isLog: boolean,
    filePath: string,
    functionName: string,
  },
  dataName?: string,
  errorMessage?: string,
  error?: any,
) {
  const consoleMetadata = getConsoleMetadata(
    consoleMetadataArgs.logType,
    consoleMetadataArgs.isLog,
    consoleMetadataArgs.filePath,
    consoleMetadataArgs.functionName,
  )

  if (consoleMetadataArgs.isLog) {
    console.log(`${ consoleMetadata } ${ dataName }: `, data)
  } else {
    console.error(`${ consoleMetadata } ${ errorMessage }: `, error)
  }

  return NextResponse.json(data, { status, headers: JSON_HEADER })
}\nexport * from './fetchJson';
