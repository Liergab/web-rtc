import { z } from "zod";

export const ValidationSchemas = {
  idParam: z.object({
    id: z.string().min(1, "ID is required"),
  }),

  getQueryParams: z.object({
    populateArray: z
      .array(
        z.union([
          z.string(),
          z.object({
            path: z.string(),
            select: z.string(),
          }),
        ])
      )
      .optional(),
    select: z.union([z.string(), z.array(z.string())]).optional(),
    lean: z.boolean().optional(),
  }),

  getQueriesParams: z.object({
    query: z.record(z.any()).optional(),
    queryArray: z.any().optional(),
    queryArrayType: z
      .union([z.string(), z.array(z.string())]) // Allow both string and array of strings
      .optional(),
    populateArray: z
      .array(
        z.union([
          z.string(),
          z.object({
            path: z.string(),
            select: z.string(),
          }),
        ])
      )
      .optional(),
    sort: z.string().optional(),
    limit: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
      .optional(),
    page: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
      .optional(),
    pageSize: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
      .optional(),
    select: z.union([z.string(), z.array(z.string())]).optional(),
    lean: z.boolean().optional(),
  }),
};

export type IdParamType = z.infer<typeof ValidationSchemas.idParam>;
export type GetClientParamsType = z.infer<
  typeof ValidationSchemas.getQueryParams
>;
export type GetClientsParamsType = z.infer<
  typeof ValidationSchemas.getQueriesParams
>;
