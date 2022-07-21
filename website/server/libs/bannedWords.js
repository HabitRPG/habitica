/* eslint-disable no-multiple-empty-lines */

// CONTENT WARNING:
//
// This file contains slurs, swear words, religious oaths, and words related
// to addictive substance and adult topics.
// Do not read this file if you do not want to be exposed to those words.
//
// The words are stored in an array called `bannedWords` which is then
// exported with `module.exports = bannedWords;`
// This file does not contain any other code.
//
//
// EDIT WARNING:
//
// If you think this file needs to be changed please do NOT create a
// pull request or issue in GitHub!
// Email admin@habitica.com to discuss the change you want made.
//
// All updates to this file must be done through a direct commit to limit
// the words visibility in GitHub to protect our coders, socialites, and
// wiki editors who look through PRs for information.
//
// When adding words that contain asterisks, put two backslashes before them.
//
// Do NOT enter any words with $ signs. E.g., "i$$" cannot be on the list
// because it would cause the word "I" to be blocked. Escaping $ signs with
// backslashes doesn't work.























// Do not block the following words:
// 'ale' because it's Polish for 'but'.
// 'af' because it's Danish for 'of'.
// 'fu' and 'fuq' because they have legitimate meanings in English and/or other languages.
// 'tard' because it's French for 'late' and there's no common synonyms.
// 'god' because it is allowed for use in ways that are not oaths.
// Tobacco products because they are more often mentioned when celebrating
// quitting than in a way that might trigger addictive behaviour.
// Legitimate given names: 'Jesus', 'Sherry'
// Legitimate surnames: 'Christ', 'Mead'
// Legitimate place names: 'Dyke'
//
// Explanations for some blocked words:
// 'fag' means 'subject' in some Scandinavian languages but
// we have decided to block it for its use as an English-language slur;
// hopefully the Scandinavian languages have suitable synonyms.
// 'slut' means 'end' in Danish but is blocked for the same reason as 'fag'.
// These words are blocked from use in the Tavern but do not appear in bannedSlurs.js
// because we do not want people to be automatically muted when the words are used
// appropriately in guilds.
// As of 2020-02-26, 'sluts' is also here rather than in bannedSlurs.js because
// "Expanded Party: Polyamorous Adventurers" guild (17bb8393-2d74-42de-8dcb-315a5f596636)
// wants to discuss https://en.wikipedia.org/wiki/The_Ethical_Slut (a book) and
// we've decided to allow that.
// As of 2020-06-06, 'nigga' and 'niggas' are here rather than in bannedSlurs.js because
// we've found that in private they are far more often used in a reclaimed way than as slurs.


// DO NOT EDIT! See the comments at the top of this file.
const bannedWords = [
  'TESTPLACEHOLDERSWEARWORDHERE',
  'TESTPLACEHOLDERSWEARWORDHERE1',




  'damn',
  'goddamn',
  'damnit',
  'dammit',
  'damned',
  'omfg',

  'bugger',
  'buggery',
  'buggering',
  'buggered',
  'bullshit',
  'bullshiter',
  'bullshitter',
  'bullshiting',
  'bullshitting',
  'shiz',
  'shit',
  'shite',
  'shits',
  'shitty',
  'shitting',
  'shithole',
  'shitface',
  'shitfaced',
  'shitload',
  'sh\\*t',
  'sh\\*tty',
  'sh\\*tting',
  'fuck',
  'fucks',
  'fucking',
  'fucked',
  'fuckwit',
  'fucker',
  'fuckers',
  'f\\*ck',
  'fuckhead',
  'fuckheads',
  'motherfucker',
  'motherfuckers',
  'motherfucking',
  'muthafucka',
  'dafuq',
  'wtf',
  'stfu',

  'ass',
  'arse',
  'asshole',
  'badass',
  'kickass',
  'arsehole',
  'badarse',
  'kickarse',
  'lmao',
  'lmfao',

  'bitch',
  'bitchy',
  'bitches',
  'bitching',
  'b\\*tch',

  'fag',
  'slut',
  'sluts',
  'nigga',
  'niggas',
  'bastard',
  'bastards',

  'rape',
  'raped',
  'raping',
  'r\\*pe',
  'r\\*ped',
  'r\\*ping',
  'blowjob',
  'rimjob',
  'handjob',
  'cunnilingus',
  'fellatio',
  'sodomy',
  'milf',
  'cocksucker',
  'cocksucking',
  'fap',
  'nofap',
  'no fap',
  'no-fap',
  'fapping',
  'no nut',
  'no-nut',
  'no-nut-november',
  'nutting',
  'nuttin',
  'masturbate',
  'masturbates',
  'masturbating',
  'masturbation',

  'heroin',
  'cocaine',
];

export default bannedWords;
