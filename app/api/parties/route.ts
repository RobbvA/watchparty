import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();

  const party = await prisma.party.create({
    data: {
      name: body.name,
      showTitle: body.showTitle,
      hostUsername: body.hostUsername,
      watchLink: body.watchLink || null,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      currentEpisodeNumber: 1,
    },
  });

  return NextResponse.json(party);
}
