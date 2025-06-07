// src/workers/emailProcessor.ts
// Externals
import amqp, { ConsumeMessage } from 'amqplib'
// Locals
import { dataProcessingService } from '@/services/data/processing-service'
import { getConsoleMetadata } from '@/utils'


const LOG_TYPE = 'SERVER'
const FILE_NAME = 'src/workers/emailProcessor.ts'


const CLOUD_AMQP_URL = process.env.CLOUD_AMQP_URL ?? ''
const QUEUE = `mailmerge-studio-email-processing-queue`


/**
 * @dev Start the email processor.
 * @returns {Promise<void>}
 */
async function start() {
  const conn = await amqp.connect(CLOUD_AMQP_URL)
  const ch = await conn.createChannel()

  await ch.assertQueue(QUEUE, { durable: true })
  ch.prefetch(3)          // process 3 jobs in parallel

  ch.consume(QUEUE, async (msg: ConsumeMessage | null) => {
    if (!msg) return

    try {
      const data = JSON.parse(msg.content.toString())
      await dataProcessingService.processInboundEmailData(data)
      ch.ack(msg)         // job done
    } catch (error) {
      const consoleMetadata = getConsoleMetadata(
        LOG_TYPE, 
        false, 
        FILE_NAME, 
        'start()'
      )
      console.error(`${ consoleMetadata } Processing failed: `, error)
      
      // dead‑letter after 5 tries, else requeue for retry
      const tries = msg.properties.headers?.[`x‑tries`] ?? 0

      if (tries >= 4) {
        ch.nack(msg, false, false)       // drop / DLQ
      } else {
        msg.properties.headers = { 
          ...msg.properties.headers, 
          [`x‑tries`]: tries + 1 
        }

        ch.nack(msg, false, true)                      // requeue
      }
    }
  })
}

start().catch(console.error)
