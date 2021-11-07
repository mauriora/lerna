"use strict";

const fs = require("fs");
const log = require("npmlog");
const path = require("path");
const childProcess = require("@lerna/child-process");

module.exports.gitCheckout = gitCheckout;

/**
 * Reset files modified by publish steps.
 * @param {string[]} stagedFiles
 * @param {{ granularPathspec: boolean; }} gitOpts
 * @param {import("@lerna/child-process").ExecOpts} execOpts
 */
function gitCheckout(stagedFiles, gitOpts, execOpts) {
  const files = gitOpts.granularPathspec ? stagedFiles : ".";

  try {
    if (fs.existsSync( path.resolve(execOpts.cwd, '.gitmodules') )) {
      console.log("Checking out one-by-one for sub modules");
      log.silly("gitCheckout sub modules", files);
      const addProcesses = [];

      for(const file of files) {
        const directory = path.resolve( execOpts.cwd, path.dirname(file) );
        const filename = path.basename(file);
        directories.add(directory);

        addProcesses.push( 
          childProcess.exec("git", ["checkout", "--", filename], { ...execOpts, cwd: directory } )
        );
      }

      return Promise.all(addProcesses);
    } else {
      console.log("Checking out at once");
      log.silly("gitCheckout", files);
      return childProcess.exec("git", ["checkout", "--", ...files], execOpts);
    }
  } catch(err) {
    console.error(err)
  }
}
