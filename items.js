const _ = require("underscore");
const { produceInventory } = require("./locations");

// =================== Other Helper Methods  ====================
/**
 * Helper method to create a random shopping list from inventory
 * @param {Array} inventory
 * @param {Number} listLength
 * @returns shopping list of requested length
 */
let createShoppingList = (inventory, listLength) =>
  _.take(_.shuffle(inventory), listLength);

// =============== Item Class & Interface methods Definition ===========
class Item {
  constructor(name, description = "", contents = [], takeable = false) {
    this.name = name;
    this.description = description;
    this.contents = contents;
    this.takeable = takeable;
  }

  // class predicate - lets us if this item containts an object.
  // e.g. if a cart contains 'tomatoes'.
  has(target) {
    return this.contents && this.contents.includes(target);
  }

  // add object to Item (e.g. add produce to our cart item)
  add(target) {
    this.contents.push(target);
  }

  // remove object from Item
  removeFromContents(target) {
    // nothing to remove, return false.
    if (!this.has(target)) return false;

    // if target object exists, remove it from
    // item's contents.
    let index = this.contents.indexOf(target);
    if (index !== 1) {
      let dropped = this.contents.splice(index, 1);
      console.debug(`Dropping ${dropped} from ${this.name}`);
      return true;
    }
    // handle implementation error - item.has should match results
    // of searching the item's contents.
    else {
      throw `Cart.has(target)  is contradicted by Cart.contents.indexOf(target):
        > Cart.contents.indeOf(target): ${this.contents.indexOf(target)}
        > Cart.has(target): ${this.has(target)}`;
    }
  }
}

// main entrance doors
let doors = new Item(
  "main entrance doors",
  "Welcome to hannafords! These are our doors. Please leave them where they are.",
  [],
  false
);

// this will be the cart the user takes & uses to shop
let smallCart = new Item(
  "small cart",
  "This is your shopping cart - good side for what you need",
  [],
  true
);
let bigCart = new Item(
  "big cart",
  "This is a jumbo shopping cart. Seems to be tied & locked with the rest.",
  [],
  false
);

// shopping list with user's items to buy before they can leave :-)
let shoppingList = new Item(
  "shopping list",
  "This is your shopping list.",
  // creates random 5 item list from our product inventory
  createShoppingList(produceInventory, 5),
  // ["tomatoes", "plums"], // testing scenario
  true
);

// cash register at checkout -- there's money here
let cashRegister = new Item(
  "cash register",
  "Storage for Hannaford's $$$$. It's not for you.",
  [1, 1, 5, 5, 5, 5, 50, 50, 100, 100, 500, 500, 2000],
  false
);

// Items lookup table - populated with ALL items in the environment
// that users to interact with.
const itemsLookupTable = {
  doors: doors,
  "main entrance doors": doors,
  "big doors": doors,
  "small cart": smallCart,
  "large cart": bigCart,
  "big cart": bigCart,
  cart: smallCart,
  "shopping list": shoppingList,
  list: shoppingList,
  "cash register": cashRegister,
  register: cashRegister,
};

// ===============   Items Interace Methods    ==================
// -- these are helper methods to work with items of the game ---

/**
 * isItem - predicate to answer q: is this a game item?
 *
 * @param {String} target
 * @returns {Boolean}
 */
const isItem = (target) => Object.keys(itemsLookupTable).includes(target);

/**
 * isProduce - predicate to answer q: is this a produce item in
 * one of the produce sections?
 *
 * @param {*} target
 * @returns
 */
const isProduce = (target) => produceInventory.includes(target);

/**
 * throwNotItemError - error to make the program more robust
 * at runtime. Ensures we're only calling our 'Items' methods
 * on objects of Item.
 */
const throwNotItemError = (target) => {
  throw `${target} is not an instance of class Item`;
};

/**
 * getItem - Item class helper method -- abstracts our
 * itemsLookupTable and makes it more forgiving by mapping
 * multiple names to the same game item.
 *
 * @param {String} target
 * @returns
 */
const getItem = (target) =>
  isItem(target) ? itemsLookupTable[target] : throwNotItemError(target);

/**
 * getItemName - Item class helper method -- abstracts our
 * itemsLookupTable and makes it more forgiving by mapping
 * multiple names to the same game item.
 *
 * This method returns the "offical name" of the item, mapping
 * the possible different names to one.
 *
 * @param {String} target
 * @returns
 */
const getItemName = (target) =>
  isItem(target) ? itemsLookupTable[target].name : throwNotItemError(target);

/**
 * getItemDescription - Item class helper method -- abstracts our
 * itemsLookupTable and makes it more forgiving by mapping
 * multiple names to the same game item.
 *
 * This method returns the item's game description.
 *
 * @param {String} target
 * @returns
 */
const getItemDescription = (target) =>
  isItem(target)
    ? itemsLookupTable[target].description
    : throwNotItemError(target);

/**
 * getItemTakeable - Item class helper method -- abstracts our
 * itemsLookupTable and makes it more forgiving by mapping
 * multiple names to the same game item.
 *
 * This method is a predicate to verify if an item can be
 * taken by the player.
 *
 * @param {String} target
 * @returns
 */
const isItemTakeable = (target) =>
  isItem(target)
    ? itemsLookupTable[target].takeable
    : throwNotItemError(target);

module.exports = {
  isItem,
  isProduce,
  getItem,
  getItemName,
  getItemDescription,
  isItemTakeable,
};
