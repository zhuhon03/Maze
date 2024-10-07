const {Engine, Render, Runner, World, Bodies, Body, Events} = Matter;

const cellsX = 5;
const cellsY = 3;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width/cellsX;
const unitLengthY = height/cellsY;

const engine = Engine.create();
engine.world.gravity.y = 0;

const {world} = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options:{
        wireframes: false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(),engine);

//Walls
const walls =[
    Bodies.rectangle(width/2,0,width,2,{isStatic: true}),
    Bodies.rectangle(width/2,height,width,2,{isStatic: true}),
    Bodies.rectangle(0,height/2,2,height,{isStatic: true}),
    Bodies.rectangle(width,height/2,2,height,{isStatic: true}),
];
World.add(world, walls);

//Maze generation

// const grid=[];

// for(let i=0;i<3;i++){
//     grid.push([]);
//     for(let j=0;j<3;j++){
//         grid[i].push(false);
//     }
// }

const grid=Array(cellsY).fill(null).map(()=>Array(cellsX).fill(false));
const verticals=Array(cellsY).fill(null).map(()=>Array(cellsX-1).fill(false));
const horizontals=Array(cellsY-1).fill(null).map(()=>Array(cellsX).fill(false));

console.log(grid,verticals,horizontals)

const startRow=Math.floor(Math.random()*cellsY);
const startColumn=Math.floor(Math.random()*cellsX);

console.log(startRow,startColumn)

const stepThroughCell = (row, column)=>{
    if (grid[row][column]) return;
    grid[row][column]=true;

    const neighbors = getNeighbors(row, column);
    //console.log(neighbors)

    for(let neighbor of neighbors){
        const [nextRow, nextColumn, direction]=neighbor;
        
        if(grid[nextRow][nextColumn]){
            continue;
        }

        switch (direction) {
            case 'up':
                horizontals[row-1][column] = true;
                break;
            case 'down':
                horizontals[row][column] = true;
                break;
            case 'left':
                verticals[row][column-1]=true;
                break;
            case 'right':
                verticals[row][column]=true;
                break;
            default:
                break;
        }

        stepThroughCell(nextRow, nextColumn);
    }
}

const getNeighbors = (row, column)=>{
    const res=[];
    if(row-1>=0) res.push([row-1,column,'up']);
    if(row+1<cellsY) res.push([row+1, column,'down']);
    if(column-1>=0) res.push([row, column-1,'left']);
    if(column+1<cellsX) res.push([row, column+1,'right']);

    //console.log('res', res)
    //const arr = shuffle(res);
    //console.log('arr', arr)

    return shuffle(res);
}

const shuffle = (arr0)=>{
    const arr=arr0.slice();
    const res=[];
    let N=arr.length;
    for(let i=0;i<N;i++){
        let n=Math.floor(Math.random()*arr.length);
        res.push(arr.splice(n,1)[0]);
    }
    return res;
}

const shuffle2 = (arr)=>{
    let N=arr.length;
    while(N>1){
        let i=Math.floor(Math.random()*N);
        [arr[i],arr[N-1]]=[arr[N-1],arr[i]];
        N--;
    }
    return arr;
}

stepThroughCell(startRow,startColumn);
//console.log(shuffle([1,2,3,4]))
//console.log(shuffle2([1,2,3,4,5,6,7,8]))

horizontals.forEach((row, rowIndex)=>{
    row.forEach((open,columnIndex)=>{
        if(open){
            return;
        }

        const wall=Bodies.rectangle(
            columnIndex*unitLengthX+unitLengthX/2,
            rowIndex*unitLengthY+unitLengthY,
            unitLengthX,
            5,
            {
                isStatic:true,
                label:'wall',
                render:{
                    fillStyle:'red'
                }
            }
        );
        World.add(world,wall);
    });
});

verticals.forEach((row, rowIndex)=>{
    row.forEach((open,columnIndex)=>{
        if(open){
            return;
        }

        const wall=Bodies.rectangle(
            columnIndex*unitLengthX+unitLengthX,
            rowIndex*unitLengthY+unitLengthY/2,
            5,
            unitLengthY,
            {
                isStatic:true,
                label:'wall',
                render:{
                    fillStyle:'red'
                }
            }
        );
        World.add(world,wall);
    });
});


//Goal

const goal=Bodies.rectangle(
    width-unitLengthX/2,
    height-unitLengthY/2,
    unitLengthX*0.7,
    unitLengthY*0.7,
    {
        isStatic:true,
        label:'goal',
        render:{
            fillStyle:'green'
        }
    }
);
World.add(world,goal);

//Ball

const ball=Bodies.circle(
    unitLengthX/2,
    unitLengthY/2,
    Math.min(unitLengthX,unitLengthY)*0.25,
    {
        label:'ball',
        render:{
            fillStyle:'blue'
        }
    }
);
World.add(world,ball);

document.addEventListener('keydown',event=>{
    const {x,y}=ball.velocity;
    //console.log(x,y)

    if(event.keyCode===87){
        Body.setVelocity(ball,{x, y:y-5});
        // console.log('move ball up');
    }    
    if(event.keyCode===68){
        Body.setVelocity(ball,{x:x+5, y});
        //console.log('move ball right');
    }    
    if(event.keyCode===83){
        Body.setVelocity(ball,{x, y:y+5});
        //console.log('move ball down');
    }    
    if(event.keyCode===65){
        Body.setVelocity(ball,{x:x-5, y});
        //console.log('move ball left');
    }    
})


//Win Condition

Events.on(engine, 'collisionStart', event=>{
    event.pairs.forEach(collision => {
        const labels=['ball','goal'];
        if (labels.includes(collision.bodyA.label)
            && labels.includes(collision.bodyB.label)) {
                document.querySelector('.winner').classList.remove('hidden');
                console.log('You won!')
                world.gravity.y = 1;
                world.bodies.forEach(body => {
                    if (body.label === 'wall') {
                        Body.setStatic(body, false);
                    }
            })
        }
    });
});


