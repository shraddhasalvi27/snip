import { ValidationError } from "../errors/app.error";
import { aliasSchema,urlSchema } from "../schema/link.schema";


export function validateUrl(input: string): string {
  const result = urlSchema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(result.error.issues[0].message);
  }
  return result.data; // already a normalized string via the last .transform
}


// words in link chosen by user is alias
export function validateAlias(alias: string): void {
  const result = aliasSchema.safeParse(alias);
  if (!result.success) {
    throw new ValidationError(result.error.issues[0].message);
  }
}