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

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  }
</script>

<div
  onclick={toggle}
  onkeydown={handleKeydown}
  role="button"
  tabindex="0"
  class="pl-3 mb-4 cursor-pointer transition-colors"
  style:border-left={`2px solid ${open ? accentColor : "#374151"}`}
>
  <div class="flex items-start gap-2">
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
  </div>
  {#if open}
    <p class="text-sm text-gray-400 italic leading-relaxed mt-2 ml-4">
      {detail}
    </p>
  {/if}
</div>
