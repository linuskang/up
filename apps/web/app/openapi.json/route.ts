import { NextResponse } from "next/server"
import { openApiSpec } from "./openapi-spec"

export async function GET() {
  return NextResponse.json(openApiSpec)
}
