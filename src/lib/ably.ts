'use server'

import Ably from 'ably'

const ably = new Ably.Rest(process.env.ABLY_API_KEY!)

export async function publishMessageToChannel(channelName: string, body: any) {
  const channel = ably.channels.get(channelName)
  const resp = await channel.publish(body, { quickAck: true })
  return resp
}
