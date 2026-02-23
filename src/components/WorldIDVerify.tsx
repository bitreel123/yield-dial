import { useAuth } from "@/contexts/AuthContext";
import { Shield, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  IDKitRequestWidget,
  orbLegacy,
  type IDKitResult,
  type IDKitErrorCodes,
} from "@worldcoin/idkit";

const APP_ID = "app_135f61bfd908558b3c07fd6580d58192" as `app_${string}`;
const ACTION = "destaker-verify";

export const WorldIDVerify = () => {
  const { isVerified, verificationLevel, setVerified } = useAuth();
  const [verifying, setVerifying] = useState(false);
  const [rpContext, setRpContext] = useState<any>(null);
  const [widgetOpen, setWidgetOpen] = useState(false);

  const openWidget = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("worldid-rp-context");
      if (error) throw error;
      setRpContext(data.rp_context);
      setWidgetOpen(true);
    } catch (err: any) {
      console.error("Failed to get RP context:", err);
      toast.error("Failed to initialize World ID. Please try again.");
    }
  }, []);

  const handleSuccess = useCallback(
    async (result: IDKitResult) => {
      setWidgetOpen(false);
      setVerifying(true);
      try {
        const response = result.responses?.[0];
        if (!response) throw new Error("No response in IDKit result");

        let proof: string;
        let merkle_root: string;
        let nullifier_hash: string;
        let verification_level = "device";

        if ("merkle_root" in response) {
          const v3 = response as any;
          proof = v3.proof;
          merkle_root = v3.merkle_root;
          nullifier_hash = v3.nullifier;
          verification_level = v3.credential_type === "orb" ? "orb" : "device";
        } else {
          const v4 = response as any;
          proof = Array.isArray(v4.proof) ? v4.proof[0] : v4.proof;
          merkle_root = Array.isArray(v4.proof) ? v4.proof[4] : "";
          nullifier_hash = v4.nullifier;
        }

        const { data, error } = await supabase.functions.invoke("verify-worldid", {
          body: {
            proof,
            merkle_root,
            nullifier_hash,
            verification_level,
            action: ACTION,
            signal: "",
          },
        });

        if (error) throw new Error(error.message || "Verification request failed");

        if (data?.verified) {
          setVerified({
            level: verification_level === "orb" ? "orb" : "device",
            nullifierHash: nullifier_hash,
          });
          toast.success("World ID verification successful!");
        } else {
          toast.error(`Verification failed: ${data?.detail || data?.error || "Unknown error"}`);
        }
      } catch (err: any) {
        console.error("Cloud verification error:", err);
        toast.error(err.message || "Verification failed");
      } finally {
        setVerifying(false);
      }
    },
    [setVerified]
  );

  const handleError = useCallback((errorCode: IDKitErrorCodes) => {
    console.error("World ID error:", errorCode);
    toast.error("World ID verification was cancelled or failed.");
    setWidgetOpen(false);
  }, []);

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
        onClick={openWidget}
        disabled={verifying}
        variant="outline"
        className="w-full gap-2 border-primary/30 bg-primary/5 text-foreground hover:bg-primary/10"
      >
        {verifying ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          <Shield className="h-4 w-4 text-primary" />
        )}
        {verifying ? "Verifying..." : "Verify with World ID"}
      </Button>

      {rpContext && (
        <IDKitRequestWidget
          app_id={APP_ID}
          action={ACTION}
          rp_context={rpContext}
          allow_legacy_proofs={true}
          preset={orbLegacy()}
          open={widgetOpen}
          onOpenChange={setWidgetOpen}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}
    </>
  );
};
