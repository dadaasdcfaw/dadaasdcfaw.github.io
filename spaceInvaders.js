document.addEventListener("DOMContentLoaded", function() {
    var menu = document.getElementById("panel_start")
    var instr = document.getElementById("panel_instrucciones")
    var fin  = document.getElementById("panel_fin")

    var paneles = document.getElementsByClassName("panel")

    var bt_start = document.getElementById("BT_start")
    bt_start.addEventListener("click", startGame)
    var bt_instr = document.getElementById("BT_instrucciones")
    bt_instr.addEventListener("click", showInstr)
    var bt_menuback = document.getElementById("BT_menuback")
    bt_menuback.addEventListener("click", back2Menu)
    var bt_finJuego = document.getElementById("BT_restart")
    bt_finJuego.addEventListener("click", back2Menu)
    preventSpaceButtonClick()
    var c = document.getElementById("pantalla");
    var width = c.width;
    var height = c.height;
    
    var  fpsInterval, now, then, elapsed;
    var endGame = new Timer(function(){}, 0)

    if (localStorage.mejorPuntuacion == undefined){
        localStorage.setItem("mejorPuntuacion",0) 
    }
    var ctx = c.getContext("2d")

    var gameIsRunning = false;

    var gradient = ctx.createLinearGradient(0, 0, 170, 0);
    gradient.addColorStop("0", "magenta");
    gradient.addColorStop("0.5" ,"blue");
    gradient.addColorStop("1.0", "red");

    ocultarPaneles()
    menu.style.zIndex=1
    menu.style.opacity=1


    var keyState = {
        down : {},   // True if key is down
        toggle : {},  // toggles on key up
        changed : {},  // True if key state changes. Does not set back false
                      // or you will lose a change 
    }
    var balas = []
    var impactos = 0
    var disparos = 0    
    var precision = 0

    var nave = {
        ancho:50,
        alto:50,
        x: width/2 - 25,
        y: height-50-3,
        //holdear aumenta la velocidad, levantar resetea
        aceleracion : 0.3,
        vel : {
            def:10,
            x:10,
            y:10,
        },

        calcPos(){
            if(keyState.down.KeyA) { // left  is down }
                this.x -= this.vel.x;
                if (this.x < 0) this.x = 0 + 3;

                // si se pulsa izq y der, resetear velocidad
                if (keyState.down.KeyD) this.vel.x = this.vel.def
                else this.vel.x += this.aceleracion

                
            }else
            
            if(keyState.down.KeyD) { // right  is down }
                this.x += this.vel.x;
                if (this.x + this.ancho> width) this.x = width-this.ancho-3;

                // si se pulsa izq y der, resetear velocidad
                if (keyState.down.KeyA) this.vel.x = this.vel.def
                else this.vel.x += this.aceleracion
            }else
            
            //si no se pulsa nada, resetear velocidad
            if (!keyState.down.KeyA & !keyState.down.KeyD) this.vel.x = this.vel.def
            
            /*
            if (keyState.down.KeyW) {
                this.y -= this.vel.y;
                if (this.y < 0) this.y = 0;
            }
        
            if (keyState.down.KeyS) {
            this.y += this.vel.y;
            if ( this.y + this.alto> height)this.y = height - this.alto;
            }*/
            
            if(keyState.down.Space && keyState.changed.Space){
                // key has been pushed down since last time we checked.
                nuevaBala = Object.create(disparo)
                nuevaBala.x = this.x
                nuevaBala.y = this.y
                balas = [...balas, nuevaBala]
                disparos++
            }keyState.changed.Space = false; // Clear it  so we can detect next changeey

             
        }
    }
    var enemigo = {
        vida: 5,
        vel: 5,
        x: width/2-50,
        y: 10,
        ancho: 100,
        alto:80,
        calcPos(){
            if (this.x < width/3) this.vel *= -1
            else if (this.x > 2*width/3) this.vel *= -1

            this.x += this.vel
        } 
    }
    var disparo = {
        x:100,
        y:height,
        vel:25,
        ancho:6,
        alto:15,
        color:"black",

        calcPos(){
            //mover las balas mientras esten dentro de la pantalla
            //console.log(balas.length)
            
            let id_remov = []
            for (let i=0; i<balas.length; i++){
                if (balas[i].y + balas[i].alto > 0) balas[i].y -= balas[i].vel
                else id_remov = [...id_remov, i]
                
                //console.log(balas[i].x)
            }
            // eliminar de la lista las que estan fuera de la pantalla
            for (i of id_remov){
                // splice(idx, n) desde la posicion idx, eliminar n elementos
                balas.splice(i,1)
                precision = Math.round((100*impactos/disparos) * 10) / 10
                
            }
           
        },
        
    }

    dibujar()

    function dibujar(){
        
        ctx.clearRect(0, 0, c.width, c.height);
        
        ctx.shadowColor = 'red';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        //main char
        var grd = ctx.createLinearGradient(0,0,width,height)
        grd.addColorStop(0, "#000");
        grd.addColorStop(1, "#222");
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, width, height);
        ctx.lineWidth = 5
        ctx.strokeStyle = "#FEE"
        ctx.strokeRect(nave.x, nave.y, 50, 50);

        //ctx.stroke();

        //enemy
        ctx.lineWidth = 5
        ctx.strokeStyle = "#EFE"
        ctx.shadowColor = 'green';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.beginPath();
        ctx.moveTo(enemigo.x, enemigo.y);
        ctx.lineTo(enemigo.x + enemigo.ancho, enemigo.y);
        ctx.lineTo(enemigo.x + enemigo.ancho/2, enemigo.y + enemigo.alto);
        ctx.lineTo(enemigo.x, enemigo.y);
        ctx.closePath();
        ctx.stroke();

        //balas
        for (bala of balas){

            ctx.lineWidth = 3
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.strokeStyle='red'

            //createRadialGradient(x0, y0, r0, x1, y1, r1)
            //x0, y0, r0 --> coord & radio circulo 1
            //x1, y1, r1 --> coord & radio circulo 2
            let grad = ctx.createRadialGradient(
                bala.x - bala.ancho/2,
                bala.y - bala.alto/2,
                300,
                bala.x - bala.ancho/2,
                bala.y - bala.alto/2,
                0);     
            grad.addColorStop(0,"transparent");
            grad.addColorStop(0.33,"rgba(0,0,0,1)");	// extra point to control "fall-off"
            grad.addColorStop(1,"red");

                                    
            ctx.fillStyle = grad;
            ctx.filter = "blur(5px)";
            let grosor_brillo_x = 2 * bala.ancho
            let grosor_brillo_y = 1.2 * bala.alto
            let posX = bala.x + bala.ancho/2 - grosor_brillo_x/2
            let posY = bala.y + bala.alto/2 - grosor_brillo_y/2
            ctx.fillRect(
                posX,
                posY,
                grosor_brillo_x,
                grosor_brillo_y);

            ctx.filter = "none"
            ctx.fillStyle = "white"
            ctx.fillRect(bala.x, bala.y, bala.ancho, bala.alto);
           
        }

        //puntuacion
        ctx.lineWidth = 5

        ctx.strokeStyle = "#EEF"

        ctx.shadowColor = "orange";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.font = "30px Montserrat";
        ctx.fillStyle = "#eee"
        ctx.fillText(`Disparos: ${disparos}`, 25, 50); 
        ctx.fillText(`Impactos: ${impactos}`, 25, 100);
        ctx.fillText(`Precisión: ${precision} %`, 25, 150);
        if (impactos>localStorage.mejorPuntuacion){
            localStorage.setItem("mejorPuntuacion", impactos)
        }
        ctx.fillText(`Récord de impactos: ${localStorage.mejorPuntuacion}`, 25, 225)
        tiempoRestante = (endGame.getTimeLeft()>0)? endGame.getTimeLeft()/1000:0
        tiempoRestante = (Math.round(tiempoRestante * 10) / 10).toFixed(1)
        console.log(tiempoRestante)

        ctx.font = "35px Montserrat";
        ctx.fillText("Tiempo:", width-200, 70)
        ctx.font = "80px NeonCaps";
        ctx.fillText(`${tiempoRestante}`, width-175, 150)
    }

    function frameFuncs(){
        
        if (!gameIsRunning){return}

        // request another frame
        requestAnimationFrame(frameFuncs);

        // calc elapsed time since last loop
        now = Date.now();
        elapsed = now - then;

        if (keyState.down.KeyR){

            endGame.pause()
            endGame = new Timer(acabarJuego, 10000)

            reset()
        }
        // if enough time has elapsed, draw the next frame
        if (elapsed > fpsInterval) {

            // Get ready for next frame by setting then=now, but...
            // Also, adjust for fpsInterval not being multiple of 16.67
            then = now - (elapsed % fpsInterval);
    
            // draw stuff here
            nave.calcPos()
            disparo.calcPos()
            enemigo.calcPos()
            calcColision()
            dibujar();
        }
    }

    function calcColision(){
        var tan_a = 2*enemigo.alto/enemigo.ancho
        for (bala of balas){
            
            let dif_altura_enemBala = enemigo.y + enemigo.alto - bala.y
            if (dif_altura_enemBala>0){

                let ancho_inst =  2* dif_altura_enemBala/tan_a

                if (bala.x+bala.ancho/2 > enemigo.x + enemigo.ancho/2){
                    //bala a la derecha del triangulo
                    var distX = bala.x - (enemigo.x + enemigo.ancho/2 + ancho_inst/2)
                }else{
                    //bala a la izq del triangulo
                    var distX = (enemigo.x + enemigo.ancho/2 - ancho_inst/2) - (bala.x + bala.ancho)
                }

    
                //colision 
                if (distX<0){
                    impactos++
                    bala.y = -50
                }
                //colision der

                
            }
        }
    }

    function keyHandler(e){  // simple but powerful
        if(keyState.down[e.code] !== (e.type === "keydown")){
            keyState.changed[e.code] = true;
        }
        keyState.down[e.code] = e.type === "keydown";
        if(e.type === "keyup"){
            keyState.toggle[e.code] = !keyState.toggle[e.code];
        }
        //console.log(e.code)

    }

    document.addEventListener("keydown", keyHandler);
    document.addEventListener("keyup", keyHandler);

    function startGame(e){
        ocultarPaneles()
        gameIsRunning = true
        
        endGame = new Timer(acabarJuego, 10000)
        //bt_start.removeEventListener("click",startGame)
        startAnimating(60);
    }

    function startAnimating(fps) {
        fpsInterval = 1000 / fps;
        then = Date.now();
        startTime = then;
        frameFuncs();
    }

    function showInstr(e){
        ocultarPaneles()
        instr.style.zIndex = 1
        instr.style.opacity = 1

        let fondoInstruc = ctx.getElementById("fondoInstrucciones")
        
    }

    function back2Menu(e){
        ocultarPaneles()
        menu.style.zIndex = 1
        menu.style.opacity = 1
        
        //bt_start.addEventListener("click",startGame)
    }

    function reset(){
        disparos=0
        impactos=0
        precision=0
        balas = []
        enemigo.x = width/2
        enemigo.vel = Math.abs(enemigo.vel)
        nave.x = width/2
        nave.vel.x = 10
    }

    function acabarJuego(){
        
        gameIsRunning=false
        endGame.pause()
        //clearInterval(to)
        reset()
        back2Menu()

        ocultarPaneles()
        fin.style.zIndex=1
        fin.style.opacity=1
        check_restart = setInterval(function(){
            if (keyState.down.KeyR){
                clearInterval(check_restart)
                startGame()
            }
        },30)
    }
    function ocultarPaneles(){
        for (panel of paneles){
            //put all panels in the back of the game
            panel.style.zIndex = -1
            panel.style.opacity = 0
        }
    }
    function preventSpaceButtonClick(){
        document.querySelectorAll("button").forEach( function(item) {
            item.addEventListener('focus', function() {
                this.blur();
            })
        })
    }

});

class Timer {
    constructor(callback, delay) {
        var id, started, remaining = delay, running;

        this.start = function () {
            running = true;
            started = new Date();
            id = setTimeout(callback, remaining);
        };

        this.pause = function () {
            running = false;
            clearTimeout(id);
            remaining -= new Date() - started;
        };

        this.getTimeLeft = function () {
            if (running) {
                this.pause();
                this.start();
            }

            return remaining;
        };

        this.getStateRunning = function () {
            return running;
        };

        this.start();
    }
}






