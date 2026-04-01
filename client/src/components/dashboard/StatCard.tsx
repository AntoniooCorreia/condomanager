import { Card } from "@/components/ui/card";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  delay?: number;
}

export function StatCard({ title, value, icon, trend, trendUp, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="p-6 overflow-hidden relative group border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-display font-bold text-foreground">{value}</h3>
            
            {trend && (
              <p className={`text-sm font-medium mt-2 flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trendUp ? '↑' : '↓'} {trend}
              </p>
            )}
          </div>
          <div className="p-3 bg-secondary rounded-2xl text-primary">
            {icon}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
