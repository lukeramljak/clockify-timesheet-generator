<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import TimesheetForm from '$lib/components/timesheet-form/timesheet-form.svelte';
  import Guidelines from '$lib/components/timesheet-form/guidelines.svelte';

  let { data }: { data: PageData } = $props();
</script>

<form method="POST" action="?/reset" use:enhance class="absolute top-4 right-4">
  <Button type="submit" variant="destructive">Reset All Data</Button>
</form>

<div class="flex flex-col items-center gap-4">
  <TimesheetForm {data} />
  <Guidelines />
</div>
