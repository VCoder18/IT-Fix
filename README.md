
  # IT Support Ticket Form

  This is a code bundle for IT Support Ticket Form. The original project is available at https://www.figma.com/design/0XFYIosJQ7is5EkG7CMkY7/IT-Support-Ticket-Form.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

Run `npm run build` to create a production build.

Run `npm run start` to run the production server.

## Google OAuth (Supabase)

1. In Supabase Auth provider settings, enable Google.
2. Add this redirect URL in Supabase:
   `http://localhost:3000/api/auth/callback`
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your `.env`.

Role routing is handled in `/api/auth/callback`:
- emails in `lib/auth/roles.ts` are tagged as `technician`
- all other emails are tagged as `employee`
  
