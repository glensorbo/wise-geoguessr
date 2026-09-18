export const successResponse = <T>(data: T, status: number = 200): Response => {
  return Response.json({ data, status }, { status });
};
