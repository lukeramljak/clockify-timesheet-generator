import { fail, redirect, type Actions } from '@sveltejs/kit';
import { formSchema } from '$lib/components/api-key-form/schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import { setError, superValidate } from 'sveltekit-superforms';
import { Clockify } from '$lib/server/clockify';
import type { PageServerLoad } from './timesheet/$types';

export const load: PageServerLoad = async ({ cookies }) => {
  const apiKey = cookies.get('clockify_api_key');
  if (apiKey) {
    throw redirect(303, '/timesheet');
  }

  return {
    form: await superValidate(zod4(formSchema))
  };
};

export const actions = {
  default: async ({ request, cookies }) => {
    const form = await superValidate(request, zod4(formSchema));
    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      await Clockify.create(form.data.apiKey);

      cookies.set('clockify_api_key', form.data.apiKey, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
      });
    } catch {
      return setError(form, 'apiKey', 'Invalid API key. Please check and try again.');
    }

    throw redirect(303, '/timesheet');
  }
} satisfies Actions;
