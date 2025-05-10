import type { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { CLERK_WEBHOOK_SIGNING_SECRET } from '@/lib/config';
import { saveUserToDB } from '@/lib/db';

// This is needed for the bodyParser to be disabled
export const config = {
  api: { bodyParser: false },
};

// POST /api/webhooks
export async function POST(req: Request) {
  // Verificar y obtener los datos del webhook
  const WEBHOOK_SECRET = CLERK_WEBHOOK_SIGNING_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
    return new NextResponse('Error occured -- no webhook secret', { status: 500 });
  }
  
  // Get the headers
  const headersList = req.headers;
  const svix_id = headersList.get('svix-id');
  const svix_timestamp = headersList.get('svix-timestamp');
  const svix_signature = headersList.get('svix-signature');
  
  // If there are no Svix headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error occured -- no svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new NextResponse('Error occured', { status: 400 });
  }

  // Get the type and data
  const eventType = evt.type;
  
  console.log(`Webhook with type ${eventType}`);

  // Handle event
  if (eventType === 'user.created') {
    const { id, first_name, email_addresses } = evt.data;
    const email = email_addresses?.[0]?.email_address || "";

    // Guardar el usuario en la BD
    await saveUserToDB({ 
      id, 
      name: first_name || undefined, 
      email: email || undefined 
    });
    
    console.log(`User created with ID: ${id}, name: ${first_name}, email: ${email}`);
  }

  return NextResponse.json({ success: true });
}

