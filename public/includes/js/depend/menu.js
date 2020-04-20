var Menu = {
	Menu_Class:function(bgInput)
	{
		var draws = [];
		var clicks = [];
		var hovered = -1;
		var clickPos = -1;
		var self = this;
		self.STOP_EVENT_CLICKS = true;
		self.xScale = 1;
		self.yScale = 1;
		if(typeof bgInput==='undefined')bgInput=null;
		self.Background = bgInput;
		self.Add = function(drawable, click, hovered, right_click)
		{
			if(drawable==null)return;
			if(click!=null||right_click!=null)clicks.push([draws.length, click, right_click]);
			draws.push([drawable, drawable.Source.data, hovered]);
			return draws.length-1;
		};
		self.Remove = function(index, amount)
		{
			if(index>=draws.length)return;
			if(index<0 || amount<=0)return;
			if(amount==null)amount = 1;
			draws.splice(index, amount);
			clicks.splice(index, amount);

			for(var i=index;i<clicks.length;i++)
			{
				clicks[i][0]-=amount;
			}
			if(hovered>=index && hovered<index+amount)
				hovered = -1;
			else if(hovered>=index+amount)
				hovered-=amount;
		};
		self.Erase = function()
		{
			draws = [];
			clicks = [];
			hovered = -1;
		};
		self.Draw = function()
		{
			menuCanvas.clearRect(0, 0, menuCanvas.width, menuCanvas.height);
			menuCanvas.save();
			menuCanvas.scale(self.xScale, self.yScale);
			if(self.Background!=null)
			{
				if(self.Background.Draw)
				{
					self.Background.Draw(menuCanvas, 0, 0, menuCanvas.width, menuCanvas.height);
				}
				else if(typeof self.Background==='string')
				{
					Shape.Rectangle.Draw(menuCanvas, 0, 0, menuCanvas.width, menuCanvas.height, self.Background);
				}
			}
			for(var i in draws)
			{
				draws[i][0].Draw(menuCanvas);
			}
			menuCanvas.restore();
		};
		self.Current_Scale;
		self.Scale = function(x, y)
		{
			self.xScale = x;
			self.yScale = y;
			if(self.Current_Scale!=null)
				self.Current_Scale(x, y);
			self.Draw();
		};
		self.Close = function()
		{
			hovered = -1;
			menuCanvas.clearRect(0, 0, menuCanvas.width, menuCanvas.height);
		};
		self.Click = function(x, y)
		{
			x/=self.xScale;
			y/=self.yScale;
			clickPos = [x,y];
			return !self.STOP_EVENT_CLICKS;
		};
		self.Release = function(x, y)
		{
			x/=self.xScale;
			y/=self.yScale;
			if(~clickPos)
			if(Math.abs(x-clickPos[0])<5&&Math.abs(y-clickPos[1])<5)
			for(var i=clicks.length-1;i>=0;i--)
			{
				var cur = clicks[i];
				if(cur[1]==null)continue;
				if(draws[cur[0]]==null)continue;
				if(Canvas.overlappingDrawable(draws[cur[0]][0], x, y))
				{
					cur[1](draws[cur[0]][0].State.data);
					return;
				}
			}
			clickPos = -1;
		};
		self.Right_Click = function(x, y)
		{
			x/=self.xScale;
			y/=self.yScale;
			for(var i=clicks.length-1;i>=0;i--)
			{
				var cur = clicks[i];
				if(cur[2]==null)continue;
				if(Canvas.overlappingDrawable(draws[cur[0]][0], x, y))
				{
					cur[2](draws[cur[0]][0].State.data);
					return;
				}
			}
		};
		self.Mouse_Move = function(x, y)
		{
			x/=self.xScale;
			y/=self.yScale;
			if(~hovered)
			{
				var cur = draws[hovered];
				if(!Canvas.overlappingDrawable(cur[0], x, y))
				{
					menuCanvas.save();
					menuCanvas.scale(self.xScale, self.yScale);
					cur[0].Source.data = cur[1];
					cur[0].Draw(menuCanvas);
					menuCanvas.restore();
					hovered = -1;
					inputHandler.source.style.cursor = "default";
				}
				return;
			}
			for(var i=draws.length-1;i>=0;i--)
			{
				var cur = draws[i];
				if(!cur[2])continue;
				if(Canvas.overlappingDrawable(cur[0], x, y))
				{
					menuCanvas.save();
					menuCanvas.scale(self.xScale, self.yScale);
					cur[0].Source.data = cur[2];
					cur[0].Draw(menuCanvas);
					menuCanvas.restore();
					hovered = i;
					inputHandler.source.style.cursor = "pointer";
					return;
				}
			}
		};
	}
};
