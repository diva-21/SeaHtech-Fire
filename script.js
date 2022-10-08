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
                console.log(this.game.keys);
            });
            window.addEventListener('keyup',(e)=>{
                // if u find a presence of the hold out key in the array,
                // remove it 
                if(this.game.keys.indexOf(e.key)>-1){
                    this.game.keys.splice(this.game.keys.indexOf(e.key),1);
                }
                console.log(this.game.keys);
            })
        }

    }
    // handling player lazers
    class Projectile{
        constructor(){

        }
    }
    // handling bolts and things
    class Particle{

    }
    // handling main char
    class Player{
        constructor(game){
            this.game=game;
            this.width=120;
            this.height=190;
            this.x=20;
            this.y=100;
            this.speedY=0;
            this.maxSpeed=3;
        }
        update(){
            // update based on the controls
            if(this.game.keys.includes('ArrowUp')) this.speedY=-this.maxSpeed;
            else if(this.game.keys.includes('ArrowDown')) this.speedY=this.maxSpeed;
            else this.speedY=0;
            this.y+=this.speedY;
        }
        draw(context){
            // to specify which canvas element we want to draw
            context.fillRect(this.x,this.y,this.width,this.height);
        }
    }
    // main blue print for enemy 
    class Enemy{

    }
    // individual & multilayer background
    class Layer{

    }
    // pulls all the background objs
    class Background{

    }
    // Score , timer etc
    class UI{

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
        }
        update(){
            this.player.update();
        }
        draw(context){
            this.player.draw(context);
        }
    }

    const game=new Game(canvas.width,canvas.height);

    // animation loop
    function animate(){
        // this will clear out the previous drawn in the rectangle range
        ctx.clearRect(0,0,canvas.width,canvas.height)
        game.update();
        game.draw(ctx)
        requestAnimationFrame(animate)
    }
    animate()



})