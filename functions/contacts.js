export async function onRequestPost({ request }) {
  const data = await request.json();

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { "Content-Type": "application/json" } }
  );
}
