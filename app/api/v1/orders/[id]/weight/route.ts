import { handleBillingCommand } from "@/features/billing/api-handler";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleBillingCommand(request, context, "WEIGHT");
}
