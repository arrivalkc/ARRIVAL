var Canvas_Handler_Class = function(canvas, name)
{
	canvas.Display = this;

	this.Name = name;
	this.Width = canvas.width;
	this.Height = canvas.height;
	var draw_que = [];
	var Drawables = [];

	var Game;
	var kill = true;
	var wipe = false;
	var imageData;
	var xScale = 1;
	var yScale = 1;
	this.X_Offset = 0;
	this.Y_Offset = 0;
	this.Context = canvas;

	function defaultEmptyFunction(canvas, drawable, x, y)
	{
		canvas.clearRect(x,y,drawable.Width.Get(),drawable.Height.Get());
	}
	function Draw_Drawables()
	{
		for(var i in draw_que)
		{
			var cur = Drawables[draw_que[i][0]];
			if(cur.Style.Get()==0)
			{
				// cur.Clear(canvas);
				Canvas.Drawer(canvas, cur, function(canvas, cur, x, y){
					canvas.clearRect(x,y,cur.Width.Get(),cur.Height.Get());
				}, xScale, yScale);
			}
			else if(cur.Style.Get()==1)
			{
				Canvas.Drawer(canvas, cur, function(canvas, cur, x, y){
					canvas.Display.Background.Source.Get().Draw(canvas,x,y,cur.Width.Get(),cur.Height.Get(),canvas.Display.Background.State.Get());
				}, xScale, yScale);
			}
			var quick = draw_que[i][1];
			for(var j=0;j<quick.length;j+=2)
			if(quick[j]!=null)
				quick[j].data = quick[j+1];
			Canvas.Drawer(canvas, cur, function(canvas, cur, x, y){
				cur.Source.Get().Draw(canvas,x,y,cur.Width.Get(),cur.Height.Get(),cur.State.Get());
			}, xScale, yScale);
		}
		draw_que = [];
	};
	function Queue(index, info, value)
	{
		for(var i=0;i<draw_que.length;i++)
		if(index==draw_que[i][0])
		{
			draw_que[i][1][draw_que[i][1].length] = info;
			draw_que[i][1][draw_que[i][1].length] = value;
			return;
		}
		draw_que[draw_que.length] = [index,[info,value]];
	}
	function Additional(){}
	var Additional_Arguments;
	function Once(){}
	var Once_Arguments;

	this.Draw = function()
	{
		doodle();
	};
	function doodle()
	{
		Draw_Drawables();
		Additional(canvas, Game, Additional_Arguments);
		Once(canvas, Game, Once_Arguments);
		Once = function(){};
	}
	function Update(self)
	{
		if(wipe)
		{
			Additional = function(){};
			Drawables = [];
			draw_que = [];
			self.Background = self.Add_Drawable(self.Background);
			wipe = false;
			self.X_Offset = 0;
			self.Y_Offset = 0;
		}
		if(kill)return;
		doodle();
		setTimeout(function(){Update(self);},tpf);
	}

	this.Add_Drawable = function(src,name,x,y,w,h,sta,sty,al,an)
	{
		if(src==null)
		{
			if(Canvas.errReport)console.error("No information sent.")
			return;
		}
		if(!src.Draw)
		{
			if(Canvas.errReport)console.error("No drawable data present.");
			return;
		}
		var draw_index = Drawables.length;
		if(src.drawable_class)
		{
			src.Redraw = function()
			{
				Queue(draw_index);
			};
			Drawables.push(src);
			Queue(draw_index);
			return src;
		}
		if(sty==null)sty=0;
		if(al==null)al=1;
		if(an==null)an=0;
		if(name==null)
		{
			name = "UNNAMMED"+draw_index;
			if(Canvas.errReport)console.error("No name defined. Name set to "+name);
		}
		else for(var i=0;i<draw_index;i++)
		{
			if(Drawables[i].Name==name)
			{
				if(Canvas.errReport)console.error("Name "+name+" already declared in canvas "+this.Name+". Overwriting");
				draw_index = i;
				break;
			}
		}
		var drawable = new Canvas.Drawable(src, function(index,info,input){
			Queue(index,info,input);
		}, x, y, w, h, sta, sty, al, an, defaultEmptyFunction);
		drawable.Index = draw_index;
		drawable.Name = name;
		drawable.Redraw = function()
		{
			Queue(draw_index);
		};
		Drawables.push(drawable);
		Queue(draw_index);
		return drawable;
	};
	this.Get_Drawable = function(i)
	{
		if(i>=Drawables.length)
		{
			if(Canvas.errReport)console.error("Drawable index of "+i+" does not exist.");
			return null;
		}
		return Drawables[i];
	};
	this.Get_Drawable_by_Name = function(name)
	{
		for(var i=0;i<Drawables.length;i++)
		{
			if(Drawables[i].Name()==name)
			{
				return Drawables[i];
			}
		}
		return null;
	};
	this.Delete_Drawable = function(index)
	{
		if(index.Source)
		{
			for(var i=0;i<Drawables.length;i++)
			{
				if(Drawables[i]==index)
				{
					canvas.clearRect(index.X.Get(), index.Y.Get(), index.Width.Get(), index.Height.Get());
					Drawables.splice(i, 1);
					return true;
				}
			}
		}
		else if(index>=0&&index<Drawables.length)
		{
			canvas.clearRect(Drawables[i].X.Get(), Drawables[i].Y.Get(), Drawables[i].Width.Get(), Drawables[i].Height.Get());
			Drawables.splice(index, 1);
			return true;
		}
		else
		{
			for(var i in Drawables)
			{
				if(Drawables[i].Name==index)
				{
					canvas.clearRect(Drawables[i].X.Get(), Drawables[i].Y.Get(), Drawables[i].Width.Get(), Drawables[i].Height.Get());
					Drawables.splice(i, 1);
					return true;
				}
			}
		}
		if(Canvas.errReport)console.error("Drawable index of "+index+" does not exist.");
		return false;
	};

	this.Scale = function(x, y)
	{
		xScale = x;
		yScale = y;
	};
	this.Slide_X = function(amt)
	{
		this.X_Offset+=amt;
		var copy = canvas.getImageData(amt, 0, canvas.width, canvas.height);
		canvas.putImageData(copy, 0, 0);
	};
	this.Slide_Y = function(amt)
	{
		this.Y_Offset+=amt;
		var copy = canvas.getImageData(0, amt, canvas.width, canvas.height);
		canvas.putImageData(copy, 0, 0);
	};

	this.Redraw = function()
	{
		for(var i in Drawables)
		{
			Queue(i);
		}
		if(kill)this.Draw();
	};
	this.Dead = function()
	{
		kill = true;
	};
	this.Clear = function()
	{
		canvas.clearRect(0,0,Canvas.Width,Canvas.Height);
	};
	this.Wipe = function()
	{
		wipe = true;
	};
	this.Clean = function()
	{
		this.Wipe();
		this.Clear();
	};

	this.Stop = function()
	{
		kill = true;
	};
	this.Start = function()
	{
		if(!kill)return;
		kill = false;
		Update(this);
	};

	this.Set_Default_Empty_Function = function(fnc)
	{
		defaultEmptyFunction = fnc;
	};
	this.Set_Game = function(game)
	{
		Game = game;
	}
	this.Draw_Once = function(func, args)
	{
		Once = func;
		Once_Arguments = args;
	}
	this.Additonal_Display = function(func, args)
	{
		Additional = func;
		Additional_Arguments = args;
	}

	this.Background = this.Add_Drawable(Shape.Rectangle, "BACKGROUND", 0, 0, this.Width, this.Height, "#000", 2, 0, 0);
};

