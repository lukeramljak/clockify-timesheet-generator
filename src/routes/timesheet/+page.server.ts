import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { formSchema } from '$lib/components/timesheet-form/schema';
import { getLastNFridays } from '$lib/utils/date';
import { Clockify } from '$lib/server/clockify';

export const load: PageServerLoad = async ({ cookies }) => {
  const apiKey = cookies.get('clockify_api_key');
  if (!apiKey) {
    throw redirect(303, '/');
  }

  const form = await superValidate(zod4(formSchema));
  const resource = cookies.get('timesheet_resource');
  const callNo = cookies.get('timesheet_callNo');
  const includeProjectName = cookies.get('timesheet_includeProjectNmae');

  if (resource) form.data.resource = resource;
  if (callNo) form.data.callNo = callNo;
  if (includeProjectName) form.data.includeProjectName = includeProjectName === 'true';

  form.data.weekEnding = getLastNFridays(1)[0].toString();

  return { form };
};

export const actions = {
  export: async ({ request, cookies }) => {
    const form = await superValidate(request, zod4(formSchema));
    if (!form.valid) {
      return fail(400, { form });
    }

    const apiKey = cookies.get('clockify_api_key');
    if (!apiKey) {
      throw redirect(303, '/');
    }

    cookies.set('timesheet_resource', form.data.resource, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'strict'
    });
    cookies.set('timesheet_callNo', form.data.callNo, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'strict'
    });
    cookies.set('timesheet_includeProjectNmae', String(form.data.includeProjectName), {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'strict'
    });

    const clockify = await Clockify.create(apiKey);
    const inProgress = await clockify.getInProgressTimeEntries();

    if (inProgress.length > 0) {
      return message(form, 'Stop your active timer first');
    }

    return message(form, 'success');
  },
  reset: async ({ cookies }) => {
    cookies.delete('clockify_api_key', { path: '/' });
    cookies.delete('timesheet_resource', { path: '/' });
    cookies.delete('timesheet_callNo', { path: '/' });
    cookies.delete('timesheet_includeProjectName', { path: '/' });
    throw redirect(303, '/');
  }
} satisfies Actions;
