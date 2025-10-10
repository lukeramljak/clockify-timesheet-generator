import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Clockify } from '$lib/server/clockify';
import { formatTimeEntries } from '$lib/server/time-entries';
import { createTimesheet, EXCEL_MIME_TYPE, generateFileName } from '$lib/server/timesheet';

export const GET: RequestHandler = async ({ url, cookies }) => {
  const apiKey = cookies.get('clockify_api_key');
  if (!apiKey) {
    throw error(401, 'No API key found');
  }

  const resource = url.searchParams.get('resource');
  const callNo = url.searchParams.get('callNo');
  const includeProjectName = url.searchParams.get('includeProjectName') === 'true';
  const weekEnding = url.searchParams.get('weekEnding');

  if (!resource || !callNo || !weekEnding) {
    throw error(400, 'Missing required parameters');
  }

  const clockify = await Clockify.create(apiKey);
  const timeEntries = await clockify.getTimeEntries(weekEnding);
  const projects = includeProjectName ? await clockify.getProjects() : undefined;

  const formattedTimeEntries = formatTimeEntries({
    resource,
    callNo,
    projects,
    timeEntries
  });

  const file = await createTimesheet(formattedTimeEntries);

  return new Response(file, {
    headers: {
      'Content-Type': EXCEL_MIME_TYPE,
      'Content-Disposition': `attachment; filename="${generateFileName(resource, weekEnding)}"`
    }
  });
};
