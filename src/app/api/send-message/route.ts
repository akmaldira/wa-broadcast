import { createBroadcastSchema } from "@/app/(authenticated)/app/broadcast/create/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, error } = createBroadcastSchema.safeParse(body);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const response = await fetch(
          process.env.BASE_URL + "/api2/whatsapp/send-message",
          {
            method: "POST",
            headers: {
              "x-private-api": process.env.PRIVATE_API_KEY || "",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );
        if (!response.ok) {
          const data = await response.json();
          controller.error(new Error(data.error));
          return;
        }
        const reader = response.body?.getReader();
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const responseStream = new TextDecoder().decode(value);
            controller.enqueue(encoder.encode(responseStream));
          }
        }
      },
    });

    return new NextResponse(stream);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
