import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PromptsPage } from '@/pages/PromptsPage'
import { DialogsPage } from '@/pages/DialogsPage'
import { StatsPage } from '@/pages/StatsPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight">🤖 AI Tutor Bot Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage prompts, view conversations, and track user activity
            </p>
          </div>

          <Tabs defaultValue="prompts" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="prompts">Prompts</TabsTrigger>
              <TabsTrigger value="dialogs">Dialogs</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="prompts" className="mt-6">
              <PromptsPage />
            </TabsContent>

            <TabsContent value="dialogs" className="mt-6">
              <DialogsPage />
            </TabsContent>

            <TabsContent value="stats" className="mt-6">
              <StatsPage />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </QueryClientProvider>
  )
}

export default App
