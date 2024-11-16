import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  
  const authToken = cookieStore.get("auth_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // Cookie store doesn't natively expose expiration; this needs to be managed separately
  return NextResponse.json({
    hasAuthToken: !!authToken,
    hasRefreshToken: !!refreshToken,
  });
}
