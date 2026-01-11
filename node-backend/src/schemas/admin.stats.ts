import { z } from "zod";

export const GetAdminStatsSchema = z.object({
  query: z.object({
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid startDate format",
    }),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid endDate format",
    }),
  }),
});

export type GetAdminStatsQuery = z.infer<typeof GetAdminStatsSchema>["query"];
