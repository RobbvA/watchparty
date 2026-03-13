import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ episodeSessionId: string }> },
) {
  const { episodeSessionId } = await params;

  const posts = await prisma.post.findMany({
    where: { episodeSessionId },
    orderBy: { timestampSec: "asc" },
  });

  return NextResponse.json(posts);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ episodeSessionId: string }> },
) {
  const { episodeSessionId } = await params;
  const body = await request.json();

  const post = await prisma.post.create({
    data: {
      partyId: body.partyId,
      episodeSessionId,
      username: body.username,
      body: body.body,
      timestampSec: body.timestampSec,
    },
  });

  return NextResponse.json(post);
}
