import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
