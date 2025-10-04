import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, MessageCircle, User } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

export function DialogsPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.getUsers(),
  })

  const { data: dialogData } = useQuery({
    queryKey: ['dialog', selectedUserId],
    queryFn: () => api.getDialog(selectedUserId!),
    enabled: !!selectedUserId,
  })

  const selectedUser = usersData?.users.find((u) => u.userId === selectedUserId)

  if (selectedUserId && dialogData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedUserId(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{selectedUser?.username || dialogData.userId}</h2>
            <p className="text-muted-foreground">
              {dialogData.messages.length} messages
            </p>
          </div>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto p-4 bg-muted/20 rounded-lg">
          {dialogData.messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                'flex',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-lg p-4',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.parts[0].text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">User Dialogs</h2>
        <p className="text-muted-foreground">View conversation history with users</p>
      </div>

      {!usersData?.users.length ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No users with dialogs yet. Start a conversation in Telegram!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {usersData.users.map((user) => (
            <Card
              key={user.userId}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedUserId(user.userId)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {user.username || user.userId}
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-3 w-3" />
                    {user.messageCount} messages
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Last active: {new Date(user.lastMessageAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
