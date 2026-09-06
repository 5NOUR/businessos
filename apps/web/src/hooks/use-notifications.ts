import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useEffect } from "react";

export interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications(orgId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!orgId) return;
    const socket = getSocket();
    socket.emit("joinOrganization", { orgId });
    socket.on("notification:new", () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", orgId] });
    });
    return () => {
      socket.off("notification:new");
    };
  }, [orgId, queryClient]);

  return useQuery<{ items: Notification[]; meta: any }>({
    queryKey: ["notifications", orgId],
    queryFn: () =>
      apiFetch(`/notifications?limit=20`, {
        headers: { "x-organization-id": orgId || "" },
      }),
    enabled: !!orgId,
  });
}

export function useMarkNotificationRead(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/notifications/${id}/read`, {
        method: "PATCH",
        headers: { "x-organization-id": orgId || "" },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications", orgId] }),
  });
}

export function useMarkAllNotificationsRead(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch(`/notifications/read-all`, {
        method: "PATCH",
        headers: { "x-organization-id": orgId || "" },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications", orgId] }),
  });
}
