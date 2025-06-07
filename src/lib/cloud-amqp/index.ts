// src/lib/cloud-amqp/index.ts
// Externals
import amqp, { Channel } from 'amqplib'

const CLOUD_AMQP_URL = process.env.CLOUD_AMQP_URL ?? ''
const QUEUE = `email_processing_queue`

let channel: Channel | null = null

/**
 * @dev Get the channel for the RabbitMQ connection.
 * @returns The channel for the RabbitMQ connection.
 */
export async function getChannel(): Promise<Channel> {
  if (channel) return channel

  const conn = await amqp.connect(CLOUD_AMQP_URL)
  channel = await conn.createChannel()

  await channel.assertQueue(QUEUE, { durable: true })

  return channel
}

/**
 * 
 * @dev Publish an email to the RabbitMQ queue.
 * @param data The email data to publish.
 */
export async function publishEmail(data: unknown): Promise<void> {
  const ch = await getChannel()

  ch.sendToQueue(
    QUEUE, 
    Buffer.from(JSON.stringify(data)), 
    { persistent: true }
  )
}
