import { z } from 'zod';

// Esquema Zod para los parámetros de pago
export const MerchantParamsSchema = z.object({
  DS_MERCHANT_AMOUNT: z.string(), // en céntimos, 12 dígitos
  DS_MERCHANT_ORDER: z.string().max(12),
  DS_MERCHANT_MERCHANTCODE: z.string(),
  DS_MERCHANT_CURRENCY: z.string(),
  DS_MERCHANT_TRANSACTIONTYPE: z.string(),
  DS_MERCHANT_TERMINAL: z.string(),
  DS_MERCHANT_MERCHANTURL: z.string().url(),
  DS_MERCHANT_URLOK: z.string().url(),
  DS_MERCHANT_URLKO: z.string().url(),
  DS_MERCHANT_PRODUCTDESCRIPTION: z.string().optional(),
  DS_MERCHANT_MERCHANTNAME: z.string().optional(),
  DS_MERCHANT_CONSUMERLANGUAGE: z.string().optional(),
  DS_MERCHANT_MERCHANTDATA: z.string().optional(),
});

export type MerchantParams = z.infer<typeof MerchantParamsSchema>;

/**
 * Genera el objeto de parámetros para Redsys, validando con Zod.
 * @param params Objeto con los datos necesarios
 * @returns Objeto validado listo para firmar y enviar
 */
export function buildMerchantParams(params: MerchantParams): MerchantParams {
  return MerchantParamsSchema.parse(params);
} 