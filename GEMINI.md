# Overview

Vocab is a quiz cards app for learning vocabulary in foreign languages

# Data

* Hard coded in data.js as a single object `data`
* Has many groups such as "adjectives", "kitchen nouns", "adverbs" etc
* Each group is an array of objects like {en: "go", de: "gehen", fr: "aller"} - this is word "go" translated to each language
* Use ISO 639-1 two-letter codes for languages
* There is no database or any other external source of data
* Get the list of languages from data.js

# UX

## Setup screen

* Let user select one language as "my language" and N languages as "foreign languages"
* Once selection is made, user hits START button and the app goes to quiz mode

## Quiz Mode

* Each card is a multiple choice question
* Randomize languages, groups and order of choices
* Generate a card with one word from a foreign language and 6 random translations in my language
  * 1 should be correct translation, 1 should be from another group and remaining 4 should be from the correct group
  * The word in foreign language should not appear again for at least 20 subsequent quizes
* User gets only one attempt per quiz
* After user picks:
  * the card's background turns green if correct and red if incorrect
  * current card moves to the left to make space for a new card
  * a new quiz card pops on the screen
* Let user press RESTART if they want to reset and go back to setup screen

# Implementation

* Javascript, to be hosted on github pages but should also work locally
* Should work on desktop and mobile
* Make clickable text and buttons reasonably big so that it's easy to click or tap
* Use animation for transition
* Pick soft colors
* Maintain counter as "X / Y" (X - correct, Y - total) which resets on entering setup screen
