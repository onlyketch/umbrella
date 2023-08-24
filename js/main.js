const screenWidth = document.body.clientWidth;
const screenHeight = document.body.clientHeight;

//***Sprites***
Crafty.sprite('./images/hero.png', {hero:[0,0,127,111]});
Crafty.sprite('./images/drop.png', {drop:[0,0,44,84]});
Crafty.sprite('./images/ellipse.png', {ellipse:[0,0,74,30]});
Crafty.sprite('./images/particles.png', {particles:[0,0,65,51]});
Crafty.sprite('./images/umbrella.png', {umbrella:[0,0,144,145]});
Crafty.sprite('./images/drop-icon.png', {dropIcon:[0,0,24,37]});
Crafty.sprite(63, 63, './images/btns.png', {pauseBtn:[0,0], playBtn:[1,0]}, 0);
Crafty.sprite(43, 39, './images/hearts.png', {heartRed:[0,0], heartBlack:[1,0]}, 1);

Crafty.init(screenWidth, screenHeight, document.getElementById('game'));

const heroSpeed = 2;
let heroDir = 1;
let canMove = true;
const roomLeftBound = 50;
const roomRightBound = (screenWidth - 50) - 89;
let scores = 0;

var controller = Crafty.e('Delay');

Crafty.c('Umbrella', {
    init: function() {
        this.addComponent('2D, Canvas, umbrella, Draggable');
        this.w = 90;
        this.h = 90;
        this.x = screenWidth / 2 - this.w / 2;
        this.y = screenHeight / 2 - this.h / 2;
        this.z = 3;
    }
});

Crafty.c('Hero', {
    init: function() {
        this.addComponent('2D, Canvas, hero, Delay');
        this.w = 89;
        this.h = 78;
        this.x = screenWidth / 2 - this.w / 2;
        this.y = screenHeight - this.h - 80;
        this.delay(function() {
            heroDir = Crafty.math.negate(0.5); 
            canMove = !canMove; 
        }, 1000, -1);
    },
    events: {
        "UpdateFrame": function() {
            if (this.x > roomLeftBound && this.x < roomRightBound) {
                if (canMove) this.x = this.x + (heroSpeed * heroDir);
            } else {
                heroDir = heroDir * -1;
                if (canMove) this.x = this.x + (heroSpeed * heroDir);
            }
        }
    }
});

Crafty.c('ellipseObj', {
    type: null,
    init: function() {
        this.addComponent('2D, Canvas, ellipse');
        this.z = 1;
    },
    place: function(x, y, size) {
        this.x = x;
        this.y = y;
        this.type = size;
        switch (this.type) {
            case 'small':
                this.w = 40;
                this.h = 16;
                break;
            case 'medium':
                this.w = 59;
                this.h = 25;
                break;
            case 'large':
                this.w = 74;
                this.h = 30;
                break;    
        }
        return this;
    },
    events: {
        "UpdateFrame": function() {
            if (this.alpha > 0.1) {
                this.alpha = this.alpha - 0.1;
            }   
            else this.destroy();
        }
    }
});

Crafty.c('dropObj', {
    type: null,
    init: function() {
        this.addComponent("2D, Canvas, drop, Collision");
        this.type = Crafty.math.randomElementOfArray(['small', 'medium', 'large']);
        this.z = 2;
        this.checkHits('hero');
        this.onHit('Umbrella', function(HitData) {
            Crafty.e('SmallDrop').place(this.x, this.y, this.w, this.h);
            Crafty.e('SmallDrop').place(this.x, this.y, this.w, this.h);
            Crafty.e('SmallDrop').place(this.x, this.y, this.w, this.h);
            this.destroy();
        });
        switch (this.type) {
            case 'small':
                this.w = 30;
                this.h = 57;
                this.speed = 3;
                break;
            case 'medium':
                this.w = 34;
                this.h = 64;
                this.speed = 2.5;
                break;
            case 'large':
                this.w = 40;
                this.h =76;
                this.speed = 2;
                break;        
        }
    },
    place: function(x, y) {
        this.x = x;
        this.y = y;
        return this;
    },
    events: {
        "UpdateFrame": function() {
            if (this.y < hero.y) {
                this.y = this.y + this.speed;
            }  
            else {
                Crafty.e('ellipseObj').place(this.x - this.w / 2, this.y + this.h, this.type);
                this.destroy();
            }
        },
        "HitOn": function(hitData) {
            Crafty.e('Particles');
            this.destroy();
        }
    }
});

