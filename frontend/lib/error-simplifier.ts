type RawErrors = {
  errors: string[];
  properties?: Record<string, { errors: string[] }>;
};

type FlatErrors = Record<string, string>;

export function simplifyErrors(errors: RawErrors): FlatErrors {
  const result: FlatErrors = {};

  if (errors.properties) {
    for (const [field, fieldError] of Object.entries(errors.properties)) {
      if (fieldError?.errors?.length) {
        result[field] = fieldError.errors[0]; // Take the first error
      }
    }
  }

  return result;
}
