import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { User, Payment, Work, Reservation, SecurityLog } from "@shared/schema";
import { MOCK_USERS, MOCK_PAYMENTS, MOCK_WORKS, MOCK_RESERVATIONS, MOCK_SECURITY_LOGS, fetchWithMockFallback } from "@/lib/mock-data";

// --- USERS ---
export function useUsers() {
  return useQuery<User[]>({
    queryKey: [api.users.list.path],
    queryFn: () => fetchWithMockFallback(api.users.list.path, MOCK_USERS),
  });
}

// --- PAYMENTS ---
export function usePayments() {
  return useQuery<Payment[]>({
    queryKey: [api.payments.list.path],
    queryFn: () => fetchWithMockFallback(api.payments.list.path, MOCK_PAYMENTS),
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      // Mock network request
      await new Promise((r) => setTimeout(r, 500));
      return { id, status };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.payments.list.path] }),
  });
}

// --- WORKS ---
export function useWorks() {
  return useQuery<Work[]>({
    queryKey: [api.works.list.path],
    queryFn: () => fetchWithMockFallback(api.works.list.path, MOCK_WORKS),
  });
}

export function useCreateWork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Work>) => {
      await new Promise((r) => setTimeout(r, 500));
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.works.list.path] }),
  });
}

// --- RESERVATIONS ---
export function useReservations() {
  return useQuery<Reservation[]>({
    queryKey: [api.reservations.list.path],
    queryFn: () => fetchWithMockFallback(api.reservations.list.path, MOCK_RESERVATIONS),
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Reservation>) => {
      await new Promise((r) => setTimeout(r, 500));
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.reservations.list.path] }),
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await new Promise((r) => setTimeout(r, 500));
      return { id, status };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.reservations.list.path] }),
  });
}

// --- SECURITY LOGS ---
export function useSecurityLogs() {
  return useQuery<SecurityLog[]>({
    queryKey: [api.securityLogs.list.path],
    queryFn: () => fetchWithMockFallback(api.securityLogs.list.path, MOCK_SECURITY_LOGS),
  });
}

export function useCreateSecurityLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<SecurityLog>) => {
      await new Promise((r) => setTimeout(r, 500));
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.securityLogs.list.path] }),
  });
}
