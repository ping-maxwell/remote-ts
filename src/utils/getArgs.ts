import yargs from "yargs";

const { argv } = yargs(process.argv);
//@ts-ignore
argv._.shift();
//@ts-ignore
argv._.shift();

export const getArgs = () => argv;
