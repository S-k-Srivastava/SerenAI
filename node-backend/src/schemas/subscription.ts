import { z } from "zod";

export const CreateSubscriptionSchema = z.object({
    body: z.object({
        user_id: z.string().min(1, "User ID is required"),
        plan_id: z.string().min(1, "Plan ID is required"),
    }),
});

export type CreateSubscriptionRequest = z.infer<typeof CreateSubscriptionSchema>["body"];
