const _ = require('underscore');
const readline = require('readline');

const { createBrotliCompress } = require('zlib');
const readlineInterface = readline.createInterface(process.stdin, process.stdout);

function ask(questionText) {
  return new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve);
  });
}

// template for locations 
// TODO change them to departments
class Location {
  constructor(name, description = '', adjacent = [], inventory = [], locked = false) {
    this.name = name
    this.description = description
    this.adjacent = adjacent
    this.inventory = inventory
    this.locked = locked

  }

  // returns description of location - convenience function
  lookAround() { return this.getDescription() }

  // returns description of location
  getDescription() { return this.description }

  canGo(location) {
    return this.adjacent.includes(location)
  }
}

// create locations with mapped allowable transitions
let mainEntrace = new Location(
  'main entrance',
  `
  Hello Shopper! In case you've forgotten, you've been hired as a shopper 
  for our dear dear customers at Hannafords. In the cart room, you'll find the
  your shopping list on the hiring stand. You are currently at the main entrance.
  In front of you are the doors to Hannafords.  Next up is the cart room. 
  You'll need one. If you need help along the way, remember to just look around.`,
  ['cart room'])
let cartRoom = new Location(
  'cart room',
  `
  See the large carts on your right and small carts to your left.
  We're also hiring! Baskets are by the front produce`,
  ['front produce'],
  ['big carts','small carts','shopping list'])
let frontProduce = new Location(
  'front produce',
  `
  You're inside the store. Yay! In front of you are some local tomatoes,
  and local strawberries. Yum! To your right are some green stuff you 
  can't quite make out. And to your right is a smorgasbord of fruit. 
  This was damn place is a smorgasbord!`,
  ['cart room','back produce', 'left produce', 'right produce'],
  ['strawberries','tomatoes'])
let backProduce = new Location(
  'back produce',
  `
  You're in the back produce -- looking at heaps of single avocadoes, and potatoes.
  There's also big juicy tomatoes, and peppers. There are also bags of onions and
  avocadoes as well.`,
  ['front produce','right produce','left produce'],
  ['avodaoes',' potatoes','big juicy tomatoes','peppers','onions','bag of onions','bag of avocadoes'])

  // TODO add description
  let leftProduce = new Location(
  'left produce',
  `
  You're in the left produce -- tons of fruit!
  The usual suspects are here including some funky ones.
  Yes, hidden behind the passion fruit, are the mangoes and plums.
  There are also a back of different berries! Take your pick!`,
  ['checkout','back produce','front produce'],
  ['passion fruit', 'mangoes', 'plums','blackberries', 'blueberries','strawberries'])

  // TODO add description
  let rightProduce = new Location(
  'right produce',
  `You're in the right produce -- we have bell peppers and corn here.`,
  ['back produce','front produce'],
  ['corn','green bell peppers','yellow bell peppers','red bell peppers'])
  
  // TODO add description
  let checkout = new Location(
  'checkout',
  `So you're ready to check out. Go everything on your list?`,
  ['left produce']
  ['receipt'])

// locations & location instance lookupTable
// TODO implementation of "forgiving" location names that doesn't
//      require adding all these possibilities into the Location 
//      class instance's adjacent array.
//      ISSUE: currently, adding locations here isn't enough, I need
//      to update locations in each Location class instance as well.
//      seems like a bad/poor pattern!
const locationLookUp = {
  "main entrance" : mainEntrace,
  "cart room" : cartRoom,
  //"cartroom" : cartRoom,
  //"carts": cartRoom,
  "front produce" : frontProduce,
  //"front" : frontProduce,
  "back produce" : backProduce,
  //"back" : backProduce,
  "left produce" : leftProduce,
  //"left" : leftProduce,
  //"left side" : leftProduce,
  "right produce" : rightProduce,
  //"right" : rightProduce,
  //"right side" : rightProduce,
  "checkout" : checkout
}

// TODO add items
// items - these will simply be shopping list, cart (could extend to cash register)
// TODO - what items will be untakable? 
class Item {
  constructor(name, description = '', contents = [], available = false, takeable = false) {
    this.name = name
    this.contents = contents
    this.available = available
    this.takeable = takeable
  }
}

// Method to create the shopper's list 
const SHOPPING_LIST_LENGTH = 5

// create produce inventory
let createProduceInventory = () => {
  // merge inventories from all the produce locations
  return frontProduce.inventory
    .concat(backProduce.inventory)
    .concat(leftProduce.inventory)
    .concat(rightProduce.inventory)
}
const produceInventory = createProduceInventory()

