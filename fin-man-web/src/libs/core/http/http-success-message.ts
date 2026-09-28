export enum HttpWriteMethod {
  Post = 'POST',
  Put = 'PUT',
  Patch = 'PATCH',
  Delete = 'DELETE',
}

export const HTTP_SUCCESS_MESSAGE: Record<HttpWriteMethod, string> = {
  [HttpWriteMethod.Post]: 'Saved successfully.',
  [HttpWriteMethod.Put]: 'Updated successfully.',
  [HttpWriteMethod.Patch]: 'Updated successfully.',
  [HttpWriteMethod.Delete]: 'Deleted successfully.',
};

export function httpSuccessMessage(method: string): string | null {
  if (!Object.values(HttpWriteMethod).includes(method as HttpWriteMethod)) {
    return null;
  }
  return HTTP_SUCCESS_MESSAGE[method as HttpWriteMethod];
}
