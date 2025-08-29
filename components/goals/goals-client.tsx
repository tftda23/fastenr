"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Target, Calendar, User, Users, TrendingUp, Eye, Edit as EditIcon } from "lucide-react";
import { GoalForm } from "./goal-form";
import type { CustomerGoal, Account } from "@/lib/types";

interface GoalsClientProps {
  initialGoals: (CustomerGoal & {
    accounts: { name: string } | null;
    user_profiles: { full_name: string } | null;
  })[];
  accounts: Account[];
}

export function GoalsClient({ initialGoals, accounts }: GoalsClientProps) {
  const [goals, setGoals] = useState(initialGoals ?? []);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"customer" | "team">("customer");
  const [editingGoal, setEditingGoal] = useState<(CustomerGoal & { accounts?: { name: string } | null }) | null>(null);

  const { teamGoals, customerGoals } = useMemo(() => {
    const team = goals.filter((goal) => (goal as any).goal_type === "organization");
    const customer = goals.filter((goal) => (goal as any).goal_type === "customer");
    return { teamGoals: team, customerGoals: customer };
  }, [goals]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "achieved":
        return "bg-green-100 text-green-800";
      case "on_track":
        return "bg-blue-100 text-blue-800";
      case "at_risk":
        return "bg-yellow-100 text-yellow-800";
      case "missed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  // CREATE handlers
  const handleGoalCreated = useCallback(
    (newGoal: CustomerGoal & { accounts: { name: string } | null }) => {
      setGoals((prev) => [{ ...newGoal, user_profiles: null }, ...prev]);
      setShowForm(false);
      setEditingGoal(null);
    },
    []
  );

  // EDIT handlers
  const handleEditClick = useCallback((goal: CustomerGoal & { accounts: { name: string } | null }) => {
    setEditingGoal(goal);
    setShowForm(true);
  }, []);

  const handleGoalUpdated = useCallback(
    (updated: CustomerGoal & { accounts: { name: string } | null }) => {
      setGoals((prev) => prev.map((g) => (g.id === updated.id ? { ...updated, user_profiles: g.user_profiles ?? null } : g)));
      setShowForm(false);
      setEditingGoal(null);
    },
    []
  );

  const handleGoalDeleted = useCallback((goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    setShowForm(false);
    setEditingGoal(null);
  }, []);

  // Open/close form
  const handleShowForm = useCallback(() => {
    setEditingGoal(null); // create mode
    setShowForm(true);
  }, []);
  const handleHideForm = useCallback(() => {
    setShowForm(false);
    setEditingGoal(null);
  }, []);

  const GoalCard = useMemo(() => {
    return ({
      goal,
    }: {
      goal: CustomerGoal & {
        accounts: { name: string } | null;
        user_profiles: { full_name: string } | null;
      };
    }) => (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-lg line-clamp-2">{goal.title}</CardTitle>
              <CardDescription className="line-clamp-2">{goal.description}</CardDescription>
            </div>
            <Badge className={getStatusColor(goal.status)}>{goal.status.replace("_", " ")}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            {(goal as any).goal_type === "customer" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{goal.accounts?.name ?? "—"}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Due: {(goal as any).target_date ? new Date((goal as any).target_date).toLocaleDateString() : "—"}</span>
            </div>

            {goal.current_value !== null && goal.target_value && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>
                    {goal.current_value} {(goal as any).unit ? (goal as any).unit : ""} / {goal.target_value} {(goal as any).unit ? (goal as any).unit : ""}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (Number(goal.current_value) / Number(goal.target_value)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {(goal as any).metric_type && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>{(goal as any).metric_type.replace("_", " ").toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Actions: View details + Edit */}
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/dashboard/goals/${goal.id}`} aria-label="View goal details">
                <Eye className="h-4 w-4 mr-2" />
                View details
              </Link>
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => handleEditClick(goal)}
              aria-label="Edit goal"
            >
              <EditIcon className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }, [getStatusColor, handleEditClick]);

  const teamEmptyState = useMemo(
    () => (
      <Card className="p-8 text-center">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No team goals yet</h3>
        <p className="text-muted-foreground mb-4">
          Create organization-wide goals to track team performance across all customers.
        </p>
        <Button onClick={handleShowForm}>Create Team Goal</Button>
      </Card>
    ),
    [handleShowForm]
  );

  const customerEmptyState = useMemo(
    () => (
      <Card className="p-8 text-center">
        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No customer goals yet</h3>
        <p className="text-muted-foreground mb-4">
          Create customer-specific goals to track individual account success.
        </p>
        <Button onClick={handleShowForm}>Create Customer Goal</Button>
      </Card>
    ),
    [handleShowForm]
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "customer" | "team")} className="w-full">
        <div className="flex justify-between items-center">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Team Goals ({teamGoals.length})
            </TabsTrigger>
            <TabsTrigger value="customer" className="flex items-center gap-2">
              <Target className="h-4 w-4" /> Customer Goals ({customerGoals.length})
            </TabsTrigger>
          </TabsList>

          <Button onClick={handleShowForm} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create Goal
          </Button>
        </div>

        <TabsContent value="team" className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-5 w-5" />
            <span>{teamGoals.length} organisation goals</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teamGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>

          {teamGoals.length === 0 && teamEmptyState}
        </TabsContent>

        <TabsContent value="customer" className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-5 w-5" />
            <span>{customerGoals.length} customer goals</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customerGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>

          {customerGoals.length === 0 && customerEmptyState}
        </TabsContent>
      </Tabs>

      {showForm && (
        <GoalForm
          accounts={accounts}
          onGoalCreated={handleGoalCreated}
          onCancel={handleHideForm}
          goalToEdit={editingGoal ?? undefined}
          onGoalUpdated={handleGoalUpdated}
          onGoalDeleted={handleGoalDeleted}
          // Only used in CREATE mode; edit mode respects the goal’s saved type
          defaultGoalType={activeTab === "team" ? "organization" : "customer"}
        />
      )}
    </div>
  );
}
