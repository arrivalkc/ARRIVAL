function Image_list_class()
{
	var IMG_LOC = "./img/";
	function Image_Class(src,name,callback)
	{
		var img;
		var loaded;
		var stretchable = true;

		this.targeter = this;

		if(src.Draw)
		{
			loaded = true;
			img = src.Image();
			callback();
		}
		else
		{
			loaded = false;
			img = new Image();
			img.src = IMG_LOC+src;
			let self = this;
			img.onload = function()
			{
				loaded = true;
				callback();
				if(self.OnLoad!=null)
					self.OnLoad();
			};
		}
		this.Draw = function(canvas,x,y,w,h)
		{
			if(stretchable)
			if(w!=null&&h!=null)
			{
				canvas.drawImage(img,x,y,w,h);
				return;
			}
			canvas.drawImage(img,x,y);
		};
		this.Crop = function(canvas, x, y, start_x, start_y, w, h, stretch_w, stretch_h)
		{
			if(stretchable)
			if(stretch_w!=null&&stretch_h!=null)
			{
				canvas.drawImage(img,start_x,start_y,w,h,x,y,stretch_w,stretch_h);
				return;
			}
			canvas.drawImage(img,start_x,start_y,w,h,x,y,w,h);
		};
		this.Loaded = function()
		{
			return loaded;
		};
		this.Image = function()
		{
			return img;
		};
		this.Source = function()
		{
			return img.src;
		};
		this.Stretch = function(val)
		{
			stretchable = val;
		};
		this.Name = function()
		{
			return name;
		};
	}

	var Images = [];
	var total_images=0,loaded_images=0;
	this.Declare = function(src,name)
	{
		for(var i in Images)
		{
			if(name==i)
			{
				console.error("Image already declared with the name "+name);
				return;
			}
		}
		total_images++;
		let IMG = new Image_Class(src,name,function(){
			loaded_images++;
		});
		Images[name] = IMG;
		return IMG;
	};
	this.Delete = function(name)
	{
		return Core.Remove_Array_Index(Images,name);
	};
	this.Retrieve = function(name)
	{
		for(var i in Images)
		{
			if(name==i)
			{
				return Images[name];
			}
		}
		return null;
	};

	this.Done = function()
	{
		return (total_images==loaded_images);
	};
	this.Progress = function()
	{
		return loaded_images/total_images;
	};
	this.Empty = function()
	{
		total_images = 0;
		loaded_images = 0;
		Images = [];
	};
}

var Images = new Image_list_class();
