// MIT License

// Copyright (c) 2019 Erin Catto

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

let demo = initDemo6();

// ----------------------------------------------------------------------------
function initDemo1()
{
  let world = initWorld();
  let objs = [];
  objs.push(world.addStaticBody({ id: "gnd", pos: { u0: 0, u1: -10 }, rot: 0, width: { u0: 100, u1: 20 } }));
  objs.push(world.addDynamicBody({ id: "box", pos: { u0: 0, u1: 4 }, rot: 0, width: { u0: 1, u1: 1 }, mass: 200 }));
  return { objs: objs, world: world };
}

// ----------------------------------------------------------------------------
function initDemo2()
{
  let world = initWorld();
  let objs = [];
  objs.push(world.addStaticBody({ id: "gnd", pos: { u0: 0, u1: -10 }, rot: 0, width: { u0: 100, u1: 20 } }));
  objs.push(world.addDynamicBody({ id: "b1", pos: { u0: 0, u1: 4 }, rot: 0, width: { u0: 1, u1: 1 }, mass: 200 }));
  objs.push(world.addDynamicBody({ id: "b2", pos: { u0: 0.4, u1: 6 }, rot: 0, width: { u0: 10, u1: 0.1 }, mass: 200 }));
  objs.push(world.addDynamicBody({ id: "b3", pos: { u0: -2, u1: 8 }, rot: 0, width: { u0: 0.5, u1: 0.5 }, mass: 50 }));
  objs.push(world.addDynamicBody({ id: "b4", pos: { u0: -3, u1: 8 }, rot: 0, width: { u0: 0.5, u1: 0.5 }, mass: 50 }));
  objs.push(world.addDynamicBody({ id: "b5", pos: { u0: 2, u1: 12 }, rot: 0, width: { u0: 1, u1: 1 }, mass: 200 }));
  return { objs: objs, world: world };
}

// ----------------------------------------------------------------------------
function initDemo3()
{
  let world = initWorld();
  let objs = [];
  objs.push(world.addStaticBody({ id: "gnd", pos: { u0:  0.0,  u1: -14 }, rot:  0.0,  width: { u0: 100, u1: 20 } }));
  objs.push(world.addStaticBody({ id: "frm1", pos: { u0: -2.0,  u1: 7.0 }, rot: -0.25, width: { u0: 13, u1: 0.25 } }));
  objs.push(world.addStaticBody({ id: "frm2", pos: { u0:  2.0,  u1: 3.0 }, rot:  0.25, width: { u0: 13, u1: 0.25 } }));
  objs.push(world.addStaticBody({ id: "frm3", pos: { u0: -2.0, u1: -1.0 }, rot: -0.25, width: { u0: 13, u1: 0.25 } }));
  objs.push(world.addStaticBody({ id: "stp1", pos: { u0:  5.25, u1: 5.5 }, rot:  0.0,  width: { u0: 0.25, u1: 1 } }));
  objs.push(world.addStaticBody({ id: "stp2", pos: { u0: -5.25, u1: 1.5 }, rot:  0.0,  width: { u0: 0.25, u1: 1 } }));

  const friction = [ 0.75, 0.5, 0.35, 0.1, 0.0 ];
  for (let i = 0; i < 5; i++) {
    let obj = world.addDynamicBody({ id: "b" + i, pos: { u0: -7.5 + 2.0 * i, u1: 10 }, rot: 0, width: { u0: 0.5, u1: 0.5 }, mass: 25 });
    obj.friction = friction[i];
    objs.push(obj);
  }
  return { objs: objs, world: world };
}

// ----------------------------------------------------------------------------
function initDemo4()
{
  let world = initWorld();
  let objs = [];
  objs.push(world.addStaticBody({ id: "gnd", pos: { u0:  0.0,  u1: -14 }, rot:  0.0,  width: { u0: 100, u1: 20 } }));

  for (let i = 0; i < 10; i++) {
    let x = Math.random() * 0.2 - 0.1;
    objs.push(world.addDynamicBody({ id: "b" + i, pos: { u0: x, u1: -4 + 0.51 + 1.05 * i }, rot: 0, width: { u0: 1, u1: 1 }, mass: 1 }));
  }
  return { objs: objs, world: world };
}

// ----------------------------------------------------------------------------
function initDemo5()
{
  let world = initWorld();
  let objs = [];
  objs.push(world.addStaticBody({ id: "gnd", pos: { u0:  0.0,  u1: -14 }, rot:  0.0,  width: { u0: 100, u1: 20 } }));

  for (let i = 0; i < 12; i++) {
    let x = -6.0 + i * 0.5625;
    for (let j = i; j < 12; j++) {
      objs.push(world.addDynamicBody({ id: "r"+i+"c"+j, pos: { u0: x, u1: 0.75 + 2.0 * i }, rot: 0, width: { u0: 1, u1: 1 }, mass: 10 }));
      x += 1.125;
    }
  }
  return { objs: objs, world: world };
}

// ----------------------------------------------------------------------------
function initDemo6()
{
  let world = initWorld();
  let objs = [];

  let gnd = world.addStaticBody({ id: "gnd", pos: { u0:  0.0,  u1: -14 }, rot:  0.0,  width: { u0: 100, u1: 20 } });
  let pdl = world.addDynamicBody({ id: "pdl", pos: { u0: 9, u1: 11 }, rot: 0, width: { u0: 1, u1: 1 }, mass: 100 });

  objs.push(gnd);
  objs.push(pdl);
  world.addJoint({ b1: gnd, b2: pdl, anchor: { u0: 0, u1: 11 } });

  return { objs: objs, world: world };
}

// ----------------------------------------------------------------------------
function main()
{
  let wgl = initGl();
  let prev_t_sec = 0;

  function render(t_msec)
  {
    const t_sec = t_msec * 0.001;
    const dt = t_sec - prev_t_sec;
    prev_t_sec = t_sec;

    for (let i = 0; i < 4; i++) {
      demo.world.step(0.01);
    }

    drawScene(wgl, demo.objs);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();