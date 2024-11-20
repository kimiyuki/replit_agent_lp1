import React from "react";
import { useQuery } from "@tanstack/react-query";
import { type Contact } from "@db/schema";
import { useUser } from "../hooks/use-user";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { format, startOfDay, eachDayOfInterval, subDays } from "date-fns";
import { ja } from "date-fns/locale";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

async function fetchContacts(): Promise<Contact[]> {
  const response = await fetch("/api/contacts", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch contacts");
  }

  return response.json();
}

export default function AdminContacts() {
  const { user, logout } = useUser();
  const [, setLocation] = useLocation();

  const { data: contacts, error, isLoading } = useQuery<Contact[], Error>({
    queryKey: ["contacts"],
    queryFn: fetchContacts,
  });

  const handleLogout = async () => {
    await logout();
    setLocation("/admin");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-center">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-destructive">
            エラーが発生しました: {error.message}
          </p>
        </div>
      </div>
    );
  }

  // Process data for chart
  const chartData = React.useMemo(() => {
    if (!contacts) return [];
    
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    const countsByDay = last7Days.map(day => {
      const count = contacts.filter(contact => 
        startOfDay(new Date(contact.createdAt)).getTime() === startOfDay(day).getTime()
      ).length;

      return {
        date: format(day, 'M/d', { locale: ja }),
        count,
      };
    });

    return countsByDay;
  }, [contacts]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">お問い合わせ一覧</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              {user?.username} としてログイン中
            </span>
            <Button onClick={handleLogout} variant="outline">
              ログアウト
            </Button>
          </div>
        </div>
        
        <div className="mb-8 border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">週間問い合わせ数</h2>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                count: {
                  theme: {
                    light: "hsl(var(--primary))",
                    dark: "hsl(var(--primary))",
                  },
                  label: "問い合わせ数",
                },
              }}
            >
              <BarChart data={chartData}>
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  allowDecimals={false}
                />
                <Bar
                  dataKey="count"
                  fill="currentColor"
                  className="fill-primary"
                  radius={[4, 4, 0, 0]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        <div className="space-y-8">
          {contacts?.map((contact) => (
            <div
              key={contact.id}
              className="border rounded-lg p-6 space-y-4 bg-card"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{contact.name}</h2>
                  <p className="text-muted-foreground">{contact.email}</p>
                  {contact.phone && (
                    <p className="text-muted-foreground">{contact.phone}</p>
                  )}
                </div>
                <time className="text-sm text-muted-foreground">
                  {format(new Date(contact.createdAt), "PPP HH:mm", {
                    locale: ja,
                  })}
                </time>
              </div>
              <p className="whitespace-pre-wrap">{contact.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
