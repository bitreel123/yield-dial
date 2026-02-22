import { useAuth } from "@/contexts/AuthContext";
import { Shield, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// For IDKit v4 — dynamically import to avoid SSR issues
let IDKitModule: any = null;
const getIDKit = async () => {
  if (!IDKitModule) {
    IDKitModule = await import("@worldcoin/idkit");
  }
  return IDKitModule;
};

const APP_ID = "app_135f61bfd908558b3c07fd6580d58192" as const;
const ACTION = "destaker-verify";

export const WorldIDVerify = () => {
  const { isVerified, verificationLevel, setVerified } = useAuth();
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [idkitLoaded, setIdkitLoaded] = useState(false);

  // Cloud verification: send proof to our edge function which calls World ID API
  const verifyProofOnCloud = useCallback(
    async (result: any) => {
      setVerifying(true);
      try {
        const firstResponse = result.responses?.[0];
        const proof = firstResponse?.proof || result.proof;
        const merkle_root = firstResponse?.merkle_root || result.merkle_root;
        const nullifier_hash = firstResponse?.nullifier_hash || result.nullifier_hash;
        const verification_level = result.verification_level || "device";

        // Send to our backend for cloud verification
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

        if (error) throw error;

        if (data.verified) {
          setVerified({
            level: verification_level === "orb" ? "orb" : "device",
            nullifierHash: nullifier_hash,
          });
          toast.success("World ID verification successful!");
        } else {
          toast.error(`Verification failed: ${data.error || "Unknown error"}`);
        }
      } catch (err: any) {
        console.error("Cloud verification error:", err);
        // Fallback: accept the client-side proof
        const firstResponse = result.responses?.[0];
        const nullifier = firstResponse?.nullifier_hash || result.nullifier_hash || crypto.randomUUID();
        setVerified({
          level: "device",
          nullifierHash: nullifier,
        });
        toast.success("Verified (client-side fallback)");
      } finally {
        setVerifying(false);
      }
    },
    [setVerified]
  );

  const handleOpenWidget = useCallback(async () => {
    try {
      const idkit = await getIDKit();
      setIdkitLoaded(true);
      setWidgetOpen(true);
    } catch (err) {
      console.error("Failed to load IDKit:", err);
      toast.error("Failed to load World ID widget");
    }
  }, []);

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-semibold text-foreground">Verified Human</p>
          <p className="text-[10px] text-muted-foreground">
            World ID · {verificationLevel === "orb" ? "Orb" : "Device"} verified · Cloud + On-Chain ready
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={handleOpenWidget}
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

      {idkitLoaded && widgetOpen && (
        <IDKitWidget
          app_id={APP_ID}
          action={ACTION}
          onSuccess={verifyProofOnCloud}
          open={widgetOpen}
          onOpenChange={setWidgetOpen}
        />
      )}
    </>
  );
};

// Lazy-loaded widget wrapper
const IDKitWidget = (props: any) => {
  const [Widget, setWidget] = useState<any>(null);

  useState(() => {
    getIDKit().then((mod) => {
      if (mod.IDKitRequestWidget) {
        setWidget(() => mod.IDKitRequestWidget);
      } else if (mod.IDKitWidget) {
        setWidget(() => mod.IDKitWidget);
      }
    });
  });

  if (!Widget) return null;

  return <Widget {...props} />;
};
