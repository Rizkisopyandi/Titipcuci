import { handleAdminOrderCommand } from "@/features/admin-orders/api-handler";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleAdminOrderCommand(request, context, "REJECT");
}
