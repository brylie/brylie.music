# Apps Directory Standards

This directory (`src/apps/`) contains standalone, interactive musical applications.

## Core Principles

1. **Encapsulation**: Each app should be self-contained within this directory.
    - Avoid importing from `src/components/`, `src/utils/`, or `src/stores/` unless absolutely necessary (e.g., global types or theme constants).
    - The goal is to make these apps portable and potentially extractable into their own packages or repositories.

2. **Separation of Concerns**:
    - **Logic (`.ts`)**: Pure TypeScript files for business logic, audio engines, and algorithms.
    - **Presentation (`.svelte`)**: Svelte components for UI, rendering, and inputs.
    - **Testing (`.test.ts`)**: Co-located unit tests for the logic.

3. **Integration**:
    - Apps are exposed to the website via MDX files in `src/content/apps/`.
    - The MDX file handles the routing and metadata, importing the Svelte component from here.

## File Structure Pattern

For an app named `MyCoolApp`:

- **`MyCoolApp.svelte`**: The main UI entry point.
- **`myCoolApp.ts`**: The core logic (classes, functions, interfaces).
- **`myCoolApp.test.ts`**: Unit tests for `myCoolApp.ts`.

## Coding Conventions

### TypeScript & Type Safety

- **Strict Typing**: Enable `strict` mode. No implicit `any`.
- **Interfaces**: Define clear interfaces for your data structures and state.

    ```typescript
    export interface AppState {
      tempo: number;
      isPlaying: boolean;
    }
    ```

- **Return Types**: Explicitly type function return values.

### Testing

- **Mandatory Logic Tests**: Every `.ts` logic file must have a corresponding `.test.ts` file.
- **Coverage**: Aim for high coverage of business logic.
- **Mocking**: Use `vi.fn()` and `vi.spyOn()` for external dependencies (like `AudioContext`).

### Svelte Components

- **Runes**: Use Svelte 5 runes (`$state`, `$derived`, `$effect`) for reactivity.
- **Styling**: Use Tailwind CSS for styling.
- **Accessibility**: Ensure all interactive elements have `aria-label` or visible labels.

## Workflow

1. **Design types**: Start by defining the interfaces in the `.ts` file.
2. **Implement logic**: Write the pure TS logic.
3. **Test logic**: Write unit tests to verify the logic.
4. **Build UI**: Create the Svelte component and connect it to the logic.
5. **Document**: Create the MDX entry in `src/content/apps/`.
