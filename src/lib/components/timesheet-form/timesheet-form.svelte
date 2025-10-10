<script lang="ts">
  import { getLastNFridays, parseDateString } from '$lib/utils/date';
  import { DateFormatter, getLocalTimeZone } from '@internationalized/date';
  import * as Form from '$lib/components/ui/form';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Input } from '$lib/components/ui/input';
  import * as Select from '$lib/components/ui/select';
  import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
  import { formSchema, type FormSchema } from './schema';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { toast } from 'svelte-sonner';

  let { data }: { data: { form: SuperValidated<Infer<FormSchema>> } } = $props();

  const form = superForm(data.form, {
    validators: zod4Client(formSchema),
    resetForm: false,
    onUpdated({ form }) {
      if (form.message === 'success') {
        const params = new URLSearchParams({
          resource: $formData.resource,
          callNo: $formData.callNo,
          includeProjectName: String($formData.includeProjectName),
          weekEnding: $formData.weekEnding
        });

        window.location.href = `/timesheet/download?${params.toString()}`;
      } else if (form.message) {
        toast.error(form.message);
      }
    }
  });

  const { form: formData, enhance, submitting } = form;

  const df = new DateFormatter('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
</script>

<form method="POST" action="?/export" use:enhance class="w-[250px] space-y-4">
  <Form.Field {form} name="resource">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Resource</Form.Label>
        <Input {...props} bind:value={$formData.resource} autocomplete="off" />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Field {form} name="callNo">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Call No</Form.Label>
        <Input {...props} bind:value={$formData.callNo} autocomplete="off" />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Field {form} name="weekEnding">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Week Ending</Form.Label>
        <Select.Root type="single" bind:value={$formData.weekEnding} name={props.name}>
          <Select.Trigger {...props} class="w-full">
            {$formData.weekEnding
              ? df.format(parseDateString($formData.weekEnding))
              : 'Pick a date'}
          </Select.Trigger>
          <Select.Content class="max-h-[250px]">
            {#each getLastNFridays(12) as friday (friday)}
              <Select.Item value={friday.toString()}>
                {df.format(friday.toDate(getLocalTimeZone()))}
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Field {form} name="includeProjectName">
    <Form.Control>
      {#snippet children({ props })}
        <div class="flex flex-row items-start space-x-3">
          <Checkbox {...props} bind:checked={$formData.includeProjectName} />
          <Form.Label>Include project name</Form.Label>
        </div>
      {/snippet}
    </Form.Control>
  </Form.Field>

  <Form.Button disabled={$submitting} class="w-full">
    {#if $submitting}
      Exporting...
    {:else}
      Export
    {/if}
  </Form.Button>
</form>
