import React from "react";
import { useGetRoastStats, getGetRoastStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Code2, Users, FileCode2 } from "lucide-react";

export function RoastStatsBoard() {
  const { data: stats, isLoading } = useGetRoastStats({
    query: { queryKey: getGetRoastStatsQueryKey() }
  });

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="font-mono uppercase tracking-wider text-sm flex items-center gap-2 text-muted-foreground">
          <Activity className="w-4 h-4" />
          Global Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-3 w-20 bg-muted rounded mb-2" />
                <div className="h-6 w-32 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : !stats ? (
          <div className="text-center text-muted-foreground font-mono text-sm py-4">
            Metrics offline
          </div>
        ) : (
          <div className="space-y-6">
            <StatItem 
              icon={<Users className="w-4 h-4 text-primary" />}
              label="Total Roasts" 
              value={stats.totalRoasts.toString()} 
            />
            <StatItem 
              icon={<Code2 className="w-4 h-4 text-primary" />}
              label="Most Common Lang" 
              value={stats.mostCommonLanguage || "Unknown"} 
            />
            <StatItem 
              icon={<FileCode2 className="w-4 h-4 text-primary" />}
              label="Avg Repos per Victim" 
              value={Math.round(stats.averageRepos).toString()} 
            />
            <StatItem 
              icon={<Activity className="w-4 h-4 text-destructive" />}
              label="Frequent Target" 
              value={stats.mostRoastedUser ? `@${stats.mostRoastedUser}` : "None"} 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatItem({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="font-sans font-bold text-xl text-foreground truncate">
        {value}
      </div>
    </div>
  );
}
