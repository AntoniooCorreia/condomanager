import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { User, Payment, Work, Reservation, SecurityLog, InsertUser, PaymentSchedule, InsertPaymentSchedule } from "@/shared/schema";
import { MOCK_USERS, MOCK_PAYMENTS, MOCK_WORKS, MOCK_RESERVATIONS, MOCK_SECURITY_LOGS, fetchWithMockFallback } from "@/lib/mock-data";
import { apiRequest } from "@/lib/queryClient";

export function useUsers() {
  return useQuery<User[]>({
    queryKey: [api.users.list.path],
    queryFn: async () => {
      const res = await fetch(api.users.list.path);
      if (!res.ok) return MOCK_USERS;
      return res.json();
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await apiRequest("POST", api.users.create.path, data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.users.list.path] }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<User> & { id: number }) => {
      const res = await apiRequest("PUT", buildUrl(api.users.update.path, { id }), data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.users.list.path] }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.users.list.path] }),
  });
}

export function useDeleteWork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/works/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.works.list.path] }),
  });
}

export function useUpdateWork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await apiRequest("PUT", buildUrl(api.works.update.path, { id }), data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.works.list.path] }),
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
      const res = await apiRequest("PUT", buildUrl(api.payments.update.path, { id }), { status });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.payments.list.path] }),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", api.payments.create.path, data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.payments.list.path] }),
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/payments/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.payments.list.path] }),
  });
}

// --- PAYMENT SCHEDULES ---
export function usePaymentSchedules() {
  return useQuery<PaymentSchedule[]>({
    queryKey: ["/api/payments?resource=schedules"],
    queryFn: async () => {
      const res = await fetch("/api/payments?resource=schedules");
      if (!res.ok) return [];
      return res.json();
    },
  });
}

export function useCreatePaymentSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertPaymentSchedule) => {
      const res = await apiRequest("POST", "/api/payments?resource=schedules", data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/payments?resource=schedules"] }),
  });
}

export function useDeletePaymentSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/payments/${id}?resource=schedules`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/payments?resource=schedules"] }),
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
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", api.works.create.path, data);
      return res.json();
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
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", api.reservations.create.path, data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.reservations.list.path] }),
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", buildUrl(api.reservations.update.path, { id }), { status });
      return res.json();
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
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", api.securityLogs.create.path, data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.securityLogs.list.path] }),
  });
}

export function useUpdateSecurityLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", buildUrl(api.securityLogs.update.path, { id }), { status });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.securityLogs.list.path] }),
  });
}

// --- MESSAGES ---
export function useMessages(userId: number, otherUserId: number) {
  return useQuery({
    queryKey: ["/api/messages", userId, otherUserId],
    queryFn: async () => {
      if (!userId || !otherUserId) return [];
      const res = await fetch(`/api/messages?userId=${userId}&otherUserId=${otherUserId}`);
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 3000,
    enabled: !!userId && !!otherUserId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { senderId: number; receiverId: number; content: string }) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", variables.senderId, variables.receiverId] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages", variables.receiverId, variables.senderId] });
    },
  });
}
