import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { PageBackButton } from "@/components/ui/page-back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Eye, Calendar } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

type Reply = {
  id: string;
  content: string;
  created_at: string | null;
  user_id: string;
  profiles?: { id: string; full_name: string | null; avatar_url: string | null };
};

const DiscussionThread = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notFound, setNotFound] = useState(false);

  const { data: thread, isLoading } = useQuery({
    queryKey: ["discussion", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discussions")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        setNotFound(true);
        return null;
      }
      return data;
    },
  });

  const { data: replies } = useQuery({
    queryKey: ["discussion-replies", id],
    enabled: Boolean(thread),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discussion_replies")
        .select("*")
        .eq("discussion_id", id!);
      if (error) throw error;

      const userIds = [...new Set(data?.map(r => r.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      return (data ?? []).map(r => ({
        ...r,
        profiles: profilesData?.find(p => p.id === r.user_id),
      })) as Reply[];
    },
  });

  const { data: author } = useQuery({
    queryKey: ["discussion-author", thread?.user_id],
    enabled: Boolean(thread),
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", thread!.user_id)
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (thread) {
      supabase
        .from("discussions")
        .update({ views: (thread.views ?? 0) + 1 })
        .eq("id", thread.id)
        .then(() => undefined, () => undefined);
    }
  }, [thread]);

  const initials = (name?: string | null) =>
    (name || "A")
      .split(" ")
      .map(n => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <>
      {thread && (
        <Seo>
          <title>{`${thread.title} | Eduminity Student Community`}</title>
          <meta name="description" content={thread.content.slice(0, 150)} />
        </Seo>
      )}
      <Header />
      <div className="min-h-screen bg-background pt-20 px-6 pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <PageBackButton />
            <Button variant="outline" onClick={() => navigate("/app/community")}>
              Back to Forum
            </Button>
          </div>

          {isLoading ? (
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ) : notFound || !thread ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
                This thread could not be found. It may have been removed.
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="dark:border-neon-teal/30">
                <CardHeader>
                  <CardTitle className="text-2xl">{thread.title}</CardTitle>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2 min-w-0">
                      {author?.avatar_url ? (
                        <img src={author.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                      ) : (
                        <span className="h-6 w-6 rounded-full bg-primary/15 dark:bg-neon-teal/20 text-[10px] flex items-center justify-center font-semibold">
                          {initials(author?.full_name)}
                        </span>
                      )}
                      <span className="truncate">{author?.full_name || "Anonymous"}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {thread.created_at ? new Date(thread.created_at).toLocaleDateString() : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {thread.views ?? 0} views
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-foreground/90">{thread.content}</p>
                </CardContent>
              </Card>

              <h2 className="text-lg font-bold mt-8 mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-neon-teal" />
                {replies?.length ?? 0} {replies?.length === 1 ? "Reply" : "Replies"}
              </h2>

              <div className="space-y-4">
                {replies && replies.length > 0 ? (
                  replies.map((reply) => (
                    <Card key={reply.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                          {reply.profiles?.avatar_url ? (
                            <img src={reply.profiles.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                          ) : (
                            <span className="h-6 w-6 rounded-full bg-primary/15 dark:bg-neon-violet/20 text-[10px] flex items-center justify-center font-semibold">
                              {initials(reply.profiles?.full_name)}
                            </span>
                          )}
                          <span className="font-semibold text-sm">{reply.profiles?.full_name || "Anonymous"}</span>
                          <span className="text-xs text-muted-foreground">
                            • {reply.created_at ? new Date(reply.created_at).toLocaleDateString() : ""}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-foreground/90">{reply.content}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No replies yet.
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DiscussionThread;
