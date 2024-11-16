// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  if (!authToken) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const decoded = await verifyAuthToken(authToken);

  if (!decoded || typeof decoded.id !== "string") {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    return NextResponse.json({ user: null }, { status: 404 });
  }

  return NextResponse.json({ user });
}
