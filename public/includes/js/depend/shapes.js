var Shape = {
	Pie_Chart:function(f)
	{
		this.Draw = function(c,x,y,w,h,data){
			if(data==null)return;
			if(data.length==0)return;
			c.save();
			c.translate(x,y);

			if(data.length==1)
			{
				let imgW = w/3,
					imgH = w/3;
				let arc = Math.PI*2;
				c.fillStyle = data[0][1];
				c.beginPath();
				c.moveTo(w/2,w/2);
				c.arc(w/2,h/2,h/2,0,arc,false);
				c.lineTo(w/2,h/2);
				c.fill();
				if(data[0][2])
				{
					data[0][2].Draw(c,(w-imgW)/2,(h-imgH)/2,imgW,imgH);
				}
				c.restore();
				return;
			}

			var lastend = 0;
			var myTotal = 0;
			let arc;

			for(var e = 0; e < data.length; e++)
			{
				myTotal += data[e][0];
			}

			let imgW = w/6,
				imgH = h/6;

			for (var i = 0; i < data.length; i++) {
				arc = Math.PI*2*(data[i][0]/myTotal);
				c.fillStyle = data[i][1];
				c.beginPath();
				c.moveTo(w/2,w/2);
				c.arc(w/2,h/2,h/2,lastend,lastend+arc,false);
				c.lineTo(w/2,h/2);
				c.fill();
				c.fillStyle = 'black';
				c.stroke();
				if(data[i][2])
				{
					c.save();
					c.translate(w/2,h/2);
					c.rotate(lastend+arc/2);
					c.translate(w/3,0);
					c.rotate(-(lastend+arc/2));
					c.translate(-imgW/2, -imgH/2);
					data[i][2].Draw(c,0,0,imgW,imgH);
					c.restore();
				}
				lastend+=arc;
			}
			c.restore();
		};
	},
	Rect_Class:function(f)
	{
		this.Draw = function(canvas, x, y, w, h, c)
		{
			if(f){
				canvas.fillStyle = c;
				canvas.fillRect(x,y,w,h);
			}else{
				canvas.strokeStyle = c;
				canvas.strokeRect(x,y,w,h);
			}
		};
	},
	Ellip_Class:function(f)
	{
		function curve(c,x,y,w,h)
		{
			canvas.beginPath();
			canvas.moveTo(x, y - h/2);
			canvas.bezierCurveTo(
				x + w/2, y - h/2,
				x + w/2, y + h/2,
				x, y + h/2);
			canvas.bezierCurveTo(
				x - w/2, y + h/2,
				x - w/2, y - h/2,
				x, y - h/2);
		}
		this.Draw = function(canvas, x, y, w, h, c)
		{
			if(f){
				canvas.fillStyle = c;
				curve(canvas,x,y,w,h);
				canvas.fill();
				canvas.closePath();
			}else{
				canvas.strokeStyle = c;
				curve(canvas,x,y,w,h);
				canvas.stroke();
				canvas.closePath();
			}
		};
	}
};

Shape.Pie = new Shape.Pie_Chart();
Shape.Rectangle = new Shape.Rect_Class(true);
Shape.Box = new Shape.Rect_Class(false);
Shape.Ellipse = new Shape.Ellip_Class(true);
Shape.Ball = new Shape.Ellip_Class(false);
