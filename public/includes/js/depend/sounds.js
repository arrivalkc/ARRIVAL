function Sound_list_class(LOCATION)
{
	var SND_LOC = "./sounds/"+LOCATION;
	var muted = false;
	let switch_to, switching = false;
	function Sound_Class(src,name,loop,__volume,callback)
	{
		var snd;
		let auto = false,
			buff = true;
		var _onplay = function(){};
		var _onend = function(){};
		let snd_ln;
		let self = this;
		if(src.Play)
		{
			snd = new Howl({
				urls:[src.Source()],
				buffer:buff,
				autoplay:auto,
				volume:__volume,
				loop:loop,
				onplay:function(){
					_onplay();
				},
				onend:function(){
					_onend();
				},
				onload:function(){
					callback(self);
				}
			});
		}
		else
		{
			snd = new Howl({
				urls:[SND_LOC+src+'.mp3', SND_LOC+src+'.ogg'],
				buffer:buff,
				autoplay:auto,
				volume:__volume,
				loop:loop,
				onplay:function(){
					_onplay();
				},
				onend:function(){
					_onend();
				},
				onload:function(){
					callback(self);
				}
			});
		}

		this.Break_By = function(amt)
		{
			if(amt<=0)return this;
			snd_ln = snd._duration/amt;
			let sprite = new Array();
			for(let i=0;i<amt;i++)
				sprite[""+i] = [i*snd_ln*1000, snd_ln*1000];
			snd._sprite = sprite;
			return this;
		};
		this.Sprite_Amount = function()
		{
			return snd._duration/snd_ln;
		};

		this.Play = function(sprite)
		{
			if(muted)return this;
			if(sprite!=null)
				sprite = ""+sprite;
			// else if(sprite==-1)
			// 	sprite = ""+(Math.floor(Math.random()*this.Sprite_Amount()));

			try {
				snd.play(sprite);
			} catch (e) {
				console.error("Sound couldn't play.");
			}

			return this;
		};
		this.Play_Out = function(sprite)
		{
			if(muted)return this;
			if(sprite!=null)
				sprite = ""+sprite;
			let dur = snd_ln==null ? snd._duration : snd_ln;

			try {
				snd.play(sprite);
			} catch (e) {
				console.error("Sound couldn't play.");
			}

			snd.fade(__volume, 0, dur*1000, function(){
				snd.volume(__volume);
			})
			return this;
		};
		this.Stop = function()
		{
			snd.stop();
			return this;
		};
		this.Switch = function(change, time)
		{
			if(change==this)return;
			if(switching)
			{
				switch_to = change;
				if(time==null)
					time = 2000;
				switch_time = time;
				return change;
			}
			switching = true;
			if(time==null)
				time = 2000;
			let c_howl = change.Howl();
			c_howl.volume(0);
			c_howl.fade(0, snd.volume(), time);
			snd.fade(snd.volume(), 0, time);

			let self = this;
			setTimeout(function(){
				switching = false;
				if(switch_to!=null)
				{
					change.Switch(switch_to, switch_time);
				}
				switch_to = null;
				switch_time = 0;
			}, time);
			return change;
		};
		this.Fade_In = function(time)
		{
			try {
				snd.play();
			} catch (e) {
				console.error("Sound couldn't play.");
			}

			snd.volume(0);
			snd.fade(0, __volume, time);
		};
		this.Fade_Out = function(time)
		{
			snd.fade(__volume, 0, time);
			setTimeout(function(){
				snd.stop();
			}, time);
		};
		this.Pause = function()
		{
			snd.pause();
			return this;
		};
		this.Volume = function(amt)
		{
			if(amt==null)return snd.volume();
			snd.volume(amt*__volume);
			return snd.volume();
		};
		this.On_Play = function(fnc)
		{
			_onplay = fnc;
		};
		this.On_End = function(fnc)
		{
			_onend = fnc;
		};
		this.Loaded = function()
		{
			return snd._loaded;
		};
		this.Howl = function()
		{
			return snd;
		};
		this.Source = function()
		{
			return snd._src;
		};
		this.Name = function()
		{
			return name;
		};
	}

	var Sounds = [];
	var total_snds=0,loaded_snds=0;
	this.Declare = function(src,name,loop,volume,callback)
	{
		for(var i in Sounds)
		{
			if(name==i)
			{
				console.error("Sound already declared with the name "+name);
				return;
			}
		}
		total_snds++;
		Sounds[name] = new Sound_Class(src,name,loop,volume,function(self){
			loaded_snds++;
			if(callback!=null)
				callback(self);
		});
		return Sounds[name];
	};
	this.Delete = function(name)
	{
		return Core.Remove_Array_Index(Sounds,name);
	};
	this.Retrieve = function(name)
	{
		for(var i in Sounds)
		{
			if(name==i)
			{
				return Sounds[name];
			}
		}
		return null;
	};

	this.Stop_All = function()
	{
		for(var i in Sounds)
			Sounds[i].Stop();
	};
	this.Mute = function(input)
	{
		if(input==null)
			muted = !muted;
		else muted = input;
		if(muted)
		{
			for(let i in Sounds)
			{
				Sounds[i].Stop();
			}
		}
		return muted;
	};
	this.Volume = function(amt)
	{
		if(amt==null)return;
		if(amt<0 || amt>1)return;
		for(let i in Sounds)
		{
			Sounds[i].Volume(amt);
		}
	};

	this.Done = function()
	{
		return (total_snds==loaded_snds);
	};
	this.Progress = function()
	{
		return loaded_snds/total_snds;
	};
	this.Empty = function()
	{
		total_snds = 0;
		loaded_snds = 0;
		Sounds = [];
	};
};

var SFXs = new Sound_list_class('sfx/');
var Music = new Sound_list_class('music/');
var Enviornment = new Sound_list_class('envior/');
