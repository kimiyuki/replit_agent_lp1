import { useQuery } from "@tanstack/react-query";
import { type Contact } from "@db/schema";
import { useUser } from "../hooks/use-user";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

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