var Info = function(_d, parent, changed)
{
	this.data = _d;
	this.Get = function()
	{
		return this.data;
	};
	this.Set = function(input)
	{
		if(changed)changed(parent.Index,this,input);
	};
};
var Canvas = {
	errReport:false,
	No_Draw:{Draw:function(){}},
	Drawer:function(canvas, drawable, func, xScale, yScale)
	{
		canvas.save();
		if(!xScale)xScale=1;
		if(!yScale)yScale=1;
		var X = drawable.X.Get();
		var Y = drawable.Y.Get();
		var Width = drawable.Width.Get();
		var Height = drawable.Height.Get();
		if(canvas.Display!=null)
		{
			X-=canvas.Display.X_Offset;
			Y-=canvas.Display.Y_Offset;
		}
		if(drawable.Invert_X.Get()&&Width!=null)
		{
			canvas.translate(Width,0);
			canvas.scale(-1,1);
			X*=-1;
		}
		if(drawable.Invert_Y.Get()&&Height!=null)
		{
			canvas.translate(0,Height);
			canvas.scale(1,-1);
			Y*=-1;
		}
		canvas.scale(xScale,yScale);
		canvas.globalAlpha = drawable.Alpha.Get();
		if(typeof drawable.Angle.Get()!=='undefined')
		if(drawable.Angle.Get()%360!=0)
		{
			canvas.translate(X,Y);
			X = 0;
			Y = 0;
			canvas.rotate(drawable.Angle.Get()*0.0174532925);
		}
		func(canvas, drawable, X, Y);
		canvas.restore();
	},
	Drawable:function(src, changed, x, y, w, h, sta, sty, alp, ang)
	{
		if(changed==null||typeof changed==="undefined"){
			changed = function(index,info,input){
				info.data = input;
				index.Draw();
			};
		}
		this.drawable_class = true;
		this.Index = null;
		this.Source = new Info(src, this, changed);
		this.X = new Info(x, this, changed);
		this.Y = new Info(y, this, changed);
		this.Width = new Info(w, this, changed);
		this.Height = new Info(h, this, changed);
		this.State = new Info(sta, this, changed);
		this.Style = new Info(sty, this, changed);
		this.Invert_X = new Info(false, this, changed);
		this.Invert_Y = new Info(false, this, changed);
		this.Alpha = new Info(alp, this, changed);
		this.Angle = new Info(ang, this, changed);
		this.Draw = function(canvas, func)
		{
			if(typeof func!=='function')func = function(canvas, drawable, x, y){
				drawable.Source.Get().Draw(canvas,x,y,drawable.Width.Get(),drawable.Height.Get(),drawable.State.Get());
			};
			Canvas.Drawer(canvas, this, func);
		};
		this.Clear = function(canvas)
		{
			Canvas.Drawer(canvas, this, function(c, d, x, y){
				c.clearRect(x, y, d.Width.data, d.Height.data);
			});
		};
	},
	ScaleImageData:function(canvas, imageData, x, y, xScale, yScale){
		if(!xScale)xScale=Canvas.Width/Canvas.MaxWidth;
		if(!yScale)yScale=Canvas.Height/Canvas.MaxHeight;
		canvas.putImageData(scale(imageData, xScale, yScale), x, y);
	},
	Contexts:[],
	Clear:0,
	Background:1,
	Merge:2,
	Height:665,
	Width:810,
	MaxHeight:665,
	MaxWidth:810,
	Kill:false,
	Canvas_List:[],
	Tick_Functions:[],
	Temp_Ticks:[],
	Reflow:function(){
		Canvas.Width = parentFrame.clientWidth;
		Canvas.Height = parentFrame.clientHeight;
		if(INTERFACE){
			INTERFACE.reflow(Canvas.Width, Canvas.Height);
		}
	},
	Run_Next_Tick:function(fnc){
		Canvas.Temp_Ticks[Canvas.Temp_Ticks.length] = fnc;
	},
	Add_Ticker:function(fnc){
		Canvas.Tick_Functions[Canvas.Tick_Functions.length] = fnc;
	},
	Next_Tick:function(){
		if(!Canvas.Kill)
		{
			for(var i=0;i<Canvas.Tick_Functions.length;i++)
			{
				Canvas.Tick_Functions[i]();
			}
			for(var i=0;i<Canvas.Temp_Ticks.length;i++)
			{
				Canvas.Temp_Ticks[i]();
			}
			// for(var i=0;i<Canvas.Canvas_List.length;i++)
			// {
				// if(!Canvas.Canvas_List[i].Stop)
					// Canvas.Canvas_List[i].Draw();
			// }
			Canvas.Temp_Ticks = [];
			setTimeout(function(){Canvas.Next_Tick()},tpf);
		}
	},

	X_Offset:function(value){
		for(var i=0;i<Canvas.Canvas_List.length;i++)
		{
			Canvas.Canvas_List[i].X_Offset = value;
		}
	},
	Y_Offset:function(value){
		for(var i=0;i<Canvas.Canvas_List.length;i++)
		{
			Canvas.Canvas_List[i].Y_Offset = value;
		}
	},
	Move_X:function(value){
		for(var i=0;i<Canvas.Canvas_List.length;i++)
		{
			Canvas.Canvas_List[i].X_Offset+=value;
		}
	},
	Move_Y:function(value){
		for(var i=0;i<Canvas.Canvas_List.length;i++)
		{
			Canvas.Canvas_List[i].Y_Offset+=value;
		}
	},
	Create_Canvas:function(canvas, name){
		var temp = new Canvas_Handler_Class(canvas, name);
		Canvas.Canvas_List[Canvas.Canvas_List.length] = temp;
		return temp;
	},
	Wipe_All:function(){
		for(var i=0;i<Canvas.Canvas_List.length;i++)
		{
			Canvas.Canvas_List[i].Wipe();
		}
	},
	Clear_All:function(){
		for(var i=0;i<Canvas.Canvas_List.length;i++)
		{
			Canvas.Canvas_List[i].Clear();
		}
	},
	Stop_All:function(){
		for(var i=0;i<Canvas.Canvas_List.length;i++)
		{
			Canvas.Canvas_List[i].Stop();
		}
	},
	Start_All:function(){
		for(var i=0;i<Canvas.Canvas_List.length;i++)
		{
			Canvas.Canvas_List[i].Start();
		}
	},
	Redraw:function(){
		for(var i=0;i<Canvas.Canvas_List.length;i++)
		{
			Canvas.Canvas_List[i].Redraw();
		}
	},
	Clean_Up:function(){
		for(var i=0;i<Canvas.Canvas_List.length;i++)
		{
			Canvas.Canvas_List[i].Clean();
		}
	},
	Clear:function(){
		for(var i=0;i<Canvas.Canvas_List.length;i++)
		{
			Canvas.Canvas_List[i].Clear();
		}
	},
	Set_Game:function(game){
		for(var i=0;i<Canvas.Canvas_List.length;i++)
		{
			Canvas.Canvas_List[i].Set_Game(game);
		}
	},
	overlappingDrawable:function(drawable, x, y){
		// x*=Canvas.Width/Canvas.MaxWidth;
		// y*=Canvas.Height/Canvas.MaxHeight;
		if(x>=drawable.X.data)
		if(x<drawable.X.data+drawable.Width.data)
		if(y>=drawable.Y.data)
		if(y<drawable.Y.data+drawable.Height.data)
			return true;
		return false;
	}
};

window.addEventListener("resize", Canvas.Reflow, false);

function initiateCanvas(name){
	var element = document.getElementById(name),
		canvas = document.createElement('canvas');
	canvas.setAttribute('width',element.style.width);
	canvas.setAttribute('height',element.style.height);
	canvas.setAttribute('id',name+'Display');
	element.appendChild(canvas);
	if(typeof G_vmlCanvasManager!='undefined')
		canvas = G_vmlCanvasManager.initElement(canvas);
	var context = canvas.getContext('2d');
	context.width = parseInt(element.style.width);
	context.height = parseInt(element.style.height);
	context.source = canvas;
	context.name = name;
	Canvas.Contexts.push(context);
	return context;
}
