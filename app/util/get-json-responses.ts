export function getJSONResponses<T>(raw: string) {
  const jsonRegex = new RegExp(/\{.*\}/g);
  const jsonMatch = raw.matchAll(jsonRegex);
  const responses = Array.from(jsonMatch);
  return responses.map<T>(([response]) => JSON.parse(response));
}
