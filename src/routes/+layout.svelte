<script lang="ts">
  import '../app.css';
  import { Toaster } from '$lib/components/ui/sonner';

  let { children } = $props();
</script>

<main class="flex h-full items-center justify-center p-4">
  <Toaster />
  {@render children?.()}
</main>
