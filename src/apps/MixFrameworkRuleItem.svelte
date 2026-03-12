<script lang="ts">
  interface Props {
    rule: string;
    detail: string;
    accentColor: string;
  }

  const { rule, detail, accentColor }: Props = $props();

  let open = $state(false);

  function toggle(): void {
    open = !open;
  }
</script>

<div
  class="pl-3 mb-4 transition-colors"
  style:border-left={`2px solid ${open ? accentColor : "#374151"}`}
>
  <button
    type="button"
    onclick={toggle}
    aria-expanded={open}
    class="flex items-start gap-2 w-full text-left cursor-pointer bg-transparent border-0 p-0"
  >
    <span
      class="text-xs mt-1 shrink-0 transition-colors"
      class:text-gray-500={!open}
      style:color={open ? accentColor : undefined}
    >
      {open ? "▾" : "▸"}
    </span>
    <span
      class="text-sm leading-relaxed transition-colors"
      class:text-gray-200={open}
      class:text-gray-400={!open}
    >
      {rule}
    </span>
  </button>
  {#if open}
    <p class="text-sm text-gray-400 italic leading-relaxed mt-2 ml-4">
      {detail}
    </p>
  {/if}
</div>
