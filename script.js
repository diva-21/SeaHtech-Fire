window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 1500;
  canvas.height = 500;

  // used for handling user inputs
  class InputHandler {
    constructor(game) {
      this.game = game;
      window.addEventListener("keydown", (e) => {
        if (
          (e.key === "ArrowUp" || e.key === "ArrowDown") &&
          this.game.keys.indexOf(e.key) === -1
        ) {
          this.game.keys.push(e.key);
        } else if (e.key === " ") {
          // so when ever space bar is pressed,
          // invoke the shoot func in player class
          this.game.player.shootTop();
        } else if (e.key === "d") {
          this.game.debug = !this.game.debug;
        }
        // console.log(this.game.keys);
      });
      window.addEventListener("keyup", (e) => {
        // if u find a presence of the hold out key in the array,
        // remove it
        if (this.game.keys.indexOf(e.key) > -1) {
          this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
        }
        // console.log(this.game.keys);
      });
    }
  }
  // handling player lazers
  class Projectile {
    // this class is called by Player class as it moves and shoots, so
    // shooting part is done here

    // here it needs game info , and coordinates (x,y)
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      //  here projectile=> bullet;
      // bullet cords
      this.width = 10;
      this.height = 3;
      // its speed
      this.speed = 3;
      // we will put a flag here for bullet range
      this.markedForDeletion = false;
      //**projectile design */
      this.image=document.getElementById('projectile')
    }
    // to change the animation of the bullet
    // if the bullet crosses the range, then we will set
    // the flag as true and pass it to draw to remove it
    update() {
      // every time it(bullet) has to move forward
      this.x += this.speed;
      // check for deletion, if it crosses beyond the game area(80%)
      // then mark flag as true
      if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
    }
    // to draw the bullets
    draw(context) {
        context.drawImage(this.image,this.x,this.y)
    }
  }

  // handling bolts and things
  // this class makes deathed (lol) enemy to bolts and nuts
  class Particle {
    constructor(game,x,y){
      this.game=game
      this.x=x
      this.y=y
      this.image=document.getElementById('gears')
      // nav cords for the frame
      // these will help in picking up one of the gears from the matrix gears frame
      this.frameX=Math.floor(Math.random()*3)
      this.frameY=Math.floor(Math.random()*3);
      this.spriteSize=50;
      // size modifier to take a random size(0.5-1) on gears
      this.sizeModifier=(Math.random()*0.5+0.5).toFixed(1);
      this.size=this.spriteSize*this.sizeModifier;
      this.speedX=Math.random()*6-3; // -3 to +3
      this.speedY=Math.random()*-15; // -15

      this.gravity=0.5;
      this.markedForDeletion=false;
      this.angle=0; // thry rotate 
      this.va=Math.random()*0.2-0.1; //velocity of angle -0.1 to +0.2 per frame
      this.bounced=0;
      //bug 3 =>changing range to 60 to 140
      this.bottomBounceBoundary=Math.random()*80+60; // range is 100 to 160px
    }
    update(){
      this.angle+=this.va;
      this.speedY+=this.gravity; // as its negatively intialised
      // the gravity will reduce it val to 0, so at speedY=0
      // it will be in its max height,so after that pos val of gravity makes to pull downward
      this.x -=this.speedX+this.game.speed; // to move horizontally
      this.y+=this.speedY// to move verticlly 
      // when it goes out of ranges
      if(this.y>this.game.height+this.size || this.x<0-this.size) this.markedForDeletion=true;
      
      // bounce the particles
      if(this.y>this.game.height-this.bottomBounceBoundary && this.bounced<5){
        // if it doesnt the ground and stillnot bounce
        //make it bounce and make addn bounces by increasinf its speedY
        // to make changes in gravity
        this.bounced++; // making it t bounce 2 times
        this.speedY*=-0.7
      }
    }
    draw(context){
      context.save();
      // rotating the particles by translation
      context.translate(this.x,this.y)
      context.rotate(this.angle)

      context.drawImage(this.image,this.frameX*this.spriteSize,this.frameY*this.spriteSize,this.spriteSize,this.spriteSize,this.size*-0.5,this.size*-0.5,this.size,this.size); // simce its a grid/sq ;

      context.restore();
    }
  }
  // handling main char
  class Player {
    constructor(game) {
      // player cords
      this.game = game;
      this.width = 120;
      this.height = 190;
      this.x = 20;
      this.y = 100;
      // speed of the player on Y axis, i.e up and down are launched and
      // maintained here
      this.speedY = 0;
      // speed val which adds on each press
      this.maxSpeed = 3;
      // here we maintain the record/list for the projectiles/bullet objs
      // where they carry the info regarding the shoots
      this.projectiles = [];
      //**player details**/

      this.image = document.getElementById("player");
      // in the gieven frame, we have a row of one type seahrse, and in another type
      //so frameX wil tell us on what to take in a particular column
      // frameY will tell on wht to take in a row
      // for example, when u got a powerup we have to take 2nd row seahorse
      // else normally 1st row
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37; // 1 to 38 seahorses, this shld be update using update method
      //**power up functionality**//
      this.powerUp=false;
      this.powerUpTimer=0;
      this.powerUpLimit=10000
    }
    update(deltaTime) {
      // update based on the player controls/moments
      if (this.game.keys.includes("ArrowUp")) this.speedY = -this.maxSpeed;
      else if (this.game.keys.includes("ArrowDown"))
        this.speedY = this.maxSpeed;
      else this.speedY = 0;
      this.y += this.speedY;

      //vertical boundaries *****
      //down size,here when the seahrse is going down to the screen
      // it make only of its body to go out of bounds
      if(this.y>this.game.height-this.height *0.5) this.y=this.game.height-this.height*0.5;
      //up direction
      else if(this.y<-this.height*0.5) this.y=-this.height*0.5;

      // here shoot controls are also updated

      // When ever space bar is invoked, then the InputHnadler will invoke,
      // the shoot command (function ) which is in our Player class
      // So then it will invoke Projectile class to draw bullets on screen and tell
      // me information of the each bullet object

      // So when ever a bullet object crosses the range, the update method in the
      // Projectile class will mark flag as true,
      // so here Imp point is , Player Update method has to store the
      // bullet objs info in a list and check for the updates for each obj whether
      // it has crossed the limits or not

      // if any obj crosses the limit, we remove from screen and put only those who
      // are within the limits

      //Now we have bullet limit, the no of bullets can be
      // shoot, go to shoot func to know more (***)

      // itgets the info of each bullet obj
      this.projectiles.forEach((projectile) => {
        projectile.update();
      });
      // now we have to filter those
      // so get me those who have flag as false which indicates
      // they are within the limit;
      this.projectiles = this.projectiles.filter(
        (projectile) => !projectile.markedForDeletion
      );
      // now we have to give this list of filtered to draw method
      // so that it will invoke the bullets draw method to put bullets with player moment

      // sprite animation/ sea horse animation
      if (this.frameX < this.maxFrame) this.frameX++; // if its less incre
      // so that it can move forwad,
      else this.frameX = 0; // when reach end,go to begin again

      //**power up logic*/
      //NOTE: ALSO LOGIC IS EXTENDED TO UPDATE IN GAME
      // if he got powered up
      if(this.powerUp){
        // if the powerup counter is more than the limit
        if(this.powerUpTimer>this.powerUpLimit){
            // make it to 0 and make it as false
            // and change the framy to noraml =0
            this.powerUpTimer=0;
            this.powerUp=false;
            this.frameY=0;
        }
        else{
            // else count and make shrse to upgraded one
            this.powerUpTimer+=deltaTime;
            this.frameY=1;
            // and also we increase the ammo recharge,
            // as we will put two lazers in power mode
            this.game.ammo+=0.1
        }
      }
    }
    draw(context) {
      // to specify which canvas element we want to draw the player guy
      if (this.game.debug)
        context.strokeRect(this.x, this.y, this.width, this.height);
      // here when we are adding the player img , the entire frame is coming,
      // so we have to crop one seahorse from that entire frame
      // and shift from one seahrose to another by using update method
      // syntax is a bit heavy , check it out ,
      this.projectiles.forEach((projectile) => {
        projectile.draw(context);
        // giving the filtered bull objs with player context to draw bullets for the player
      });

      // img,crop coords(source x,source y,source width,source height),,frame coords(destination x destinaton y,width,height i.e till the end of this frame)
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
      
    }
    // shooting part

    // (***) =>update method
    // here the obj creation is told in the update method,
    // kindly refer to that
    // now we have a bullet limit, i.e no of bullets can be
    // pressed, so we will
    // invoke the shoot method only if we have bullets/ammo
    shootTop() {
      // here we invoke the Projectile class and give
      // present player info, and coordinates
      if (this.game.ammo > 0) {
        this.projectiles.push(
          new Projectile(this.game, this.x + 80, this.y + 30)
        );
        // here +80 , +30
        // are for, where the bullet should start coming from
        // i.e from mouth / chest
        this.game.ammo--;
      }
      if(this.powerUp) this.shootBottom();
      // console.log(this.projectiles);
    }
    //*********************************************************** */
    // making projectile periodic movements;
    // we will make calculation for FPS: FRAME PER SEC
    // it can be done by  1000ms (1 sec) / delta time = fps
    // so we neeed to calculate the delta time using animationFrame, go to that **))
    shootBottom(){
        if (this.game.ammo > 0) {
            this.projectiles.push(
              new Projectile(this.game, this.x + 80, this.y + 175)
            );
          }

    }
    //**power up mode */
    enterPowerUp(){
        this.powerUpTimer=0;
        this.powerUp=true;
        // bug 2,we need to inrease if he has less ammo than maxammo
        if(this.game.ammo<this.game.maxAmmo)this.game.ammo=this.game.maxAmmo;
    }
    // in power mode, we use shootbottom also,2 lazwers type
    

  }
  // main blue print for enemy
  class Enemy {
    constructor(game) {
      this.game = game;
      this.x = this.game.width; // bcz they need to come from right to left
      this.speedX = Math.random() * -1.5 - 0.5; // -0.5 to -2 px from to left
      this.markedForDeletion = false; // to destroy this enemy
      // // lives and score for each enemy
      // this.lives=5;
      // this.score=this.lives;
      //frames for enemy animation
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37;
    }
    update() {
      // this weill enmies to coe faster
      this.x += this.speedX - this.game.speed;
      // now check if the enemy has come closer to left side
      // if so , then mark flag as true
      if (this.x + this.width < 0) this.markedForDeletion = true;
      // sprite animation for enemy
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = 0;
    }
    draw(context) {
      // drawing enemy

      if (this.game.debug)
        context.strokeRect(this.x, this.y, this.width, this.height);
      // filling the lives in rect
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
      if(this.game.debug){
        context.font = "20px Helvetica";
        context.fillText(this.lives, this.x, this.y);
      }
      
    }
  }
  // angler1 enemy
  class Angler1 extends Enemy {
    // to invoke this class, have afunction os addEnemy to
    // create child enemy objs ,and make sure that they are linked
    // to draw and updates
    constructor(game) {
      super(game); // to invoke parents constructor =>
      // to take basic info from enemy class regarding the coords
      this.width = 228;
      this.height = 169;
      // fixing the angler air robot y axis direction

      // the y coordinate can be calculated by
      // taking total 95% of players ht will make our flying bot to touch or go outside the box
      // so we reduce it by our height so that it can move within the screen
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("angler1");
      this.frameY = Math.floor(Math.random() * 3);

      // lives and score for each enemy
      this.lives = 5;
      this.score = this.lives;
    }
  }
  // angler2 enemy
  class Angler2 extends Enemy {
    // to invoke this class, have afunction os addEnemy to
    // create child enemy objs ,and make sure that they are linked
    // to draw and updates
    constructor(game) {
      super(game); // to invoke parents constructor =>
      // to take basic info from enemy class regarding the coords
      this.width = 213;
      this.height = 165;
      // fixing the angler air robot y axis direction

      // the y coordinate can be calculated by
      // taking total 95% of players ht will make our flying bot to touch or go outside the box
      // so we reduce it by our height so that it can move within the screen
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("angler2");
      this.frameY = Math.floor(Math.random() * 2);

      // lives and score for each enemy
      this.lives = 6;
      this.score = this.lives;
    }
  }
    // lucky enemy
    class LuckyFish extends Enemy{
        // to invoke this class, have afunction os addEnemy to
        // create child enemy objs ,and make sure that they are linked
        // to draw and updates
        constructor(game){
            super(game); // to invoke parents constructor =>
            // to take basic info from enemy class regarding the coords
            this.width=99
            this.height=95
            // fixing the angler air robot y axis direction

            // the y coordinate can be calculated by 
            // taking total 95% of players ht will make our flying bot to touch or go outside the box
            // so we reduce it by our height so that it can move within the screen
            this.y=Math.random()* (this.game.height*0.95 - this.height);
            this.image= document.getElementById('lucky')
            this.frameY=Math.floor(Math.random() * 2)

             // lives and score for each enemy
            this.lives=5;
            this.score=15;
            // lucky property
            this.type='lucky'
        }
    }
        // HiveWhale enemy
        class HiveWhale extends Enemy{
          // to invoke this class, have afunction os addEnemy to
          // create child enemy objs ,and make sure that they are linked
          // to draw and updates
          constructor(game){
              super(game); // to invoke parents constructor =>
              // to take basic info from enemy class regarding the coords
              this.width=400
              this.height=227
              // fixing the angler air robot y axis direction
  
              // the y coordinate can be calculated by 
              // taking total 90% of players ht will make our flying bot to touch or go outside the box
              // so we reduce it by our height so that it can move within the screen
              this.y=Math.random()* (this.game.height*0.9 - this.height);
              this.image= document.getElementById('hivewhale')
              this.frameY=0
  
               // lives and score for each enemy
              this.lives=20;
              this.score=this.lives;
              // Hive property
              this.type='hive'
              // this whale will move slowly
              this.speedX=Math.random()*-1.2-0.2; // -0.2 to -1.4

          }
      }
      // drone bots hich are inside hive whale
      class Drone extends Enemy{
        // to invoke this class, have afunction os addEnemy to
        // create child enemy objs ,and make sure that they are linked
        // to draw and updates
        constructor(game,x,y){ // here x & y are cords of whale
            super(game); // to invoke parents constructor =>
            // to take basic info from enemy class regarding the coords
            this.width=115
            this.height=95

            this.x=x;
            this.y=y;
            this.image= document.getElementById('drone')
            this.frameY=Math.floor(Math.random()*2);

             // lives and score for each enemy
            this.lives=3;
            this.score=this.lives;
            // Hive property
            this.type='drone'
            // this whale will move slowly
            this.speedX=Math.random()*-4.2-0.5; // -0.5 to -4.7 per frame

        }
    }
  // individual & multilayer background
  // graphic feature is done here
  class Layer {
    constructor(game, image, speedModifier) {
      this.game = game;
      this.image = image; // to control the imgs
      this.speedModifier = speedModifier; // to set each img sppeed to create
      // parallax animation
      // coords
      this.width = 1768;
      this.height = 500;
      this.x = 0;
      this.y = 0;
    }
    // update method for running the img from right to left
    update() {
      //psuhing the coordinates from right top to left
      // when x coord reaches left top or goes beyond that
      // reinitialise x to 0 , i.e back to right top
      if (this.x <= -this.width) this.x = 0;
      this.x -= this.game.speed * this.speedModifier;
    }
    draw(context) {
      // 3 paras=> img,and coords
      // since , in one frame there are 4 imgs, after that we are getting white bgd
      // so to create a parallax effect, we draw once more after the
      // first draw, so when this.x resets to 0,comes to the first draw,
      //for naked eye it will look like parallax effect

      // THe above is img1(4 layers) + img2(4 layers)
      // so it goes to img1 end and then come back to x=0 at img1
      // so the white space is not shown fo rnaked eye
      context.drawImage(this.image, this.x, this.y);
      context.drawImage(this.image, this.x + this.width, this.y);
    }
  }
  // pulls all the background objs

  //this class is invoked by Game class
  class Background {
    // this class will control all the layers
    constructor(game) {
      this.game = game;
      this.image1 = document.getElementById("layer1");
      this.image2 = document.getElementById("layer2");
      this.image3 = document.getElementById("layer3");
      this.image4 = document.getElementById("layer4");

      this.layer1 = new Layer(this.game, this.image1, 0.2);
      this.layer2 = new Layer(this.game, this.image2, 0.4);
      this.layer3 = new Layer(this.game, this.image3, 1);
      this.layer4 = new Layer(this.game, this.image4, 1.5);
      // here i am removing layer4 from array as its coming infront,so iwll fix them
      // in Game update where each layer is clled
      this.layers = [this.layer1, this.layer2, this.layer3]; // keeps all the layer objs
    }
    update() {
      //move all layer objects
      // taking all the layer objs to have concurrent transitions
      this.layers.forEach((layer) => layer.update()); // this will call each
      // update method of that coresponding layer from LAyer class
    }
    draw(context) {
      // draw all of them
      // call draw method for each layer obj
      this.layers.forEach((layer) => layer.draw(context));
    }
  }
  // parent class which creates dust and fire explosions
  class Explosion{
    constructor(game,x,y){
      this.game=game;
      this.frameX=0;
      this.spriteHeight=200;
      this.spriteWidth=200; // making this as global for child classes
      //animation speed
      this.fps=30;
      this.timer=0; 
      this.interval=1000/this.fps;
      this.markedForDeletion=false
      this.maxFrame=8;
      // for child classes
      this.width=this.spriteWidth;
      this.height=this.spriteHeight;
      this.x=x-this.width * 0.5;
      this.y=y-this.height * 0.5;
    }
    update(deltaTime){
      this.x -= this.game.speed
      // periodic event on explosion
      //if u get less, then incre the frame and make timer as 0
      if(this.timer>this.interval){
        this.frameX++;
        this.timer=0;
      }
      else{
        this.timer+=deltaTime
      }
      
      if(this.frameX>this.maxFrame) this.markedForDeletion=true;
    }
    draw(context){
      context.drawImage(this.image,this.frameX*this.spriteWidth,0,this.spriteWidth,this.spriteHeight,this.x,this.y,this.width,this.height)
    }
  }
