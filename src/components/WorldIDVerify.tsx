import { useIDKitRequest, IDKitRequestWidget, orbLegacy } from "@worldcoin/idkit";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import type { IDKitResult } from "@worldcoin/idkit";

const APP_ID = "app_135f61bfd908558b3c07fd6580d58192" as const;
const ACTION = "destaker-verify";

// Generate a demo rp_context for staging — in production this comes from your backend
const generateRpContext = () => ({
  rp_id: "rp_staging_demo",
  nonce: crypto.randomUUID(),
  created_at: Math.floor(Date.now() / 1000),
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  signature: "demo_signature_staging",
});

export const WorldIDVerify = () => {
  const { isVerified, verificationLevel, setVerified } = useAuth();
  const [widgetOpen, setWidgetOpen] = useState(false);

  const handleSuccess = useCallback(
    (result: IDKitResult) => {
      // Extract nullifier from the first response
      const firstResponse = result.responses?.[0];
      const nullifier = firstResponse && "nullifier" in firstResponse
        ? firstResponse.nullifier
        : crypto.randomUUID();

      setVerified({
        level: "device",
        nullifierHash: nullifier,
      });
    },
    [setVerified]
  );

  const requestConfig = {
    app_id: APP_ID,
    action: ACTION,
    rp_context: generateRpContext(),
    allow_legacy_proofs: true,
    preset: orbLegacy(),
    environment: "staging" as const,
  };

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-semibold text-foreground">Verified Human</p>
          <p className="text-[10px] text-muted-foreground">
            World ID · {verificationLevel === "orb" ? "Orb" : "Device"} verified
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={() => setWidgetOpen(true)}
        variant="outline"
        className="w-full gap-2 border-primary/30 bg-primary/5 text-foreground hover:bg-primary/10"
      >
        <Shield className="h-4 w-4 text-primary" />
        Verify with World ID
      </Button>

      <IDKitRequestWidget
        {...requestConfig}
        open={widgetOpen}
        onOpenChange={setWidgetOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
};
