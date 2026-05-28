import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useRoastGithubUser, 
  getGetRoastHistoryQueryKey, 
  getGetRoastStatsQueryKey 
} from "@workspace/api-client-react";
import type { RoastResult, RoastInput } from "@workspace/api-client-react";
import { RoastForm } from "@/components/RoastForm";
import { RoastResultCard } from "@/components/RoastResultCard";
import { RoastHistoryList } from "@/components/RoastHistoryList";
import { RoastStatsBoard } from "@/components/RoastStatsBoard";
import { Terminal } from "lucide-react";

export default function Home() {
  const queryClient = useQueryClient();
  const roastMutation = useRoastGithubUser();
  const [activeResult, setActiveResult] = useState<RoastResult | null>(null);

  const handleRoast = (data: RoastInput) => {
    setActiveResult(null); // Clear previous result
    roastMutation.mutate(
      { data },
      {
        onSuccess: (result) => {
          setActiveResult(result);
          // Invalidate history and stats to refresh them
          queryClient.invalidateQueries({ queryKey: getGetRoastHistoryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRoastStatsQueryKey() });
        },
      }
    );
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center relative overflow-hidden scanlines">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff4110_1px,transparent_1px),linear-gradient(to_bottom,#00ff4110_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <main className="w-full max-w-4xl px-4 py-12 md:py-20 flex flex-col gap-12 z-10">
        
        {/* Header */}
        <header className="flex flex-col items-center text-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="p-4 rounded-full bg-primary/10 border border-primary/30 mb-2">
            <Terminal className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-300 drop-shadow-[0_0_15px_rgba(0,255,65,0.5)]">
            Roast My GitHub
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl font-mono">
            The internet's most savage code critic. Enter your username and prepare to have your commit history questioned.
          </p>
        </header>

        {/* Input Form */}
        <section className="w-full max-w-xl mx-auto">
          <RoastForm onSubmit={handleRoast} isPending={roastMutation.isPending} />
        </section>

        {/* Result Area */}
        {roastMutation.isPending && (
          <div className="w-full py-20 flex flex-col items-center justify-center gap-6 animate-in fade-in duration-500">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xl font-mono text-primary animate-pulse text-center">
              Analyzing your crimes against clean code...<br/>
              <span className="text-sm text-muted-foreground mt-2 inline-block">Pulling repos. Judging variable names. Sighing heavily.</span>
            </p>
          </div>
        )}

        {roastMutation.isError && (
          <div className="w-full max-w-2xl mx-auto p-6 border border-destructive bg-destructive/10 text-destructive-foreground rounded-lg font-mono text-center animate-in zoom-in-95">
            <h3 className="font-bold text-lg mb-2">System Failure</h3>
            <p>{roastMutation.error?.error || "Could not complete the roast. They probably deleted their account out of shame."}</p>
          </div>
        )}

        {activeResult && !roastMutation.isPending && (
          <section className="w-full mt-8 animate-in fade-in zoom-in-95 duration-500">
            <RoastResultCard result={activeResult} />
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {/* Stats */}
          <div className="md:col-span-1">
            <RoastStatsBoard />
          </div>
          
          {/* History */}
          <div className="md:col-span-2">
            <RoastHistoryList />
          </div>
        </div>

      </main>

      <footer className="w-full py-8 text-center text-muted-foreground text-sm font-mono border-t border-border mt-auto z-10">
        <p>Built with malicious intent. Not affiliated with GitHub.</p>
      </footer>
    </div>
  );
}
