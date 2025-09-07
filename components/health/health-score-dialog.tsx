"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { HealthScoreCard } from "./health-score-card"

interface HealthScoreDialogProps {
  account: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HealthScoreDialog({ account, open, onOpenChange }: HealthScoreDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Health Score Analysis</DialogTitle>
        </DialogHeader>
        <HealthScoreCard 
          account={account} 
          onClose={() => onOpenChange(false)}
          showCloseButton={false}
        />
      </DialogContent>
    </Dialog>
  )
}