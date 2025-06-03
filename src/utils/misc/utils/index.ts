import { 
  rng,
  LOG_INDEX_RANGE,
} from '@/utils'



export const imgPaths = () => {
  const basePath = `/icons`
  return {
    svg: `${basePath}/svg/`,
    png: `${basePath}/png/`,
  }
}



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
  logType: 'CLIENT' | 'SERVER' | 'API_CALL',
  isLog: boolean,
  filePath: string,
  functionName: string,
): string {
  const currentTime = nowInNs()

  return `[${
    logType
  } ${
    isLog ? 'LOG' : 'ERROR'
  }: --logTimestamp="${
    currentTime
  }" --file-path="${ 
    filePath 
  } --function-name="${ 
    functionName 
  }"]: `
}


export function debounce(fn: any, delay: number): ((...args: any) => void) {
  let timer: any = null

  return (...args: any) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}