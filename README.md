# remote-ts

## Why?

I had a project which required types from another project.
So I created this simple CLI tool to copy the types from the other project to my project.
It works by copying the types from the other project to a `.remote-ts` folder in my project.
Enjoy. 😊

## Usage

1. Write the import path to the TS file you want to import
Make sure the import path is a relative path to `.remote-ts` which would be generated after running the CLI.

```ts
import { myTSVariable } from "./.remote-ts/my-private-project/path-to-file.ts";
//       ^? string

console.log(myTSVariable); // "Hello World!"
```

Run the CLI to copy the code from your `my-private-project` folder to your project.

```bash
npx remote-ts sync
```

This library requires you to have all of your personal code projects in individual folders all under a root projects folder.
If you haven't run the CLI before, it will ask you where your collection projects are located, and this is how it will infer to your projects.
