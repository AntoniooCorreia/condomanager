import { useUsers } from "@/hooks/use-condominium";
import { Card } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Edit } from "lucide-react";
import { motion } from "framer-motion";

export function Condominos() {
  const { data: users, isLoading } = useUsers();

  const residents = users?.filter(u => u.role === 'user') || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Condóminos</h1>
          <p className="text-muted-foreground mt-1">Lista de residentes e frações.</p>
        </div>
        <Button className="shadow-lg shadow-primary/20">Adicionar Condómino</Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden border-border/50 shadow-sm">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow className="border-border/50">
                <TableHead>Fração</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Utilizador</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">A carregar...</TableCell>
                </TableRow>
              ) : residents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Nenhum condómino encontrado.</TableCell>
                </TableRow>
              ) : (
                residents.map((user) => (
                  <TableRow key={user.id} className="group border-border/50 hover:bg-secondary/20">
                    <TableCell className="font-bold text-primary">{user.unit}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.username}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Ativo</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary"><Mail className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary"><Phone className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary"><Edit className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </motion.div>
    </div>
  );
}
