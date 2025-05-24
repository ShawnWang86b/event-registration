// app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = (await headerPayload).get("svix-id");
  const svix_timestamp = (await headerPayload).get("svix-timestamp");
  const svix_signature = (await headerPayload).get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.text();
  // const body = JSON.parse(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === "user.created") {
    try {
      const userData = {
        name:
          `${evt.data.first_name || ""} ${evt.data.last_name || ""}`.trim() ||
          "Anonymous",
        email: evt.data.email_addresses?.[0]?.email_address || "",
        avatarUrl: evt.data.image_url || null,
        updatedAt: new Date(),
      };

      console.log("Preparing to insert/update user with data:", userData);

      if (eventType === "user.created") {
        // Create new user
        await db.insert(usersTable).values({
          id: id!,
          ...userData,
          role: "user",
          creditBalance: 0,
          createdAt: new Date(),
        });

        console.log(`User ${id} created successfully`);
      } else {
        // Update existing user
        await db.update(usersTable).set(userData).where(eq(usersTable.id, id!));

        console.log(`User ${id} updated successfully`);
      }
    } catch (error) {
      console.error("Error handling user webhook:", error);
      return new Response("Error processing webhook", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    try {
      await db.delete(usersTable).where(eq(usersTable.id, id!));
      console.log(`User ${id} deleted`);
    } catch (error) {
      console.error("Error deleting user:", error);
      return new Response("Error processing webhook", { status: 500 });
    }
  }

  return new Response("", { status: 200 });
}
