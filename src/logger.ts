import chalk from 'chalk';

export function error(...args: unknown[]) {
  console.log(chalk.red(...args));
}

export function warn(...args: unknown[]) {
  console.log(chalk.yellow(...args));
}

export function info(...args: unknown[]) {
  console.log(chalk.cyan(...args));
}

export function success(...args: unknown[]) {
  console.log(chalk.green(...args));
}

export function highlight(...args: unknown[]) {
  return chalk.cyan(...args);
}

export function log(...args: unknown[]) {
  console.log(...args);
}

export const ServiceLogger = (serviceName: string) =>
  <const>{
    log: (...args: string[]) => console.log(chalk.gray(`[${serviceName}]`), chalk.red(...args)),
    error: (...args: string[]) => console.log(chalk.gray(`[${serviceName}]`), chalk.red(...args)),
    warn: (...args: string[]) => console.log(chalk.gray(`[${serviceName}]`), chalk.yellow(...args)),
    info: (...args: string[]) => console.log(chalk.gray(`[${serviceName}]`), chalk.cyan(...args)),
    success: (...args: string[]) =>
      console.log(chalk.gray(`[${serviceName}]`), chalk.green(...args)),
    highlight: (...args: string[]) => chalk.cyan(...args)
  };

export default {
  error,
  warn,
  info,
  success,
  highlight,
  log,
  green: chalk.green,
  yellow: chalk.yellow,
  red: chalk.red,
  gray: chalk.gray,
  cyan: chalk.cyan,
  blue: chalk.blue,
  magenta: chalk.magenta,
  white: chalk.white,
  black: chalk.black,
  bgGreen: chalk.bgGreen,
  bgYellow: chalk.bgYellow,
  bgRed: chalk.bgRed,
  bgGray: chalk.bgGray,
  bgCyan: chalk.bgCyan,
  bgBlue: chalk.bgBlue,
  bgMagenta: chalk.bgMagenta,
  bgWhite: chalk.bgWhite,
  bgBlack: chalk.bgBlack
};