// Create shopping list
let createShoppingList = () => {
  // TODO #0 randomly generate a list of 5 items to buy
  return _.take(_.shuffle(produceInventory), SHOPPING_LIST_LENGTH)
}

let shoppingList = createShoppingList();
// console.log(shoppingList) -> five random items to shop for.

// TODO #1 -- 
//  create items (use locations descriptions & pictures)
//  decide on properties of the items -- takeable and such

// Possible future extensions
// 
/*
move forward
move back
move left
move right
take [object]
*/

let player = {
  // set player's current location
  name: "Bob",
  currentLocation: "main entrance",
  // allowed actions
  actions: [ "go", "go to","take","return","pay","leave","look"],
  cart: [],
  hasReceipt: false
}

// print out current place's description
console.log(locationLookUp[player.currentLocation].getDescription())


start();

async function start() {

  // user prompt
  const prompt = 

`
What to do next? >_`

  // prompt user
  let answer = await ask(prompt);
  // console.log(answer, 'line 174');

  // quick & dirty sanitizing
  let inputArray = answer.trim().toLowerCase().split(' ')

  let action = ''
  let target = ''

  // process action
  // + ability to process "go to"
  // TODO replace this logic with user input lookupTable
  action = inputArray[0] // first word
  if ( action === "go" && inputArray[1] === "to" ) {
    action = "go to"
    target = inputArray.slice(2).join(' ') // the rest
  }
  // if action is not "go to", expect single word for command
  else {
    target = inputArray.slice(1).join(' ') // the rest
  }

  // execute user's wishes
  // if action isn't known, let user know
  if ( !player.actions.includes(action) ) {
    console.log(
    `Dear Shopper. You're limited to a few commands. 
      You can go to [place], take [item], drop [item], etc...
      Plz, try again.`)
  } 
  // if action is known, let user know as well
  else {
    console.log(`Ah, so you want want to ${action} ${target}.`)

    // if look - assume "look around" - get current place's location & look out! 
    if ( action === 'look' ) {
      // TODO explore using text wrapping - currently using `` and formatting as desired.
      // https://stackoverflow.com/questions/14484787/wrap-text-in-javascript
      console.log(locationLookUp[player.currentLocation].lookAround())
    }
    // ===     logic to move b/t locations ===== //
    // if "go", expect/check target is location, 
    else if ( action === "go to" || action === "go" ) {
      // check/handle if valid location
      if(Object.keys(locationLookUp).includes(target)) {
        // check/handle if allowed transition
        // TODO story -- when leaving main entrance to cart room, main entrance locks!
        //               can't leave w/o the full shopping leave.  
        // TODO story -- when shopper returns to main entrance w/ everything, unlock it! 
        if (locationLookUp[player.currentLocation].canGo(target)) {
          console.log(`Good guess! You left ${player.currentLocation} and are now in ${target}`)
          player.currentLocation = target
        } else {
          // TODO implement can't go from here to there -- if we got a valid location
          console.log(`Can't go from ${player.currentLocation} to ${target}. Clues, shopper, clues.`)
        }
      } else {
        // wrong location -- help user with location
        console.log(`Hmmm, don't know ${target}. Look around!`)
      }   
    }
    // TODO #3 implement "take" actions, expect take [item]
    else if ( action == "take" ) {
      // non-produce items  -- shopping list, cart, inventory
      if ( target === "shopping list") {
        console.log(`Awesome! Here's what you need to get: `, shoppingList)
      } else if ( target == "cart" ) {
        console.log(`You got yourself a cart -- now let's get shopping!`)
      } 
      // TODO #3b add take inventory (as item) => list what user has
      else if ( target == "inventory" ) {
        console.log(`Here's what you got so far:`, player.cart)
      } else {

      }
      

      // taking a produce item

    }
    // TODO #4 if "drop" expect target = [item], check
    else if ( action === 'drop') {

    }
    // TODO #5 if "pay", say thanks - you're all set
    else if ( action === 'pay') console.log(
      `
      Thanks for the cashless exchange! You're all set. 
      You can leave now. You remember where you came from, don't you?`)
    // if "leave" say bye
    else if (action === 'leave') { 
      // TODO - Have they opened the main entrance? 
      //        If not, give them a hard time and release them.

      console.log("bye")
      process.exit(0)
    }

  }

  start()
  // process.exit(); -- TODO understand how/when this line executes
}
