import { useGetRoastHistory, getGetRoastHistoryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { TerminalSquare, Flame, ShieldAlert, Skull } from "lucide-react";

export function RoastHistoryList() {
  const { data: history, isLoading } = useGetRoastHistory({
    query: { queryKey: getGetRoastHistoryQueryKey() }
  });

  const getIntensityIcon = (intensity: string) => {
    switch(intensity) {
      case 'savage': return <Skull className="w-3 h-3 text-destructive" />;
      case 'medium': return <ShieldAlert className="w-3 h-3 text-orange-500" />;
      default: return <Flame className="w-3 h-3 text-yellow-500" />;
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch(intensity) {
      case 'savage': return "border-destructive text-destructive bg-destructive/10";
      case 'medium': return "border-orange-500 text-orange-500 bg-orange-500/10";
      default: return "border-yellow-500 text-yellow-500 bg-yellow-500/10";
    }
  };

  return (
    <Card className="bg-background border-border h-full">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="font-mono uppercase tracking-wider text-sm flex items-center gap-2 text-muted-foreground">
          <TerminalSquare className="w-4 h-4" />
          Recent Victims
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : !history || history.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground font-mono text-sm">
            No victims yet. Be the first.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {history.map((record) => (
              <div 
                key={record.id} 
                className="p-4 hover:bg-secondary/50 transition-colors group flex gap-4 items-start"
              >
                <Avatar className="w-10 h-10 border border-border mt-1">
                  <AvatarImage src={record.avatarUrl || undefined} />
                  <AvatarFallback className="bg-muted text-muted-foreground font-mono text-xs">
                    {record.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold font-sans text-foreground truncate mr-2">
                      @{record.username}
                    </span>
                    <Badge variant="outline" className={`font-mono text-[10px] uppercase flex gap-1 items-center rounded-none ${getIntensityColor(record.intensity)}`}>
                      {getIntensityIcon(record.intensity)}
                      {record.intensity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-sans line-clamp-2 leading-relaxed">
                    {record.roast}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground/50 mt-2">
                    {formatDistanceToNow(new Date(record.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
