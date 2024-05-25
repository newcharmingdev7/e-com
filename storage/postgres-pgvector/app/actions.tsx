'use server'

import prisma from '@/lib/prisma'
import { openai } from '@/lib/openai'
import { type Pokemon } from '@prisma/client'
import { embed } from 'ai'

export async function searchPokedex(
  query: string
): Promise<Array<Pokemon & { similarity: number }>> {
  try {
    if (query.trim().length === 0) return []

    const embedding = await generateEmbedding(query)
    const vectorQuery = `[${embedding.join(',')}]`
    const pokemon = await prisma.$queryRaw`
      SELECT
        id,
        "name",
        1 - (embedding <=> ${vectorQuery}::vector) as similarity
      FROM pokemon
      where 1 - (embedding <=> ${vectorQuery}::vector) > .5
      ORDER BY  similarity DESC
      LIMIT 8;
    `

    return pokemon as Array<Pokemon & { similarity: number }>
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function generateEmbedding(raw: string) {
  // OpenAI recommends replacing newlines with spaces for best results
  const input = raw.replace(/\n/g, ' ')
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-ada-002'),
    value: input,
  })
  return embedding
}
