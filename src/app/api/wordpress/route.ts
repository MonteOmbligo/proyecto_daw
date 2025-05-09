import { NextResponse } from "next/server";

// GET /api/wordpress
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "API de WordPress funcionando correctamente"
  });
}
