import type { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { CLERK_WEBHOOK_SIGNING_SECRET } from '@/lib/config'; // Usar el config desde lib
import { saveUserToDB } from '@/lib/db';

// This is needed to disable bodyParser
export const config = {
  api: { bodyParser: false },
};

// POST /api/webhooks
export async function POST(req: Request) {  // Get the webhook signing secret from environment variables
  const WEBHOOK_SECRET = CLERK_WEBHOOK_SIGNING_SECRET;
  
  console.log('Webhook recibido. Secret disponible:', !!WEBHOOK_SECRET);
  
  if (!WEBHOOK_SECRET) {
    console.error('Error: CLERK_WEBHOOK_SIGNING_SECRET no está definido en .env o .env.local');
    return new NextResponse('Error occurred -- no webhook secret', { status: 500 });
  }
  
  // Get the headers
  const headersList = req.headers;
  const svix_id = headersList.get('svix-id');
  const svix_timestamp = headersList.get('svix-timestamp');
  const svix_signature = headersList.get('svix-signature');
  
  // If there are no Svix headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers:', { svix_id, svix_timestamp, svix_signature });
    return new NextResponse('Error occurred -- no svix headers', { status: 400 });
  }

  // Get the body
  let payload;
  try {
    payload = await req.json();
    console.log('Received webhook payload:', JSON.stringify(payload));
  } catch (err) {
    console.error('Error parsing request body:', err);
    return new NextResponse('Error occurred parsing body', { status: 400 });
  }
  
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
    return new NextResponse('Error verifying webhook', { status: 400 });
  }

  // Get the event type
  const eventType = evt.type;
  console.log(`Received webhook with type ${eventType}`);
  // Handle different event types
  if (eventType === 'user.created') {
    const { id, first_name, last_name, email_addresses } = evt.data;
    const email = email_addresses?.[0]?.email_address || "";
    
    // Guardar usuario directamente en la base de datos usando la función saveUserToDB
    try {
      console.log(`Guardando usuario: ID=${id}, nombre=${first_name}, email=${email}`);
      
      // Usar la función saveUserToDB que conecta directamente con la base de datos
      const result = await saveUserToDB({ 
        id, // El clerk_id
        name: first_name || '', 
        email 
      });
      
      if (result) {
        console.log(`Usuario guardado exitosamente en la base de datos: ${id}`);
      } else {
        console.error('Error al guardar usuario en la base de datos');
      }
    } catch (error) {
      console.error('Error al guardar usuario en la base de datos:', error);
      // No queremos que falle la llamada webhook aunque falle el guardado en BD
      // Solo registramos el error pero devolvemos éxito a Clerk
    }
  } else if (eventType === 'user.updated') {
    // Handle user update events
    // Similar to user.created but with PUT request
  } else if (eventType === 'user.deleted') {
    // Handle user deletion
  }

  // Return a success response to acknowledge the webhook
  return NextResponse.json({ success: true });
}