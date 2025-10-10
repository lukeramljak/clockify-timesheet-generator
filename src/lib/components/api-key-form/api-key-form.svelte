<script lang="ts">
  import * as Form from '$lib/components/ui/form';
  import { Input } from '$lib/components/ui/input';
  import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
  import { formSchema, type FormSchema } from './schema';
  import { zod4Client } from 'sveltekit-superforms/adapters';

  let { data }: { data: { form: SuperValidated<Infer<FormSchema>> } } = $props();

  const form = superForm(data.form, {
    validators: zod4Client(formSchema)
  });

  const { form: formData, enhance, submitting } = form;
</script>

<form method="POST" use:enhance class="flex w-full max-w-md flex-col justify-center gap-2">
  <Form.Field {form} name="apiKey">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Clockify API Key</Form.Label>
        <p class="text-xs text-muted-foreground">
          Get one at
          <a href="https://app.clockify.me/manage-api-keys" target="_blank"
            >https://app.clockify.me/manage-api-keys</a
          >
        </p>
        <Input
          {...props}
          bind:value={$formData.apiKey}
          placeholder="Enter API key..."
          disabled={$submitting}
        />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Button disabled={$submitting}
    >{#if $submitting}Submitting...{:else}Submit{/if}</Form.Button
  >
</form>
