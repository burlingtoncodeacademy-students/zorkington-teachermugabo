/**
 * FILE ORGANIZATION
 *  0) IMPORTS
 *  1) HELPER METHODS
 *  2) GAME SETUP
 *  3) GAME LOGIC
 *  4) EXECUTION (calls game logic)
 *
 * PROJECT STORIES
 * > Introductory text @ launch [done]
 * > Deal with 'unknown commands' [done]
 * >
 */

const ask = require("./scripts/ask"); // util to prompt & collect user input
const {
  isValidLocation,
  isValidNextLocation,
  getOfficialLocationName,
  getLocationDescription,
  isItemHere,
} = require("./locations"); // import Locations & interface methods

const {
  isItem,
  getItem,
  getItemName,
  getItemDescription,
  isItemTakeable,
} = require("./items"); // import Items & interface

// get our user object(must be mutable)
let player = require("./player");

/** ======================== HELPER METHODS ========================== */

/**
 * Name: preprocessUserInput
 *
 * Does initial cleaning of user input (user request).
 * Particularly helping with accomodating "go" and "go to"
 * when the general user request pattern is "[action] [target]"
 * where both action and target are atomic.
 *
 * @param {String} input
 * @returns {{String, String}} action and target object
 */
const preprocessUserInput = (rawInput) => {
  let action = "",
    target = ""; // init variables

  // quick & dirty sanitizing
  let inputArray = rawInput.trim().toLowerCase().split(" ");

  // grab action (first work)
  action = inputArray[0];

  // add ability to process "go to"
  if (action === "go" && inputArray[1] === "to") {
    action = "go to";
    target = inputArray.slice(2).join(" "); // the rest
  }
  // if action is not "go to", expect single word for command
  else {
    // if action is simply "go", mapping it to "go to"
    if (action === "go") action = "go to";

    // with a single word for action, the rest = target/object
    target = inputArray.slice(1).join(" ");
  }

  return { action, target };
};

/**
 * lookAround - helper method to encapsulate examining a location.
 * Simply prints out to console.
 *
 * @param {String} location
 */
const lookAround = (location) => {
  console.log(getLocationDescription(player.currentLocation));
};

/** ======================== GAME LOGIC ========================== */

/**
 * isValidPlayerAction - predicate  method that validates user actions
 *
 * @param {String} action
 * @returns {Boolean}
 */
const isValidPlayerAction = (action) => player.actions.includes(action);

/**
 * goTo - game logic method - handles movements in the game.
 *
 * @param {String} target - next location
 */
const goTo = (target) => {
  // check #1 - is this target a valid location
  // check/handle if valid location - use friendly map to allow
  // for many names for the same location :-)
  if (isValidLocation(target)) {
    // check/handle if allowed transition
    // TODO story -- when leaving main entrance to cart room, main entrance locks!
    //               can't leave w/o the shopping list fully checked off!
    // TODO story -- when shopper returns to main entrance w/ everything, unlock it!

    // check #2 - is this target a valid next location? Is it adjacent to current location?
    // valid location
    if (isValidNextLocation(player.currentLocation, target)) {
      // rename target to use our internal name for that location
      target = getOfficialLocationName(target);

      // let user know where they are -- they just changed locations
      console.log(
        `Good guess! You left ${player.currentLocation} and are now in ${target}`
      );

      // set current location to the new place
      player.currentLocation = target;
    }
    // invalid location
    else {
      console.log(
        `Can't go from ${player.currentLocation} to ${target}. Clues, shopper, clues.`
      );
    }
  } else {
    // wrong location -- help user with location
    console.log(
      `Hmmm, don't know ${target}. Look around! Clues, shopper, clues.`
    );
  }
};

/**
 * examine - game logic method - encapsulates user exploration
 * of items in their environment.
 *
 * @param {String} target
 */
const examine = (target) => {
  // examine -- find handle (non-produce) items
  if (isItem(target)) {
    // cart - show contents
    if (getItemName(target) === "small cart") {
      // make sure they have one first
      if (player.hasCart())
        console.log(`Here's what you got in your cart`, player.cart.contents);
      else console.log(`Hey, you'll need to get a ${target} first.`);
    }
    // shopping list -- show contentfs
    else if (getItemName(target) == "shopping list") {
      // make sure they have the list first
      if (player.hasList())
        console.log(
          `Here's what you need to get: `,
          player.shoppingList.contents
        );
      else console.log(`Hey, you'll need a ${target} first.`);
    }
    // for all other items
    else {
      // first make sure they're in the room & then provide item description
      if (isItemHere(player.currentLocation, target))
        console.log(getItemDescription(target));
      else
        console.log(
          `Where are you seeing this ${target}? Not here! Clues, shopper, clues!`
        );
    }
  }
  // next - produce items - keeping it simple
  else if (isProduce(target))
    console.log(`That vegetable looks fine. Or is it a fruit? Who cares.`);
  else console.log(`Hmmm...not much there really. Keep it moving.`);
};

/**
 * take - game logic method - encapsulates user interaction with
 * their environment. In particular, taking items.
 *
 * @param {String} target
 */
