import type { ContactEnv } from '../_contact/config';
import { handleContactRequest } from '../_contact/handler';
import { errorResponse } from '../_contact/response';

/**
 * Cloudflare Pages Function — POST /api/contact
 */
export const onRequest: PagesFunction<ContactEnv> = async (context) => {
  if (context.request.method !== 'POST') {
    return errorResponse('Method not allowed.', 405);
  }

  return handleContactRequest(context.request, context.env);
};