Crafty.c('SmallDrop', {
    init: function() {
        this.addComponent('2D, Canvas, drop');
        this.w = 10;
        this.h = 19;
        this.z = 2;
        this.origin('center');
        this.dir = Crafty.math.negate(0.5);
        this.speed = Crafty.math.randomNumber(2,4);
    },
    place: function(x, y, parentWidth, parentHeight) {
        this.x = Crafty.math.randomInt(x, x + parentWidth);
        this.y = y + parentHeight / 2;
    },
    events: {
        "UpdateFrame": function() {
            this.rotation = this.rotation - (10 * this.dir);
            this.y = this.y - this.speed;
            this.x = this.x + (this.speed * this.dir);
            if (this.x < -this.w || this.x > screenWidth + this.w || this.y < -this.h || this.y > screenHeight + this.h) 
            this.destroy();       
        }
    }
});

Crafty.c('Particles', {
    init: function() {
        this.addComponent('2D, Canvas, particles');
        this.w = 45;
        this.h = 35;
        this.z = 2;
        this.y = hero.y - this.h - 10;
    },
    events: {
        "UpdateFrame": function() {
            if (this.alpha > 0.1) {
                this.alpha = this.alpha - 0.1;
                this.x = hero.x + 20;
                this.y = this.y - 1;
            } else this.destroy();       
        }
    }
});

//UI Objects
Crafty.c('PauseBtn', {
    init: function() {
        this.addComponent('2D, Canvas, Mouse, pauseBtn');
        this.w = 50;
        this.h = 50;
        this.x = 50;
        this.y = 40;
        this.z = 10;
    },
    events: {
        "Click": function(e) {
            if (e.mouseButton == Crafty.mouseButtons.LEFT) {
                Crafty.pause();
            }
        }
    }
});

Crafty.c('Hearts', {
    init: function() {
        this.addComponent('2D, Canvas');
        this.x = screenWidth / 2 - 62;
        this.y = 52;
        this.z = 10;
        this.heartsArr = ['Heart', 'Heart', 'Heart'];
        this.heartStep = this.x;
        this.heartsArr.forEach(elem => {
            Crafty.e(elem).place(this.heartStep, this.y);
            this.heartStep = this.heartStep + 45;
        });
    }
});

Crafty.c('Heart', {
    init: function() {
        this.addComponent('2D, Canvas, heartRed');
        this.w = 35;
        this.h = 32;
        this.z = 10;
    },
    place: function(x, y) {
        this.x = x;
        this.y = y;
    }
});

Crafty.c('Score', {
    init: function() {
        this.addComponent('2D, Canvas');
        this.x = screenWidth - 140;
        this.y = 55;
        this.z = 10;
        Crafty.e('2D, Canvas, dropIcon').attr({x: this.x, y: this.y, w: 17, h: 26, z: 10});
        Crafty.e('2D, Canvas, Text')
            .attr({x: this.x + 32, y: this.y + 2, z: 10})
            .text('0000')
            .textColor('#376067')
            .textFont({
                'family': 'Poppins',
                'size': '28px'
            });
    }
});


controller.delay( function() {
    let xPos = Crafty.math.randomInt(roomLeftBound, roomRightBound);
    Crafty.e('dropObj').place(xPos, -76);
}, 2000, -1);

var hero = Crafty.e('Hero');
var umbrella = Crafty.e('Umbrella');
var pauseBtn = Crafty.e('PauseBtn');
var hearts = Crafty.e('Hearts');
var score = Crafty.e('Score');

