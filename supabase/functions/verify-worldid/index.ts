const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const APP_ID = "app_135f61bfd908558b3c07fd6580d58192";

/**
 * Cloud verification endpoint for World ID proofs.
 * Calls the World ID Developer Portal API to verify proofs server-side.
 * See: https://docs.world.org/world-id/id/cloud
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { proof, merkle_root, nullifier_hash, verification_level, action, signal } =
      await req.json();

    if (!proof || !merkle_root || !nullifier_hash) {
      return new Response(
        JSON.stringify({ error: "Missing required proof fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call World ID cloud verification API
    const verifyUrl = `https://developer.worldcoin.org/api/v2/verify/${APP_ID}`;

    console.log(`Verifying World ID proof (${verification_level}) via cloud API...`);

    const verifyRes = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merkle_root,
        nullifier_hash,
        proof,
        verification_level: verification_level || "device",
        action: action || "destaker-verify",
        signal: signal || "",
      }),
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok) {
      console.error("World ID verification failed:", verifyData);
      return new Response(
        JSON.stringify({
          verified: false,
          error: verifyData.code || "verification_failed",
          detail: verifyData.detail || "Proof verification failed",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("World ID verification successful:", verifyData);

    return new Response(
      JSON.stringify({
        verified: true,
        nullifier_hash,
        verification_level: verification_level || "device",
        action: action || "destaker-verify",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return new Response(
      JSON.stringify({
        verified: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
