import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, MessageSquare, UserCheck, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'

export function StatsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.getStats(),
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  const stats = [
    {
      title: 'Total Users',
      value: data?.totalUsers || 0,
      icon: Users,
      description: 'All users who interacted',
    },
    {
      title: 'Total Messages',
      value: data?.totalMessages || 0,
      icon: MessageSquare,
      description: 'Messages sent and received',
    },
    {
      title: 'Active Today',
      value: data?.activeToday || 0,
      icon: UserCheck,
      description: 'Users active today',
    },
    {
      title: 'Avg. Messages/User',
      value: data?.averageMessagesPerUser || 0,
      icon: TrendingUp,
      description: 'Average engagement',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Statistics</h2>
        <p className="text-muted-foreground">Overview of bot activity and engagement</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
