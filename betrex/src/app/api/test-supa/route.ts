import { createClient } from "@/utils/supabase/client";

export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase.from("pg_catalog.pg_tables").select("tablename").limit(1);

  return Response.json({ ok: !error, error, data });
}
