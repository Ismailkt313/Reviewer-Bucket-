import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = request.headers.get("x-revalidate-secret") || searchParams.get("secret");
    const tag = searchParams.get("tag");

    // 1. Security Check
    if (!secret || secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // 2. Param Check
    if (!tag) {
      return NextResponse.json({ success: false, message: "Missing tag parameter" }, { status: 400 });
    }

    // 3. Purge Cache
    revalidateTag(tag, "default");
    
    return NextResponse.json({ success: true, revalidated: true, tag, now: Date.now() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
