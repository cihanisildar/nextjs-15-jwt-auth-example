import { DecodedAuthToken, DecodedRefreshToken, User } from "@/types/auth";
import { jwtVerify, SignJWT } from "jose";

const AUTH_SECRET = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET || "your-auth-secret-key"
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret-key"
);

export const generateTokens = async (user: User) => {
  const auth_token = await new SignJWT({
    id: user.id,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m") // Short-lived
    .sign(AUTH_SECRET);

  const refresh_token = await new SignJWT({
    id: user.id,
    version: user.tokenVersion,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Long-lived
    .sign(REFRESH_SECRET);

  return { auth_token, refresh_token };
};

export const verifyAuthToken = async (
  token: string
): Promise<DecodedAuthToken | null> => {
  try {
    const { payload } = await jwtVerify(token, AUTH_SECRET);

    // Cast payload to unknown first, then validate and assert as DecodedAuthToken
    const decoded = payload as unknown as DecodedAuthToken;

    // Validate the required properties
    if (typeof decoded.id !== "string") {
      throw new Error("Invalid token payload: 'id' is missing or not a string");
    }

    return decoded;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
};

export const verifyRefreshToken = async (
  token: string
): Promise<DecodedRefreshToken | null> => {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);

    return {
      id: payload.id as string, // Cast id to string
      version: payload.version as number, // Cast version to number
    } as DecodedRefreshToken;
  } catch (error) {
    console.error("Error verifying refresh token:", error);
    return null;
  }
};
