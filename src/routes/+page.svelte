<script lang="ts">
  import type { PageData } from './$types';
  import ApiKeyForm from '$lib/components/api-key-form/api-key-form.svelte';

  let { data }: { data: PageData } = $props();
</script>

<ApiKeyForm {data} />
