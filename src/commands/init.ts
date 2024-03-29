import { BUILD_OUTPUT_DIR } from '@/constants.ts';
import logger from '@/logger.ts';
import { fsAccess } from '@/utils/fs-access.ts';
import { getPackageInfo } from '@/utils/get-package-info.ts';
import { getPackageManager } from '@/utils/get-package-manager.ts';
import { handleError } from '@/utils/handle-error.ts';
import { namedMicroservice } from '@/utils/templates.ts';
import chalk from 'chalk';
import { Command } from 'commander';
import { execa } from 'execa';
import { promises } from 'node:fs';
import path from 'node:path';
import ora from 'ora';
import { z } from 'zod';

export const init = new Command()
  .command('init')
  .description('Initialize your project.')
  .option(
    '--nodep',
    'skip installing dependencies. useful if you want to install dependencies yourself.',
    false
  )
  .option(
    '--package-manager <package-manager>',
    'the package manager to use. defaults to the detected package manager.'
  )
  .option(
    '-c, --cwd <cwd>',
    'the working directory. defaults to the current directory.',
    process.cwd()
  )
  .action(async (opts) => {
    logger.log('');

    try {
      const options = z
        .object({
          nodep: z.boolean().default(false),
          packageManager: z.string().optional(),
          cwd: z.string().default(process.cwd())
        })
        .parse(opts);

      const cwd = path.resolve(options.cwd);
      const servicesPath = path.join(cwd, 'services');

      if (!(await fsAccess(servicesPath))) {
        await promises.mkdir(servicesPath);
      }

      const helloPath = path.join(servicesPath, '+hello.service.ts');
      if (!(await fsAccess(helloPath))) {
        await promises.writeFile(helloPath, namedMicroservice('hello'));
      }

      await updateGitignore();

      // install dependencies
      if (options.nodep) {
        logger.log('');
        logger.info(chalk.yellow('Warning!'), 'Dependencies not installed.');
        logger.log('');
      } else {
        const dependenciesSpinner = ora(`Installing dependencies...`)?.start();

        const packageManager = options.packageManager ?? (await getPackageManager(cwd));
        const deps = ['@litehex/taskflow'];

        if (!(await fsAccess(path.join(cwd, 'package.json')))) {
          await execa(packageManager, [packageManager === 'npm' ? 'init' : 'init', '-y'], {
            cwd: options.cwd
          });
        }

        await execa(packageManager, [packageManager === 'npm' ? 'install' : 'add', ...deps], {
          cwd: options.cwd
        });

        await addScripts(options.cwd);

        dependenciesSpinner?.succeed('Done!');
        logger.log('');
      }

      logger.info(chalk.green('Success!'), 'Project initialized.');
      logger.log('');
    } catch (e) {
      handleError(e);
    }
  });

async function updateGitignore() {
  if (await fsAccess('.gitignore')) {
    const gitignore = (await promises.readFile('.gitignore')).toString();
    const hasMicroservice = gitignore.includes(BUILD_OUTPUT_DIR);
    const hasEnv = gitignore.includes('.env');
    if (!hasMicroservice) {
      await promises.appendFile(
        '.gitignore',
        ['', '# TaskFlow', hasMicroservice ? false : BUILD_OUTPUT_DIR, hasEnv ? false : '.env', '']
          .filter(Boolean)
          .join('\n')
      );
    }
  }
}

async function addScripts(cwd: string) {
  const packageInfo = (await getPackageInfo(cwd)) ?? {};

  const scripts = {
    start: 'taskflow start',
    build: 'taskflow build',
    dev: 'taskflow dev'
  };

  if (!packageInfo?.scripts) {
    packageInfo.scripts = {};
  }

  // if there are already scripts with the same name, add "taskflow" prefix
  let hasConflicts = false;
  for (const scriptName of Object.keys(scripts)) {
    if (packageInfo.scripts[scriptName]) {
      hasConflicts = true;
      break;
    }
  }

  // add scripts
  for (const scriptName of Object.keys(scripts)) {
    packageInfo.scripts[hasConflicts ? `taskflow:${scriptName}` : scriptName] =
      packageInfo.scripts[scriptName];
  }

  await promises.writeFile('package.json', JSON.stringify(packageInfo, null, 2) + '\n', 'utf-8');
}
