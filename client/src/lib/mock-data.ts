import { User, Payment, Work, Reservation, SecurityLog } from "client/shared/schema";

export const MOCK_USERS: User[] = [
  { id: 1, username: "admin", password: "password", role: "admin", name: "System Admin", unit: "Office" },
  { id: 2, username: "joao.silva", password: "password", role: "user", name: "João Silva", unit: "101A" },
  { id: 3, username: "maria.costa", password: "password", role: "user", name: "Maria Costa", unit: "102A" },
  { id: 4, username: "carlos.santos", password: "password", role: "user", name: "Carlos Santos", unit: "201B" },
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: 1, userId: 2, amount: "150.00", status: "paid", dueDate: new Date("2024-05-01"), description: "Quota Maio 2024" },
  { id: 2, userId: 3, amount: "150.00", status: "pending", dueDate: new Date("2024-06-01"), description: "Quota Junho 2024" },
  { id: 3, userId: 4, amount: "150.00", status: "overdue", dueDate: new Date("2024-04-01"), description: "Quota Abril 2024" },
  { id: 4, userId: 2, amount: "50.00", status: "paid", dueDate: new Date("2024-05-15"), description: "Fundo Reserva Maio" },
];

export const MOCK_WORKS: Work[] = [
  { id: 1, title: "Pintura da Fachada", description: "Pintura completa da fachada sul do edifício.", status: "in_progress", startDate: new Date("2024-05-10"), endDate: new Date("2024-06-20"), cost: "12500.00" },
  { id: 2, title: "Manutenção Elevadores", description: "Substituição de cabos do elevador B.", status: "planning", startDate: null, endDate: null, cost: "3200.00" },
  { id: 3, title: "Reparação Telhado", description: "Impermeabilização do telhado.", status: "completed", startDate: new Date("2024-03-01"), endDate: new Date("2024-03-15"), cost: "4500.00" },
];

export const MOCK_RESERVATIONS: Reservation[] = [
  { id: 1, userId: 2, area: "pool", date: new Date("2024-06-05T14:00:00"), status: "approved" },
  { id: 2, userId: 3, area: "party_room", date: new Date("2024-06-12T18:00:00"), status: "pending" },
  { id: 3, userId: 4, area: "gym", date: new Date("2024-06-02T09:00:00"), status: "rejected" },
];

export const MOCK_SECURITY_LOGS: SecurityLog[] = [
  { id: 1, reportedBy: 2, description: "Porta da garagem não fecha corretamente.", date: new Date("2024-05-28T08:30:00"), status: "open" },
  { id: 2, reportedBy: 3, description: "Barulho excessivo no 3º andar durante a madrugada.", date: new Date("2024-05-25T03:15:00"), status: "resolved" },
  { id: 3, reportedBy: null, description: "Câmara de segurança do hall desligada.", date: new Date("2024-05-29T11:00:00"), status: "open" },
];

export async function fetchWithMockFallback<T>(url: string, mockData: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("API failed");
    return await res.json();
  } catch (error) {
    console.warn(`[Mock Fallback] Failed to fetch ${url}, using mock data.`);
    return mockData;
  }
}
