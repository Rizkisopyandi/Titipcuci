import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CustomerShell } from "@/components/customer/Shell";

export const Route = createFileRoute("/app")({
  component: () => (
    <CustomerShell>
      <Outlet />
    </CustomerShell>
  ),
});