const take = (target) => {
  // is this a non-produce item in the game?
  if (isItem(target)) {
    // ! delete:
    // console.debug(`!Yes, ${target} is an item`);

    // special cases: carts and shopping list, once you have them, they travel
    // special case #1 -- if player already has already taken the shopping list,
    // then "take shopping list" simply displays it ()
    if (getItemName(target) === "shopping list" && player.hasList()) {
      // show what's on the list
      examine(target);
      return;
    }

    // special case: same as shopping list -- cart travels once gotten.
    if (getItemName(target) === "small cart" && player.hasCart()) {
      // show what's in the cart
      examine(target);
      return;
    }

    //  make sure the item available in current location
    if (!isItemHere(player.currentLocation, getItemName(target))) {
      // !delete
      // console.debug(
      //   `!Nope, there is no ${target} here at ${player.currentLocation}`
      // );
      console.log(`Sorry shopper, ${target} isn't available here.`);
      return;
    }
    // make sure is is also 'takeable'
    if (!isItemTakeable(target)) {
      // console.debug(`!No, ${target} is not a takeable them`);
      console.log(getItemDescription(target));
      return;
    }

    // players gets the shopping list
    if (getItemName(target) === "shopping list") {
      player.shoppingList = getItem(target);
      console.log(
        `Awesome!  Here's what you need to get: `,
        player.shoppingList.contents
      );
      return;
    }

    // player gets cart
    if (getItemName(target) == "small cart") {
      player.cart = getItem(target);
      console.log(`You got yourself a small cart -- now let's get shopping!`);
      return;
    }
  }
  // is it a produce item?
  else if (isProduce(target)) {
    // console.debug(`!Yes, ${target} is a produce item.`);
    // check that we have a cart first - send them to get it if they dont.
    if (!player.cart) {
      console.log(`Nope. Gotta go get a cart first.`);
      return;
    }
    // make sure the item is present here - in current location
    else if (!isItemHere(player.currentLocation, target)) {
      console.log(
        `Not sure we have ${target} here. Don't be discouraged though. It's a big store!`
      );
      return;
    }
    // Yay! now add produce to cart
    else {
      console.log(`Good call! ${target} now in your cart.`);
      player.cart.contents.push(target);
    }
  }
  // is the user simply taking inventory?
  else if (target == "inventory") {
    console.log(`Here's what you got so far:`, player.cart.contents);
    // ? is this same as examine("cart")
  }
  // nothing else is takeable
  else {
    // console.debug(`!No known item matched '${target}'`);
    console.log(
      `Hmmm, look closer. Where do you see ${target} in this ${player.currentLocation}?`
    );
  }
};

/**
 * drop - game logic method - allow user to drop an item.
 *
 * @param {String} item
 */
const drop = (item) => {
  // TODO implement drop(target)
  console.log(
    `Shopper, you're playing the basic version. I'm afraid you're stuck with ${item}.`
  );
};

/**
 * pay - user logic method - allow user to pay and guide
 * them back to the exit (with a few clues)
 * ? what variables must we set to mark payment
 * ? is there anything we need to check? Like shopping list?
 * ? Is this where we set a flag to mark that they've gotten everything?
 */
const pay = () => {
  // make sure shopping list is fully checked off
  player.shoppingList.forEach((item) => player.cart.contents.includes(item));
  console.log(
    `
      Thanks for the cashless exchange! You're all set.
      You can leave now. You remember where you came from, don't you?`
  );
};

/**
 * start()
 * =======
 * Main game loop (recursive) that encompass all game logic
 * Exits with 'leave'
 */
async function start() {
  // prompt user
  let answer = await ask("\n\nWhat to do next? >_");

  // extract desired action and object of the action from input
  let { action, target } = preprocessUserInput(answer);

  // execute user's wishes
  // if action isn't known, let user know
  if (!isValidPlayerAction(action)) {
    console.log(
      "Dear Shopper. You're limited to a few commands. \n" +
        "You can go to [place], take [item], examine [item], drop [item], etc... Plz, try again."
    );
  }
  // if action is known, let user know as well & try to accomodate their request
  else {
    console.log(`Ah, so you want want to ${action} ${target}.`);

    // =============== CORE GAME LOGIC =================
    // user looks around (from current location)
    if (action === "look") lookAround(player.currentLocation);
    // user attempts to move to neighboring location
    else if (action === "go to") goTo(target);
    // user examines an object
    else if (action === "examine") examine(target);
    // user takes an item
    else if (action === "take") take(target);
    else if (action === "get") take(target);
    // user drops an item from their inventory (i.e. cart)
    else if (action === "drop") drop(target);
    // user wants to pay!
    else if (action === "pay") pay();
    // user wants to exit - say thanks & bye
    else if (action === "leave") {
      // if user hasn't actually finished the game, give them hard time on way out
      if (!player.hasReceipt) {
        console.log(
          `So you're just gonna quit? Just like that? Too bad. Better luck next time. `
        );
        process.exit(0);
      }

      // otherwise, thanks player!
      console.log("Thank you for all you do! Bye for now <3");
      process.exit(0);
    }
  }

  // loop -- till game is a success and/or user leaves
  await start();
}

// ======================= START THE GAME ==============================

// To start the game, describe current location for the user
console.log(getLocationDescription(player.currentLocation));

// let the games begin!
start();
