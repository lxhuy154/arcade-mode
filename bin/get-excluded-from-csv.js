#! /usr/bin/env node

/*
 * Generates a list of excluded challenges from given task CSV file. This
 * file can be given to bin/js2json_challenges.js with --exclude to filter out
 * unwanted challenges.
 *
 * PREREQUISITES: You should export Task Progress Google Sheet as CSV file and
 * save it in the folder where you run this script (git repo root).
 */

const csv = require('csv-parser');
const fs = require('fs');

const fnames = process.argv.slice(2);

const notExcludedRe = /(wip|on hold)/;
// let numExcluded = 0;

const rosettaPath = 'client/scripts/challenges/rosettacode/preformatted';
const dirPerLetter = fs.readdirSync(rosettaPath);

let allFiles = [];
dirPerLetter.forEach(letter => {
  allFiles = allFiles.concat(fs.readdirSync(`${rosettaPath}/${letter}`));
});

const minLength = 6;

const processCsv = fname => {
  const included = [];
  const notExcluded = [];
  const excluded = [];

  fs.createReadStream(fname)
  .pipe(csv())
  .on('data', data => {
    // console.log(data);
    if (data.Decision === 'include') {
      included.push(data);
    }
    else if (notExcludedRe.test(data.Decision) || data.Decision === '') {
      notExcluded.push(data);
    }
    else if (data['Task Name']) {
      excluded.push(data['Task Name']);
    }
  })
  .on('end', () => {
    processData(excluded);
  });
};

fnames.forEach(fname => {
  processCsv(fname);
});

function processData(excluded) {
  const regExp = new RegExp("([ a-zA-Z0-9_\\-.&!']+)$");
  excluded.forEach(taskName => {
    const fileEnding = taskName.match(regExp)[1];
    if (fileEnding.length >= minLength) {
      console.log(fileEnding);
    }
  });
}

