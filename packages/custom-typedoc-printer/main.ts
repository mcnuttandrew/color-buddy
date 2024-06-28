import fs from "fs/promises";
import TypeDoc from "typedoc";

function MethodDisplay(x: TypeDoc.Models.DeclarationReflection): string {
  let textComment = x.comment?.summary[0].text || "";
  if (textComment) {
    textComment = `\n__Description__: ${textComment}\n`;
  }
  let sig = "";
  if (x.kind === TypeDoc.ReflectionKind.Method) {
    sig = (x.signatures || [])
      ?.map((signature) => {
        const params = signature.parameters
          ?.map((param) => `${param.name}: ${param.type}`)
          .join(", ");
        return `\`${signature.name}(${params}) => ${signature.type?.toString()}\``;
      })
      .join("\n");
  } else {
    sig = x.toString().split(" ").slice(2).join(" ");
  }
  return `**${x.toString().split(" ")[0]}** ${x.name}: ${sig} ${textComment}`;
}

async function main() {
  // get the command line arguments
  const args = process.argv.slice(2);
  // check if the main.ts file exists
  let targetFile = args[0];
  try {
    await fs.access(`${targetFile}main.ts`);
  } catch (e) {
    // try adding src/ to the path
    targetFile = `${targetFile}src/`;
    try {
      await fs.access(`${targetFile}main.ts`);
    } catch (e) {
      console.error("Could not find the main.ts file");
      process.exit(1);
    }
  }

  const app = await TypeDoc.Application.bootstrap({
    entryPoints: [`${targetFile}main.ts`],
    tsconfig: `${args[0]}tsconfig.json`,
  });
  const project = await app.convert();
  if (!project) {
    throw new Error("Project is undefined");
  }

  //   generate the documentation for the exported functions
  const generatedFunctions = [] as string[];
  const generatedTypes = [] as string[];
  const generatedClasses = [] as string[];
  for (const child of project.children || []) {
    if (child.kind === TypeDoc.ReflectionKind.Function) {
      child.signatures?.forEach((signature) => {
        //   generate a simple type sig
        const params = signature.parameters
          ?.map((param) => {
            return `${param.name}: ${param.type}`;
          })
          .join(", ");
        const textComment = signature.comment?.summary[0].text;
        const doc = `
### ${signature.name}
**Function**: \`${signature.name}(${params}) => ${signature.type?.toString()}\`

${textComment ? `**Description**: ${textComment}\n` : ""}`;
        generatedFunctions.push(doc);
      });
    } else if (child.kind === TypeDoc.ReflectionKind.Class) {
      const textComment = child.comment?.summary[0].text;
      const staticMethods = child.children?.filter((x) => x.flags.isStatic);
      const localMethods = child.children
        ?.filter((x) => !x.flags.isStatic)
        .filter(
          (x) =>
            !x.toString().includes("Constructor") &&
            !x.toString().includes("Property")
        );
      const properties = child.children
        ?.filter((x) => x.kind === TypeDoc.ReflectionKind.Property)
        .filter((x) => !x.flags.isStatic);

      const comment =
        child.comment?.summary.map((x) => x.text || "").join("\n") || "";

      const doc = `
### ${child.name}
${comment}

**Class**: \`${child.name}\`

Constructor:
${child.children
  ?.filter((x) => x.kind === TypeDoc.ReflectionKind.Constructor)
  .map((x) => {
    return `**Constructor**: \`${x.name}(${x.signatures || []})\``;
  })
  .join("\n")}

Properties:
${properties?.map((x) => MethodDisplay(x)).join("\n")}

Non-static:
${localMethods?.map((x) => MethodDisplay(x)).join("\n")}

Static:
${staticMethods?.map((x) => MethodDisplay(x)).join("\n")}

${textComment ? `**Description**: ${textComment}\n` : ""}`;
      generatedClasses.push(doc);
    } else if (child.kind === TypeDoc.ReflectionKind.TypeAlias) {
      const textComment = child.comment?.summary[0].text;
      const type = child.type?.toString();
      const doc = `
### ${child.name}
**Type**: \`${child.name}: ${type}\`

${textComment ? `**Description**: ${textComment}\n` : ""}`;
      generatedTypes.push(doc);
    }
  }

  //   generate the read me

  const readme = (project.readme || []).map((x) => x.text).join("\n");
  const prefix = readme.split("## Contents")[0];
  const suffix = readme.split("## Usage")[1];

  let functionSection = "";
  if (generatedFunctions.length > 0) {
    functionSection = `
This library contains the following functions:

${generatedFunctions.join("\n\n\n")}
`;
  }

  let typeSection = "";
  if (generatedTypes.length > 0) {
    typeSection = `
This library contains the following types:

${generatedTypes.join("\n\n\n")}
`;
  }

  let classSection = "";
  if (generatedClasses.length > 0) {
    classSection = `
This library contains the following classes:

${generatedClasses.join("\n\n\n")}
`;
  }

  const newReadme = `${prefix.trim()}

## Contents

${functionSection}

${typeSection}

${classSection}

## Usage
${suffix.trim()}
`;

  const trimmedReadme = newReadme.trim().replaceAll("\n\n\n", "\n\n");

  await fs.writeFile(`${args[0]}README.md`, trimmedReadme);
}
main();
