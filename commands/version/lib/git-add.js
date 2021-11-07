"use strict";

const fs = require("fs");
const log = require("npmlog");
const path = require("path");
const slash = require("slash");
const childProcess = require("@lerna/child-process");

module.exports.gitAdd = gitAdd;

/**
 * @param {string[]} changedFiles
 * @param {{ granularPathspec: boolean; }} gitOpts
 * @param {import("@lerna/child-process").ExecOpts} execOpts
 * @return {boolean} true if used submodules, false if not
 */
function gitAdd(changedFiles, gitOpts, execOpts) {
  // granular pathspecs should be relative to the git root, but that isn't necessarily where lerna lives
  const files = gitOpts.granularPathspec
    ? changedFiles.map((file) => slash(path.relative(execOpts.cwd, path.resolve(execOpts.cwd, file))))
    : ".";

  const directories = new Set();

  try {
    if (fs.existsSync( path.resolve(execOpts.cwd, '.gitmodules') )) {
      console.log("Adding one-by-one for sub modules");
      log.silly("gitAdd", files);
      const addProcesses = [];

      for(const file of files) {
        const directory = path.resolve( execOpts.cwd, path.dirname(file) );
        const filename = path.basename(file);
        directories.add(directory);

        addProcesses.push( 
          childProcess.exec("git", ["add", "--", filename], { ...execOpts, cwd: directory } )
        );
      }

      return Promise.all(addProcesses).then( () => true );
    } else {
      console.log("Adding at once");
      log.silly("gitAdd", files);
      return childProcess.exec("git", ["add", "--", ...files], execOpts).then( () => false );
    }
  } catch(err) {
    console.error(err)
  }

}
