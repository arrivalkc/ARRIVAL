
var Text_Class = function(font, color, options)
{
	if(font==null)font="10pt Times New Roman";
	if(color==null)color="#FFF";
	if(options==null)
		options = {};
	this.Draw = function(canvas, x, y, w, h, txt)
	{
		if(txt==null)return;
		if(typeof txt==='function')txt=txt(); // for mutatable strings using closure
		if(typeof txt!=='string')return;
		canvas.font = font;
		canvas.fillStyle = color;
		var size = parseInt(font)+2;
		var newlines = 1;
		var curLen = 0;
		for(var i=0;i<txt.length;i++)
		{
			if(txt[i]=='\n')
			{
				i++;
				curLen = 0;
				continue;
			}
			curLen+=canvas.measureText(txt[i]).width;
			if(curLen>w)
			{
				var crop = 1;
				while(txt[i-crop]!=' ')
				{
					if(crop==i)
					{
						crop = 0;
						break;
					}
					crop++;
				}
				i-=crop;
				var leadingSpaces = 1;
				while(txt[i+leadingSpaces]==' ')
				{
					leadingSpaces++;
				}
				txt = txt.substring(0,i)+'\n'+txt.substring(i+leadingSpaces);
				curLen = 0;
				i+=2;
			}
		}
		var curNewline = txt.indexOf('\n'),
			lastNewline = 0;
		while(~curNewline)
		{
			if((newlines)*size>h)return;
			canvas.fillText(txt.substring(lastNewline,curNewline),x,y+newlines*size);
			if(options.underline)
			{
				STDTXT.underline(canvas,txt.substring(lastNewline,curNewline),x,y+newlines*size,color,size);
			}
			newlines++;
			lastNewline = curNewline;
			curNewline = txt.indexOf('\n',curNewline+1);
		}
		canvas.fillText(txt.substring(lastNewline),x,y+newlines*size);
		if(options.underline)
		{
			STDTXT.underline(canvas,txt.substring(lastNewline),x,y+newlines*size,color,size);
		}
	};
};

var STDTXT = new Text_Class();
STDTXT.underline = function(context,text,x,y,color,textSize,align){
  var textWidth =context.measureText(text).width;
  var startX = 0;
  var startY = y+(parseInt(textSize)/15);
  var endX = 0;
  var endY = startY;
  var underlineHeight = parseInt(textSize)/15;

  if(underlineHeight < 1){
    underlineHeight = 1;
  }

  context.beginPath();
  if(align == "center"){
    startX = x - (textWidth/2);
    endX = x + (textWidth/2);
  }else if(align == "right"){
    startX = x-textWidth;
    endX = x;
  }else{
    startX = x;
    endX = x + textWidth;
  }

  context.strokeStyle = color;
  context.lineWidth = underlineHeight;
  context.moveTo(startX,startY);
  context.lineTo(endX,endY);context.strokeStyle = 'blue';
  context.stroke();
};
