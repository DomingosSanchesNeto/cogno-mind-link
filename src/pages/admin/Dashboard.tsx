import { Users, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data - will be replaced with real data from Supabase
const mockStats = {
  total: 127,
  completed: 89,
  inProgress: 23,
  declined: 15,
};

const mockRecentActivity = [
  { id: 1, status: 'completed', timestamp: '2024-01-15 14:32' },
  { id: 2, status: 'completed', timestamp: '2024-01-15 14:18' },
  { id: 3, status: 'in_progress', timestamp: '2024-01-15 14:05' },
  { id: 4, status: 'declined', timestamp: '2024-01-15 13:52' },
  { id: 5, status: 'completed', timestamp: '2024-01-15 13:41' },
];

export default function Dashboard() {
  const completionRate = ((mockStats.completed / mockStats.total) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral das participações no experimento
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Participantes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{mockStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Concluídos
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{mockStats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completionRate}% taxa de conclusão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Andamento
            </CardTitle>
            <Clock className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{mockStats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recusados
            </CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{mockStats.declined}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRecentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {activity.status === 'completed' && (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  )}
                  {activity.status === 'in_progress' && (
                    <Clock className="h-5 w-5 text-accent" />
                  )}
                  {activity.status === 'declined' && (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span className="text-sm text-foreground">
                    Participante #{activity.id}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {activity.timestamp}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
