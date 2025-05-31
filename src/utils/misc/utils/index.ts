import { 
  rng,
  LOG_INDEX_RANGE,
} from '@/utils'




export function deleteAllCookies() {
  const cookies = document.cookie.split(';')

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i]
    const eqPos = cookie.indexOf('=')
    const name = eqPos > -1 ? cookie.slice(0, eqPos) : cookie
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }
}



/**
 * @dev Function to get the current UTC timestamp in nanoseconds
 * @returns
 */
export function nowInNs(): bigint {
  const timeOrigin = BigInt(Math.round(performance.timeOrigin * 1_000_000))
  const now = BigInt(Math.round(performance.now() * 1_000_000))
  return timeOrigin + now
}


/**
 * @dev Function to get the console metadata for logging.
 * @param {string} logType - The type of log.
 * @param {boolean} isLog - Whether the log is a log or an error.
 * @param {string} filePath - The file path of the log.
 * @param {string} functionName - The name of the function that logged the message.
 */
export function getConsoleMetadata(
  logType: 'CLIENT' | 'SERVER' | 'API CALL',
  isLog: boolean,
  filePath: string,
  functionName: string,
): string {
  const rn = rng(LOG_INDEX_RANGE)
  const currentTime = nowInNs()

  return `[${
    logType
  } ${
    isLog ? 'LOG' : 'ERROR'
  }: ${ 
    rn
  } --logTimestamp="${
    currentTime
  }" --file-path="${ 
    filePath 
  } --function-name="${ 
    functionName 
  }"]: `
}