// for child explosiosn , the cords are removed as they are now gloal in parent clas
  class SmokeExplosion extends Explosion{
    // smoke explosion on 2 cases, one will collision with enemy
    // on  call for explosion on complete defeat of enemy with projectile
    constructor(game,x,y){
      super(game,x,y)
      // this.game=game
      // moving the cords to half the way
      this.image=document.getElementById('smokeExplosion');
      // console.log(this.image);
    //  this.spriteWidth=200; //each fire in the frame is of this widht
      // this.width=this.spriteWidth;
      // this.height=this.spriteHeight;
      // this.x=x-this.width * 0.5;
      // this.y=y-this.height * 0.5;
    }

  }
  class FireExplosion extends Explosion{
    // smoke explosion on 2 cases, one will collision with enemy
    // on  call for explosion on complete defeat of enemy with projectile
    constructor(game,x,y){
      super(game,x,y)
      // this.game=game
      // moving the cords to half the way
      this.image=document.getElementById('fireExplosion');
      // console.log(this.image);
     // this.spriteWidth=200; //each fire in the frame is of this widht
      // this.width=this.spriteWidth;
      // this.height=this.spriteHeight;
      // this.x=x-this.width * 0.5;
      // this.y=y-this.height * 0.5;
    }
  }
  // Score , timer, ammo sticks on the top etc
  class UI {
    constructor(game) {
      this.game = game;
      this.fontSize = 25;
      this.fontFamily = "Bangers";
      this.color = "white";
    }
    // it doesnt need update, only draw method is enough
    draw(context) {
      // shadowing
      context.save();
      context.fillStyle = this.color;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;
      context.shadowColor = "black";
      context.font = this.fontSize + "px " + this.fontFamily;
      
      // score board display
      context.fillText("Score: " + this.game.score, 20, 40);
  
      // time feature adding, we also format the gametime, as it has
      // decimals so we have to round it to show only 1 dec after point
      const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
      context.fillText("Timer: " + formattedTime, 20, 100);
      // game over message
      if (this.game.gameOver) {
        // if game is over then display message
        context.textAlign = "center";
        let message1, message2;
        if (this.game.score > this.game.winningScore) {
          message1 = "Wonderous Win!";
          message2 = "Well Done";
        } else {
          message1 = "Blaze Looser!";
          message2 = "Bro,Get my repair kit";
        }
        context.font = "70px " + this.fontFamily;
        context.fillText(
          message1,
          this.game.width * 0.5,
          this.game.height * 0.5 - 20
        );
        context.font = "25px " + this.fontFamily;
        context.fillText(
          message2,
          this.game.width * 0.5,
          this.game.height * 0.5 + 20
        );
      }
      // create bullt sticks as much they are present
    if(this.game.player.powerUp) context.fillStyle = '#ffffbd';
    for (let i = 0; i < this.game.ammo; i++) {
      // moving the x corrdinate using loop i
      context.fillRect(20 + 5 * i, 50, 3, 20);
    }

      context.restore();
    }
  }
  // brain of the game
  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      // here 'this' in the below refers to the current game obj
      this.player = new Player(this);
      // initiating inputhandler class
      this.input = new InputHandler(this);
      this.keys = []; // to store the control presses(up and down)
      this.ui = new UI(this); // to create bullet and score board on top
      // ammo/ bullet limit
      this.ammo = 20;
      // ******** //
      // here for recharge of bullets ,we need 3 vars
      this.ammoTimer = 0; // this is a counter
      // from 0 to a ammoInterval (it takes deltaTime on each incre)
      this.ammoInterval = 450;
      // we need a max ammo , to make bullets as finite
      this.maxAmmo = 50;
      //*****//
      this.enemies = []; // this will hold the enemy objs info
      // 3 periodic vars for enemies
      this.enemyTimer = 0; // which is same as ammo timer
      this.enemyInterval = 2000; // so for every 1sec of time, we want to
      // create enemies
      this.gameOver = false; // to check whether game is over or not
      //** score board display**/
      this.score = 0;
      this.winningScore = 2000; // to increase diff
      // ** game time limit** //
      this.gameTime = 0;
      this.timeLimit = 35000;
      //* game graphics * */
      this.speed = 1;
      this.background = new Background(this);
      //**game debug */
      this.debug = false; // at teh start it wont come, if need press d
      // phsycis on particles
      this.particles=[]
      //explosions
      this.explosions=[]
    }
    update(deltaTime) {
      // time limit feature
      if (!this.gameOver) this.gameTime += deltaTime;
      if (this.gameTime > this.timeLimit) this.gameOver = true;
      // background feature
      this.background.update();
      this.background.layer4.update(); // calling it explicitly
      //
      this.player.update(deltaTime);
      // update the ammo on recharge concept
      // if the counter exceeds
      if (this.ammoTimer > this.ammoInterval) {
        // if my ammo is less than max ammo, then only increment ammo
        if (this.ammo < this.maxAmmo) this.ammo++;
        this.ammoTimer = 0;
      } else {
        this.ammoTimer += deltaTime;
      }
      //**Physics on partiles **/
      this.particles.forEach(particle=>particle.update());
      this.particles=this.particles.filter(particle=>!particle.markedForDeletion) //3$3
      // explosion [property]
      this.explosions.forEach(explosion=>explosion.update(deltaTime));
      this.explosions=this.explosions.filter(explosion=>!explosion.markedForDeletion)
      // same as projectile model 3$3
      // same as we did periodic for bullet , we have to do for
      // enermy

      this.enemies.forEach((enemy) => {
        enemy.update();
        // so for each enermy we will check for its collision with
        // player

        if (this.checkCollision(this.player, enemy)) {
          // then mark del flag of that enemy as true
          enemy.markedForDeletion = true;
          // on collision, call the explosion
          this.addExplosion(enemy);
          // nuts and bolts padali enemy vs players
          // no of bolts=enemey.score
          for(let i=0;i<enemy.score;i++){
            this.particles.push(new Particle(this,enemy.x+enemy.width*0.5,enemy.y+enemy.height*0.5))
          }
          
          // power up feature ******* //bug1
            // when its a power up , then start powerup function
          if(enemy.type==='lucky') this.player.enterPowerUp()
          // else when u colide with non lucky fish, then decre score
          else if(!this.gameOver) this.score--; // decrease the score only when game is not over
        }
        // foreach bullet from this player, if it hits enemy,
        // decrease the enemy life and remove the bullet and
        // if enemy dies, increase the score
        this.player.projectiles.forEach((projectile) => {
          if (this.checkCollision(projectile, enemy)) {
            enemy.lives--;
            projectile.markedForDeletion = true;
            // nuts and bolts padali on every collison with bullet and ene,y
            this.particles.push(new Particle(this,enemy.x+enemy.width*0.5,enemy.y+enemy.height*0.5))
          }
          if (enemy.lives <= 0) {
            // nuts and bolts padali enemy vs players
            // no of bolts=enemey.score
          for(let i=0;i<enemy.score;i++){
            this.particles.push(new Particle(this,enemy.x+enemy.width*0.5,enemy.y+enemy.height*0.5))
          }
            enemy.markedForDeletion = true;
            // call for explosion on complete defeat of enemy with projectile
            this.addExplosion(enemy);
            //drone inside the whale feature
            if(enemy.type==='hive'){
              // then create new drone objs with this, and whale cords
              // here we want the drones to start moving in diff cords, not all with same
              // so we put random to whale cords
              for(let i=0;i<5;i++) this.enemies.push(new Drone(this,enemy.x +Math.random()*enemy.width,enemy.y+Math.random()*enemy.height*0.5)); // we tweak ht by 0.5 to spon them in diff hights
            }
            // increase the score only if game is still no over
            if (!this.gameOver) this.score += enemy.score;
            // *** changing feature to game only ends in 30 secs
            //if (this.score > this.winningScore) this.gameOver = true;
          }
        });
      });
      // only list them who are within and next
      // go to draw method below */*
      this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
      // if our enemyTimer counter exceeds then && game is not done
      if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
        this.addEnemy(); // create a new enemy
        // set the counter back to 0
        this.enemyTimer = 0;
      }
      // else incre the counter
      else {
        this.enemyTimer += deltaTime;
      }
    }
    draw(context) { //bug 4=>rearrangement of the draw eles
      // background feature
      this.background.draw(context); // this contains only 3 lyrs
      this.ui.draw(context);
      this.player.draw(context);
      //**particle physics */
      this.particles.forEach(particle=>particle.draw(context));
      // */*
      this.enemies.forEach((enemy) => {
        enemy.draw(context);
      });
      // explosion feature
      this.explosions.forEach(explosion=>explosion.draw(context));
      this.background.layer4.draw(context); // this is ly4, draw bcz to overcome
      // -its overlapping on player draw
    }
    // a function to invoke child enemy classes,
    // so to call these ,we need to use deltaTime for
    // calling creating enemies periodiccallly
    addEnemy() {
      //agler2 insertion, so we need a logic to have both the types
      // of enemies to be the game so
      const randomize = Math.random();
      if (randomize < 0.3) this.enemies.push(new Angler1(this));
      else if (randomize < 0.6) this.enemies.push(new Angler2(this));
      // changing to 0.7 to have less whales
      else if (randomize < 0.7) this.enemies.push(new HiveWhale(this));
      else this.enemies.push(new LuckyFish(this));
    }
    // explosion on enemy 
    addExplosion(enemy){
      const randomize = Math.random();
      if(randomize<0.5) this.explosions.push(new SmokeExplosion(this,enemy.x+enemy.width*0.5,enemy.y+enemy.height*0.5)) //since explosions are coming on left of the enemy,we make it into middle by adding half of width/height of thenemy
      // console.log(this.explosions);
      else{
        this.explosions.push(new FireExplosion(this,enemy.x+enemy.width*0.5,enemy.y+enemy.height*0.5)) //since explosions are coming on left of the enemy,we make it into middle by adding half of width/height of thenemy
      }
    }
    //*********//
    // beautiful collision check is done below
    // consider two rectangles R1(x1,y1,w1,h1) & R2(x2,y2,w2,h2)
    // they will collide only if and iffffff

    // for x axis
    // if line thr x1 meets another horizontal line whose at dist of x2+w2 from it and
    // and line thr x2 meets another horizontal line whose at dist x1+w1 from it

    // and similar to y axis
    //  line thr y1 meets another vertical line whose at dist of y2+h2 and
    // line thr y2 meets another vertical line whose at dist of y1+h1

    // then only collision happens; if one of the condtns are true,
    // they wont intersect/meet/collide as
    //they will be in the same y axis with dx gap or vice versa

    checkCollision(rect1, rect2) {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect2.x < rect1.x + rect1.width &&
        rect1.y < rect2.y + rect2.height &&
        rect2.y < rect1.y + rect1.height
      );
    }
  }

  const game = new Game(canvas.width, canvas.height);

  // animation loop

  // **))
  // here we calculate the delta time for each animation,
  // and pass it to Game class, so in the Game class,
  // we make recharge for bullet limit as per delta time

  // here we get FPS as 60
  let lastTime = 0;
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    // console.log(deltaTime);
    // this will clear out the previous drawn in the rectangle range
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.draw(ctx);
    game.update(deltaTime);
    
    requestAnimationFrame(animate); // it redeners the timestamp ref of the current animation froame
  }
  animate(0);
});
// check for future