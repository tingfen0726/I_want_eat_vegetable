var myGamePiece;
let score = 0;
var myObstacles = [];
let gameRunning = false;
let keys = {};
let people_speed = 0.005;
let fall_speed = 0.01;

document.addEventListener("keydown", function(e){
    keys[e.key] = true;
});

document.addEventListener("keyup", function(e){
    keys[e.key] = false;
});

function updatePlayerMovement() {
    if(keys["a"]) myGamePiece.speedX = -myGameArea.canvas.width * people_speed;  // 直接用固定速度
    else if(keys["d"]) myGamePiece.speedX = myGameArea.canvas.width * people_speed;
    else myGamePiece.speedX = 0;
}

function startGame() {
    myGameArea.ready();
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    ready : function() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight * 0.5625;

        let w = 60, h = 60;
        let centerX = (this.canvas.width - w)/2;
        let centerY = ((this.canvas.height * 0.93) - h);
        myGamePiece = new component(w, h, "people.png", centerX, centerY, "image");

        this.canvas.setAttribute("tabindex", "0");
        this.canvas.style.outline = "none";
        this.canvas.focus();
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        updateGameArea()
    },
    start : function() {
        gameRunning = true;
        this.interval = setInterval(updateGameArea, 20);
        },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() {
        clearInterval(this.interval);
    }
}

function component(width, height, color, x, y, type) {
    this.type = type;
    if (type == "image") {
        this.image = new Image();
        this.image.src = color;
    }
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;    
    this.x = x;
    this.y = y;    
    this.update = function() {
        ctx = myGameArea.context;
        if (type == "image") {
            ctx.drawImage(this.image, 
                this.x, 
                this.y,
                this.width, this.height);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    this.newPos = function() {
        this.x += this.speedX;
        if(this.x < 0) this.x = 0;
        if(this.x > myGameArea.canvas.width - this.width) this.x = myGameArea.canvas.width - this.width;
    }
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }
}

myGameArea.canvas.addEventListener("mousedown", function(e){
    if(gameRunning == false){
        myGameArea.start();
    }
    else{
        const rect = myGameArea.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;

        if(mouseX < myGameArea.canvas.width / 2){
            keys["a"] = true;  // 左半邊當作按下左鍵
        } else {
            keys["d"] = true;  // 左半邊當作按下左鍵
        }
    }
});
myGameArea.canvas.addEventListener("mouseup", function(e){
    keys["a"] = false;
    keys["d"] = false;
});

myGameArea.canvas.addEventListener("touchstart", function(e){
    if(gameRunning == false){
        myGameArea.start();
    } else {
        const rect = myGameArea.canvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;  // 第一個觸碰點
        if(touchX < myGameArea.canvas.width / 2){
            keys["a"] = true;
        } else {
            keys["d"] = true;
        }
    }
    e.preventDefault(); // 避免滾動
}, {passive:false});

myGameArea.canvas.addEventListener("touchend", function(e){
    keys["a"] = false;
    keys["d"] = false;
}, {passive:false});

function updateGameArea() {
    myGameArea.clear();

    var ctx = myGameArea.context;
    var grd = ctx.createLinearGradient(0, 0, 0, myGameArea.canvas.height);
    grd.addColorStop(0,"rgba(209, 223, 231, 1)");
    grd.addColorStop(0.4,"#46cbddff");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, myGameArea.canvas.width, myGameArea.canvas.height * 0.85);

    ctx.fillStyle = "#89cc85ff";
    ctx.fillRect(0,myGameArea.canvas.height * 0.85,myGameArea.canvas.width,myGameArea.canvas.height * 0.15);

    if(gameRunning == false){
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("點擊螢幕開始", myGameArea.canvas.width / 2, myGameArea.canvas.height / 2);
    }
    else{
        updatePlayerMovement();
        for (i = 0; i < myObstacles.length; i += 1) {
            if (myGamePiece.crashWith(myObstacles[i])) {
                score += 10;
                myObstacles.splice(i, 1);
                i--;
            } 
        }

        ctx.font = "20px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("score:" + score, 50, 30);

        myGamePiece.newPos();
        myGamePiece.update();

        myGameArea.frameNo += 1;
        if (myGameArea.frameNo == 1 || everyinterval(20)) {
            minX = 0;
            maxX = myGameArea.canvas.width;
            width = Math.floor(Math.random()*(maxX-minX+1)+minX);
            myObstacles.push(new component(40, 40, "vegetable.png", width, -10, "image"));
        }

        for (i = 0; i < myObstacles.length; i += 1) {
            myObstacles[i].y += myGameArea.canvas.height * fall_speed;
            myObstacles[i].update();
        }
    }
    
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}

myGameArea.canvas.addEventListener("keyup", function(e) {
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;
});

document.getElementById("edit").addEventListener("click", () => {
    const setDiv = document.getElementById("set");
    const style = window.getComputedStyle(setDiv);
    setDiv.style.display = (style.display === "none") ? "block" : "none";

    document.getElementById("speed").value = people_speed * 1000;
    document.getElementById("fall").value = fall_speed * 1000;
});

document.getElementById("speed").addEventListener("input", () => {
    people_speed = Number(document.getElementById("speed").value) / 1000;
});
document.getElementById("fall").addEventListener("input", () => {
    fall_speed = Number(document.getElementById("fall").value) / 1000;
});



