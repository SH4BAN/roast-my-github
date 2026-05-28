import type { RoastResult } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Users, BookOpen } from "lucide-react";

interface RoastResultCardProps {
  result: RoastResult;
}

export function RoastResultCard({ result }: RoastResultCardProps) {
  const { roast, githubProfile } = result;

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-primary/50 bg-secondary/30 backdrop-blur shadow-[0_0_30px_rgba(0,255,65,0.15)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <CardHeader className="pb-4">
          <CardTitle className="text-primary font-mono text-sm uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            Diagnostic Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none">
            <p className="text-xl md:text-2xl leading-relaxed font-sans font-medium text-foreground whitespace-pre-wrap">
              {roast}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <Avatar className="w-24 h-24 border-2 border-primary/50 rounded-xl rounded-tl-none rounded-br-none">
              <AvatarImage src={githubProfile.avatarUrl} alt={githubProfile.login} />
              <AvatarFallback className="rounded-xl rounded-tl-none rounded-br-none bg-secondary text-primary font-mono text-2xl">
                {githubProfile.login.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4 w-full">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold font-sans text-foreground">
                  {githubProfile.name || githubProfile.login}
                </h3>
                <a 
                  href={`https://github.com/${githubProfile.login}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline font-mono text-sm"
                >
                  @{githubProfile.login}
                </a>
                {githubProfile.bio && (
                  <p className="mt-2 text-muted-foreground text-sm max-w-md mx-auto md:mx-0">
                    "{githubProfile.bio}"
                  </p>
                )}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-1.5 text-sm font-mono text-muted-foreground">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>{githubProfile.publicRepos} Repos</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-mono text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{githubProfile.followers} Followers</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-mono text-muted-foreground">
                  <Star className="w-4 h-4 text-primary" />
                  <span>{githubProfile.totalStars || 0} Stars</span>
                </div>
              </div>

              {githubProfile.topLanguages && githubProfile.topLanguages.length > 0 && (
                <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                  {githubProfile.topLanguages.map(lang => (
                    <Badge key={lang} variant="secondary" className="font-mono bg-secondary text-secondary-foreground border-border hover:bg-secondary">
                      {lang}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
