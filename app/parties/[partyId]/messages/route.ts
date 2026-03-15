import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ partyId: string }> },
) {
  const { partyId } = await params;

  const messages = await prisma.partyMessage.findMany({
    where: { partyId },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return NextResponse.json(messages);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ partyId: string }> },
) {
  const { partyId } = await params;
  const body = await request.json();

  const message = await prisma.partyMessage.create({
    data: {
      partyId,
      username: body.username,
      body: body.body,
    },
  });

  return NextResponse.json(message);
}
