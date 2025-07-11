Build ready to start ▶️
>> Cloning github.com/nizartitwaniii/telegram-lua-script-protector.git commit sha b7273e6f11775b0a689e748f7a2d3c2259c36f60 into /builder/workspace
Initialized empty Git repository in /builder/workspace/.git/
From https://github.com/nizartitwaniii/telegram-lua-script-protector
 * branch            b7273e6f11775b0a689e748f7a2d3c2259c36f60 -> FETCH_HEAD
HEAD is now at b7273e6 Add package-lock.json
Starting Docker daemon...
Waiting for the Docker daemon to start...
done
Timer: Analyzer started at 2025-07-10T23:59:44Z
Image with name "registry01.prod.koyeb.com/k-ee1d9d56-4ba8-4bb0-8943-8925d3f2848b/b4b09da4-3d29-46c3-a4e5-2f7a3adbf204" not found
Timer: Analyzer ran for 278.148406ms and ended at 2025-07-10T23:59:44Z
Timer: Detector started at 2025-07-10T23:59:44Z
2 of 5 buildpacks participating
heroku/nodejs-engine      3.6.5
heroku/nodejs-npm-install 3.6.5
Timer: Detector ran for 133.768949ms and ended at 2025-07-10T23:59:45Z
Timer: Restorer started at 2025-07-10T23:59:45Z
Layer cache not found
Timer: Restorer ran for 229.004131ms and ended at 2025-07-10T23:59:45Z
Timer: Builder started at 2025-07-10T23:59:46Z

[1;35m## Heroku Node.js Engine[0m

- Checking Node.js version
  - Node.js version not specified, using `[0;33m22.x[0m`
  - Resolved Node.js version: `[0;33m22.15.1[0m`
- Installing Node.js distribution
  - Downloading Node.js `[0;33m22.15.1 (linux-amd64)[0m` from [1;4;36mhttps://nodejs.org/download/release/v22.15.1/node-v22.15.1-linux-x64.tar.gz[0m[2;1m .[0m[2;1m.[0m[2;1m. [0m(< 0.1s)
  - Verifying checksum
  - Extracting Node.js `[0;33m22.15.1 (linux-amd64)[0m`
  - Installing Node.js `[0;33m22.15.1 (linux-amd64)[0m`[2;1m .[0m[2;1m.[0m[2;1m. [0m(< 0.1s)
- Done (finished in 1.1s)

[1;35m## Heroku Node.js npm Install[0m

- Installing node modules
  - Using npm version `[0;33m10.9.2[0m`
  - Creating npm cache
  - Configuring npm cache directory
  - Running `[0;33m[1;36mnpm ci "--production=false"[0m`

      npm warn config production Use `--omit=dev` instead.
      npm error code EUSAGE
      npm error
      npm error The `npm ci` command can only install with an existing package-lock.json or
      npm error npm-shrinkwrap.json with lockfileVersion >= 1. Run an install with npm@5 or
      npm error later to generate a package-lock.json file, then try again.
      npm error
      npm error Clean install a project
      npm error
      npm error Usage:
      npm error npm ci
      npm error
      npm error Options:
      npm error [--install-strategy <hoisted|nested|shallow|linked>] [--legacy-bundling]
      npm error [--global-style] [--omit <dev|optional|peer> [--omit <dev|optional|peer> ...]]
      npm error [--include <prod|dev|optional|peer> [--include <prod|dev|optional|peer> ...]]
      npm error [--strict-peer-deps] [--foreground-scripts] [--ignore-scripts] [--no-audit]
      npm error [--no-bin-links] [--no-fund] [--dry-run]
      npm error [-w|--workspace <workspace-name> [-w|--workspace <workspace-name> ...]]
      npm error [-ws|--workspaces] [--include-workspace-root] [--install-links]
      npm error
      npm error aliases: clean-install, ic, install-clean, isntall-clean
      npm error
      npm error Run "npm help ci" for more info
      npm error A complete log of this run can be found in: /layers/heroku_nodejs-npm-install/npm_cache/_logs/2025-07-10T23_59_47_606Z-debug-0.log

  - Done (0.1s)

- [1;36mDebug Info:[0m
  - Command failed `npm ci "--production=false"`
    exit status: 1
    stdout: <see above>
    stderr: <see above>

[0;31m! Failed to install Node modules[0m
[0;31m![0m
[0;31m! The Heroku Node.js npm Install buildpack uses the command `[0;33mnpm ci "--production=false"[0m[0;31m` to install your Node modules. This command failed and the buildpack cannot continue. This error can occur due to an unstable network connection. See the log output above for more information.[0m
[0;31m![0m
[0;31m! Suggestions:[0m
[0;31m! - Ensure that this command runs locally without error (exit status = 0).[0m
[0;31m! - Check the status of the upstream Node module repository service at https://status.npmjs.org/[0m
[0;31m![0m
[0;31m! Use the debug information above to troubleshoot and retry your build.[0m


Timer: Builder ran for 1.619303107s and ended at 2025-07-10T23:59:47Z
[31;1mERROR: [0mfailed to build: exit status 1
Build failed ❌
