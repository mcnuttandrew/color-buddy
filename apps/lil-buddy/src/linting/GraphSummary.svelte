<script lang="ts">
  import { GenerateAST } from "color-buddy-palette-lint";
  import type { LintProgram } from "color-buddy-palette-lint";
  export let lint: LintProgram;
  $: ast = getAST(lint.program);
  function getAST(lint: string) {
    try {
      const ast = (GenerateAST(JSON.parse(lint) as any).value as any)
        .children[0] as any;
      return ast;
    } catch (e) {
      console.error(e);
    }
  }

  $: console.log(ast);
</script>
