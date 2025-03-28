import { embed, embedMany } from 'ai';
import {openai} from '@ai-sdk/openai';
import { db } from '../db';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';
import { embeddings } from '../db/schema/embeddings';

// first we select the embedding model from openai

const embeddingModel = openai.embedding('text-embedding-ada-002');

// create a functionthat generates chunks, takes an input string and chunks based on trim and split
const generateChunks = (input:string): string[] => {
    return input
    .trim()
    .split('.')
    .filter(i=>i !== '');
};
//create a function that generates embeddings, it creates chunks and then calles the embed many func from the lib
//returns embeddings and chunks 

/* This function will take in the source material (value) as an input and return a promise of an array of objects,
each containing an embedding and content.
Within the function, you first generate chunks for the input.
Then, you pass those chunks to the embedMany function imported from the AI SDK which will return embeddings of the chunks you passed in. 
Finally, you map over and return the embeddings in a format that is ready to save in the database. */

export const generateEmbeddings = async(
    value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
    const chunks = generateChunks(value);
    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: chunks,
    });
    return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
  };

  export const generateEmbedding = async (value: string): Promise<number[]> => {
    const input = value.replaceAll('\\n', ' ');
    const { embedding } = await embed({
      model: embeddingModel,
      value: input,
    });
    return embedding;
  };
  
  export const findRelevantContent = async (userQuery: string) => {
    const userQueryEmbedded = await generateEmbedding(userQuery);
    const similarity = sql<number>`1 - (${cosineDistance(
      embeddings.embedding,
      userQueryEmbedded,
    )})`;
    const similarGuides = await db
      .select({ name: embeddings.content, similarity })
      .from(embeddings)
      .where(gt(similarity, 0.5))
      .orderBy(t => desc(t.similarity))
      .limit(4);
    return similarGuides;
  };


  /*


  In this code, you add two functions:

generateEmbedding: generate a single embedding from an input string
findRelevantContent: embeds the user’s query, searches the database for similar items, then returns relevant items

*/


