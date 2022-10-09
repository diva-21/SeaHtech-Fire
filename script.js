window.addEventListener('load',()=>{
    const canvas=document.getElementById('canvas1')
    const ctx=canvas.getContext('2d')
    canvas.width=1500;
    canvas.height=500

    // used for handling user inputs
    class InputHandler{
        constructor(game){
            this.game=game
            window.addEventListener('keydown',(e)=>{
                if((e.key==='ArrowUp' || e.key==='ArrowDown') && this.game.keys.indexOf(e.key)===-1){
                    this.game.keys.push(e.key);
                }
                else if(e.key=== ' '){
                    // so when ever space bar is pressed,
                    // invoke the shoot func in player class
                    this.game.player.shootTop();
                }
                // console.log(this.game.keys);
            });
            window.addEventListener('keyup',(e)=>{
                // if u find a presence of the hold out key in the array,
                // remove it 
                if(this.game.keys.indexOf(e.key)>-1){
                    this.game.keys.splice(this.game.keys.indexOf(e.key),1);
                }
                // console.log(this.game.keys); 
            })
        }

    }
    // handling player lazers
    class Projectile{
        // this class is called by Player class as it moves and shoots, so
        // shooting part is done here

        // here it needs game info , and coordinates (x,y)
        constructor(game,x,y){
            this.game=game;
            this.x=x;
            this.y=y;
            //  here projectile=> bullet;
            // bullet cords
            this.width=10;
            this.height=3;
            // its speed
            this.speed=3;
            // we will put a flag here for bullet range
            this.markedForDeletion=false;
        }
        // to change the animation of the bullet
        // if the bullet crosses the range, then we will set
        // the flag as true and pass it to draw to remove it
        update(){
            // every time it(bullet) has to move forward
            this.x+=this.speed;
            // check for deletion, if it crosses beyond the game area(80%)
            // then mark flag as true
            if(this.x>this.game.width*0.8) this.markedForDeletion=true;

        }
        // to draw the bullets
        draw(context){
            // creating a bullet
            context.fillStyle='yellow'; // bullet color
            context.fillRect(this.x,this.y,this.width,this.height);
            
        }
    }
    // handling bolts and things
    class Particle{

    }
    // handling main char
    class Player{
        constructor(game){
            // player cords
            this.game=game;
            this.width=120;
            this.height=190;
            this.x=20;
            this.y=100;
            // speed of the player on Y axis, i.e up and down are launched and 
            // maintained here
            this.speedY=0;
            // speed val which adds on each press
            this.maxSpeed=3;
            // here we maintain the record/list for the projectiles/bullet objs
            // where they carry the info regarding the shoots
            this.projectiles=[];
        }
        update(){
            // update based on the player controls/moments
            if(this.game.keys.includes('ArrowUp')) this.speedY=-this.maxSpeed;
            else if(this.game.keys.includes('ArrowDown')) this.speedY=this.maxSpeed;
            else this.speedY=0;
            this.y+=this.speedY;

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
            this.projectiles.forEach(projectile=>{
                projectile.update();
            });
            // now we have to filter those
            // so get me those who have flag as false which indicates 
            // they are within the limit;
            this.projectiles=this.projectiles.filter(projectile=> !projectile.markedForDeletion)
            // now we have to give this list of filtered to draw method
            // so that it will invoke the bullets draw method to put bullets with player moment


        }
        draw(context){
            // to specify which canvas element we want to draw the player guy
            context.fillStyle='black'; // player color
            context.fillRect(this.x,this.y,this.width,this.height);
            this.projectiles.forEach(projectile=>{
                projectile.draw(context);
                // giving the filtered bull objs with player context to draw bullets for the player

            });
        }
        // shooting part 

        // (***) =>update method
        // here the obj creation is told in the update method,
        // kindly refer to that
        // now we have a bullet limit, i.e no of bullets can be 
        // pressed, so we will 
        // invoke the shoot method only if we have bullets/ammo
        shootTop(){
            // here we invoke the Projectile class and give 
            // present player info, and coordinates
            if(this.game.ammo>0){
                this.projectiles.push(new Projectile(this.game,this.x+80,this.y+30)); 
                // here +80 , +30 
                // are for, where the bullet should start coming from
                // i.e from mouth / chest 
                this.game.ammo--;
            }
            // console.log(this.projectiles);
        }
        //*********************************************************** */
        // making projectile periodic movements; 
        // we will make calculation for FPS: FRAME PER SEC
        // it can be done by  1000ms (1 sec) / delta time = fps
        // so we neeed to calculate the delta time using animationFrame, go to that **))
         
    }
    // main blue print for enemy 
    class Enemy{
        constructor(game){
            this.game=game;
            this.x=this.game.width; // bcz they need to come from right to left
            this.speedX=Math.random()*-1.5 -0.5; // -0.5 to -2 px from to left
            this.markedForDeletion=false; // to destroy this enemy
            // lives and score for each enemy
            this.lives=5;
            this.score=this.lives;
        }   
        update(){
            this.x+=this.speedX;
            // now check if the enemy has come closer to left side
            // if so , then mark flag as true
            if(this.x+this.width<0) this.markedForDeletion=true;

        }
        draw(context){
            // drawing enemy 
            context.fillStyle='red';
            context.fillRect(this.x,this.y,this.width,this.height);
            // filling the lives in rect
            context.fillStyle='black'
            context.font='20px Helvetica'
            context.fillText(this.lives,this.x,this.y);
        }
    }
    // angler1 enemy
    class Angler1 extends Enemy{
        // to invoke this class, have afunction os addEnemy to
        // create child enemy objs ,and make sure that they are linked
        // to draw and updates
        constructor(game){
            super(game); // to invoke parents constructor =>
            // to take basic info from enemy class regarding the coords
            this.width=228 *0.2
            this.height=169 *0.2
            // fixing the angler air robot y axis direction

            // the y coordinate can be calculated by 
            // taking total 90% of players ht will make our flying bot to touch or go outside the box
            // so we reduce it by our height so that it can move within the screen
            this.y=Math.random()* (this.game.height*0.9 - this.height);
        }

    }
    // individual & multilayer background
    class Layer{

    }
    // pulls all the background objs
    class Background{

    }
    // Score , timer, ammo sticks on the top etc
    class UI{
        constructor(game){
            this.game=game 
            this.fontSize=25;
            this.fontFamily='Helvetica';
            this.color='white';
        }
        // it doesnt need update, only draw method is enough
        draw(context){
            // shadowing
            context.save();
            context.fillStyle=this.color;
            context.shadowOffsetX=2;
            context.shadowOffsetY=2;
            context.shadowColor='black'
            context.font=this.fontSize +'px '+this.fontFamily;
            // create bullt sticks as much they are present
            
            for(let i=0;i<this.game.ammo;i++){
                // moving the x corrdinate using loop i
                context.fillRect(20+5*i,50,3,20);
            }
            // score board display
            context.fillText('Score: '+this.game.score,20,40);

            // time feature adding, we also format the gametime, as it has
            // decimals so we have to round it to show only 1 dec after point
            const formattedTime=(this.game.gameTime * 0.001).toFixed(1)
            context.fillText('Timer: '+formattedTime,20,100)
            // game over message 
            if(this.game.gameOver){
                // if game is over then display message
                context.textAlign='center';
                let message1,message2;
                if(this.game.score>this.game.winningScore){
                    message1='You Win !';
                    message2='Well Done'
                }
                else{
                    message1='You Loose!';
                    message2='Try again next time';
                }
                context.font='50px '+this.fontFamily;
                context.fillText(message1, this.game.width*0.5, this.game.height*0.5-40)
                context.font='25px '+this.fontFamily;
                context.fillText(message2, this.game.width*0.5, this.game.height*0.5+40)
            }
            
            context.restore();
        }
    }
    // brain of the game
    class Game{
        constructor(width,height){
            this.width=width;
            this.height=height;
            // here 'this' in the below refers to the current game obj
            this.player=new Player(this);
            // initiating inputhandler class
            this.input=new InputHandler(this);
            this.keys=[]; // to store the control presses(up and down)
            this.ui=new UI(this); // to create bullet and score board on top
            // ammo/ bullet limit
            this.ammo=20;
            // ******** //
            // here for recharge of bullets ,we need 3 vars
            this.ammoTimer=0; // this is a counter 
            // from 0 to a ammoInterval (it takes deltaTime on each incre)
            this.ammoInterval=500
            // we need a max ammo , to make bullets as finite
            this.maxAmmo=50
            //*****//
            this.enemies=[]; // this will hold the enemy objs info
            // 3 periodic vars for enemies
            this.enemyTimer=0; // which is same as ammo timer
            this.enemyInterval=1000; // so for every 1sec of time, we want to 
            // create enemies
            this.gameOver=false; // to check whether game is over or not
            //** score board display**/
            this.score=0;
            this.winningScore=10;
            // ** game time limit** //
            this.gameTime=0;
            this.timeLimit=5000;
        }
        update(deltaTime){
            // time limit feature
            if(!this.gameOver) this.gameTime+=deltaTime
            if(this.gameTime>this.timeLimit) this.gameOver=true
            this.player.update();
            // update the ammo on recharge concept
            // if the counter exceeds
            if(this.ammoTimer>this.ammoInterval){
                // if my ammo is less than max ammo, then only increment ammo
                if(this.ammo<this.maxAmmo) this.ammo++;
                this.ammoTimer=0;
            }
            else{
                this.ammoTimer+=deltaTime;
            }
            // same as we did periodic for bullet , we have to do for 
            // enermy
            this.enemies.forEach(enemy=>{
                enemy.update();
                // so for each enermy we will check for its collision with
                // player

                if(this.checkCollision(this.player,enemy)){
                    // then mark del flag of that enemy as true
                    enemy.markedForDeletion=true;
                }
                // foreach bullet from this player, if it hits enemy,
                // decrease the enemy life and remove the bullet and 
                    // if enemy dies, increase the score 
                this.player.projectiles.forEach(projectile=>{
                    if(this.checkCollision(projectile,enemy)){
                        enemy.lives--;
                        projectile.markedForDeletion=true;
                    }
                    if(enemy.lives<=0){
                        enemy.markedForDeletion=true;
                        // increase the score only if game is still no over
                        if(!this.gameOver)this.score+=enemy.score;
                        if(this.score>this.winningScore) this.gameOver=true

                    }
                })
            })
            // only list them who are within and next
            // go to draw method below */*
            this.enemies=this.enemies.filter(enemy => !enemy.markedForDeletion);
            // if our enemyTimer counter exceeds then && game is not done
            if(this.enemyTimer>this.enemyInterval && !this.gameOver){
                this.addEnemy(); // create a new enemy
                // set the counter back to 0
                this.enemyTimer=0;
            }
            // else incre the counter
            else{
                this.enemyTimer+=deltaTime;
            }
        }
        draw(context){
            this.player.draw(context);
            this.ui.draw(context);
            // */*
            this.enemies.forEach(enemy=>{
                enemy.draw(context);
            })
        }
        // a function to invoke child enemy classes,
        // so to call these ,we need to use deltaTime for 
        // calling creating enemies periodiccallly
        addEnemy(){
            this.enemies.push(new Angler1(this));
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

        checkCollision(rect1,rect2){
            return (    rect1.x <rect2.x+rect2.width &&
                        rect2.x <rect1.x+rect1.width &&
                        rect1.y<rect2.y+rect2.height &&
                        rect2.y <rect1.y +rect1.height)
        }

    }

    const game=new Game(canvas.width,canvas.height);

    // animation loop

    // **)) 
    // here we calculate the delta time for each animation,
    // and pass it to Game class, so in the Game class, 
    // we make recharge for bullet limit as per delta time

    // here we get FPS as 60
    let lastTime=0;
    function animate(timeStamp){
        const deltaTime=timeStamp-lastTime;
        lastTime=timeStamp;
        // console.log(deltaTime);
        // this will clear out the previous drawn in the rectangle range
        ctx.clearRect(0,0,canvas.width,canvas.height)
        game.update(deltaTime);
        game.draw(ctx)
        requestAnimationFrame(animate) // it redeners the timestamp ref of the current animation froame
    }
    animate(0);



})