import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ episodeSessionId: string }> },
) {
  const { episodeSessionId } = await params;
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) return NextResponse.json(null);

  const progress = await prisma.userProgress.findFirst({
    where: { episodeSessionId, username },
  });

  return NextResponse.json(progress);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ episodeSessionId: string }> },
) {
  const { episodeSessionId } = await params;
  const body = await request.json();

  const existing = await prisma.userProgress.findFirst({
    where: {
      episodeSessionId,
      username: body.username,
    },
  });

  let progress;
  if (existing) {
    progress = await prisma.userProgress.update({
      where: { id: existing.id },
      data: { progressSec: body.progressSec },
    });
  } else {
    progress = await prisma.userProgress.create({
      data: {
        partyId: body.partyId,
        episodeSessionId,
        username: body.username,
        progressSec: body.progressSec,
      },
    });
  }

  return NextResponse.json(progress);
}
