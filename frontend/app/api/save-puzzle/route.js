import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, qnaList, placedWords, grid } = body;

    // Validate required fields
    if (!title || !qnaList || !placedWords || !grid) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Generate a unique ID for this puzzle
    const puzzleId = uuidv4();

    // Define the output path: /public/puzzles/{id}.json
    const filePath = path.join(process.cwd(), 'public', 'puzzles', `${puzzleId}.json`);

    // Write puzzle data to JSON file
    const data = JSON.stringify({ title, qnaList, placedWords, grid }, null, 2);
    await writeFile(filePath, data);

    // Return puzzle ID so frontend can redirect to /solve/[puzzleId]
    return NextResponse.json({ puzzleId }, { status: 200 });
  } catch (error) {
    console.error("❌ Error saving puzzle:", error);
    return NextResponse.json({ error: 'Failed to save puzzle' }, { status: 500 });
  }
}
