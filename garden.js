if(MyMod === undefined) var MyMod = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/CCSE.js');
MyMod.launch = function(){
	init: function(){
		Game.Notify(`Garden extension mod loaded!`,`Have fun with new variety of plants!`,[16,5]);
		MyMod.isLoaded = 1;
		let fakelumps=0;
		Game.doLumps=function()
		{
			if (Game.lumpRefill>0) Game.lumpRefill--;
			
			if (!Game.canLumps()) {Game.removeClass('lumpsOn');return;}
			if (Game.lumpsTotal==-1)
			{
				//first time !
				if (Game.ascensionMode!=1) Game.addClass('lumpsOn');
				Game.lumpT=Date.now();
				Game.lumpsTotal=0;
				Game.lumps=0;
				Game.computeLumpType();
				
				Game.Notify(loc("Sugar lumps!"),loc("Because you've baked a <b>billion cookies</b> in total, you are now attracting <b>sugar lumps</b>. They coalesce quietly near the top of your screen, under the Stats button.<br>You will be able to harvest them when they're ripe, after which you may spend them on all sorts of things!"),[23,14]);
			}
			var age=Date.now()-Game.lumpT;
			if (age>Game.lumpOverripeAge)
			{
				age=0;
				Game.harvestLumps(1);
				Game.computeLumpType();
			}
			
			var phase=Math.min(6,Math.floor((age/Game.lumpOverripeAge)*7));
			var phase2=Math.min(6,Math.floor((age/Game.lumpOverripeAge)*7)+1);
			var row=14;
			var row2=14;
			var type=Game.lumpCurrentType;
			if (type==1)//double
			{
				//if (phase>=6) row=15;
				if (phase2>=6) row2=15;
			}
			else if (type==2)//golden
			{
				if (phase>=4) row=16;
				if (phase2>=4) row2=16;
			}
			else if (type==3)//meaty
			{
				if (phase>=4) row=17;
				if (phase2>=4) row2=17;
			}
			else if (type==4)//caramelized
			{
				if (phase>=4) row=27;
				if (phase2>=4) row2=27;
			}
			var icon=[23+Math.min(phase,5),row];
			var icon2=[23+phase2,row2];
			if (age<0){icon=[17,5];icon2=[17,5];}
			var opacity=Math.min(6,(age/Game.lumpOverripeAge)*7)%1;
			if (phase>=6) {opacity=1;}
			l('lumpsIcon').style.backgroundPosition=(-icon[0]*48)+'px '+(-icon[1]*48)+'px';
			l('lumpsIcon2').style.backgroundPosition=(-icon2[0]*48)+'px '+(-icon2[1]*48)+'px';
			l('lumpsIcon2').style.opacity=opacity;
			l('lumpsAmount').textContent=Beautify(Game.lumps+fakelumps);
		}

		Game.lumpTooltip=function()
		{
			var str='<div style="padding:8px;width:400px;font-size:11px;text-align:center;" id="tooltipLumps">'+
			loc("You have %1.",'<span class="price lump">'+loc("%1 sugar lump",LBeautify(Game.lumps+fakelumps))+'</span>')+
			'<div class="line"></div>'+
			loc("A <b>sugar lump</b> is coalescing here, attracted by your accomplishments.");
			
			var age=Date.now()-Game.lumpT;
			str+='<div class="line"></div>';
			if (age<0) str+=loc("This sugar lump has been exposed to time travel shenanigans and will take an excruciating <b>%1</b> to reach maturity.",Game.sayTime(((Game.lumpMatureAge-age)/1000+1)*Game.fps,-1));
			else if (age<Game.lumpMatureAge) str+=loc("This sugar lump is still growing and will take <b>%1</b> to reach maturity.",Game.sayTime(((Game.lumpMatureAge-age)/1000+1)*Game.fps,-1));
			else if (age<Game.lumpRipeAge) str+=loc("This sugar lump is mature and will be ripe in <b>%1</b>.<br>You may <b>click it to harvest it now</b>, but there is a <b>50% chance you won't get anything</b>.",Game.sayTime(((Game.lumpRipeAge-age)/1000+1)*Game.fps,-1));
			else if (age<Game.lumpOverripeAge) str+=loc("<b>This sugar lump is ripe! Click it to harvest it.</b><br>If you do nothing, it will auto-harvest in <b>%1</b>.",Game.sayTime(((Game.lumpOverripeAge-age)/1000+1)*Game.fps,-1));
			
			var phase=(age/Game.lumpOverripeAge)*7;
			if (phase>=3)
			{
				if (Game.lumpCurrentType!=0) str+='<div class="line"></div>';
				if (Game.lumpCurrentType==1) str+=loc("This sugar lump grew to be <b>bifurcated</b>; harvesting it has a 50% chance of yielding two lumps.");
				else if (Game.lumpCurrentType==2) str+=loc("This sugar lump grew to be <b>golden</b>; harvesting it will yield 2 to 7 lumps, your current cookies will be doubled (capped to a gain of 24 hours of your CpS), and you will find 10% more golden cookies for the next 24 hours.");
				else if (Game.lumpCurrentType==3) str+=loc("This sugar lump was affected by the elders and grew to be <b>meaty</b>; harvesting it will yield between 0 and 2 lumps.");
				else if (Game.lumpCurrentType==4) str+=loc("This sugar lump is <b>caramelized</b>, its stickiness binding it to unexpected things; harvesting it will yield between 1 and 3 lumps and will refill your sugar lump cooldowns.");
			}
			
			str+='<div class="line"></div>';
			str+=loc("Your sugar lumps mature after <b>%1</b>,<br>ripen after <b>%2</b>,<br>and fall after <b>%3</b>.",[Game.sayTime((Game.lumpMatureAge/1000)*Game.fps,-1),Game.sayTime((Game.lumpRipeAge/1000)*Game.fps,-1),Game.sayTime((Game.lumpOverripeAge/1000)*Game.fps,-1)]);
			
			str+='<div class="line"></div>'+loc("&bull; Sugar lumps can be harvested when mature, though if left alone beyond that point they will start ripening (increasing the chance of harvesting them) and will eventually fall and be auto-harvested after some time.<br>&bull; Sugar lumps are delicious and may be used as currency for all sorts of things.<br>&bull; Once a sugar lump is harvested, another one will start growing in its place.<br>&bull; Note that sugar lumps keep growing when the game is closed.")+'</div>';
			return str;
		}
		Game.dropRateMult=function()
		{
			var rate=1;
			if (Game.Has('Green yeast digestives')) rate*=1.03;
			if (Game.Has('Dragon teddy bear')) rate*=1.03;
			rate*=Game.eff('itemDrops');
			rate*=1+Game.auraMult('Mind Over Matter')*0.25;
			if (Game.Has('Santa\'s bottomless bag')) rate*=1.1;
			if (Game.Has('???')) rate*=1.1;
			if (Game.Has('Cosmic beginner\'s luck') && !Game.Has('Heavenly chip secret')) rate*=5;
			return rate;
		}
		Game.SetResearch=function(what,time)
		{
			if (Game.Upgrades[what] && !Game.Has(what))
			{
				Game.researchT=Game.baseResearchTime;
				if (Game.Has('Persistent memory')) Game.researchT=Math.ceil(Game.baseResearchTime/10);
				if (Game.Has('Ultrascience')) Game.researchT=Game.fps*5;
				Game.researchT=Math.ceil(Game.researchT/Game.effs.researchspeed);
				Game.nextResearch=Game.Upgrades[what].id;
				Game.Notify(loc("Research has begun"),loc("Your bingo center/research facility is conducting experiments."),[9,0]);
			}
		}
			Game.rebuildGarden=function(){
						var str='';
		str+='<style>'+
		'#gardenBG{background:url('+Game.resPath+'img/shadedBorders.png),url('+Game.resPath+'img/BGgarden.jpg);background-size:100% 100%,auto;position:absolute;left:0px;right:0px;top:0px;bottom:16px;}'+
		'#gardenContent{position:relative;box-sizing:border-box;padding:4px 24px;height:'+(6*M.tileSize+16+48+48)+'px;}'+
		'.gardenFrozen{box-shadow:0px 0px 16px rgba(255,255,255,1) inset,0px 0px 48px 24px rgba(200,255,225,0.5) inset;}'+
		'#gardenPanel{text-align:center;margin:0px;padding:0px;position:absolute;left:4px;top:4px;bottom:4px;right:65%;overflow-y:auto;overflow-x:hidden;box-shadow:8px 0px 8px rgba(0,0,0,0.5);}'+
		'#gardenSeeds{}'+
		'#gardenField{text-align:center;position:absolute;right:0px;top:0px;bottom:0px;overflow-x:auto;overflow:hidden;}'+//width:65%;
		'#gardenPlot{position:relative;margin:8px auto;}'+
		'.gardenTile{cursor:pointer;width:'+M.tileSize+'px;height:'+M.tileSize+'px;position:absolute;}'+
		'.gardenTile:before{transform:translate(0,0);opacity:0.65;transition:opacity 0.2s;pointer-events:none;content:\'\';display:block;position:absolute;left:0px;top:0px;right:0px;bottom:0px;margin:0px;background:url('+Game.resPath+'img/gardenPlots.png);}'+
			'.gardenTile:nth-child(4n+1):before{background-position:40px 0px;}'+
			'.gardenTile:nth-child(4n+2):before{background-position:80px 0px;}'+
			'.gardenTile:nth-child(4n+3):before{background-position:120px 0px;}'+
			'.gardenTile:hover:before{opacity:1;animation:wobble 0.5s;}'+
			'.noFancy .gardenTile:hover:before{opacity:1;animation:none;}'+
		'.gardenTileIcon{transform:translate(0,0);pointer-events:none;transform-origin:50% 40px;width:48px;height:48px;position:absolute;left:-'+((48-M.tileSize)/2)+'px;top:-'+((48-M.tileSize)/2+8)+'px;background:url('+Game.resPath+'../mods/workshop/Garden_extension/gardenPlants.png?v='+Game.version+');}'+
			'.gardenTile:hover .gardenTileIcon{animation:pucker 0.3s;}'+
			'.noFancy .gardenTile:hover .gardenTileIcon{animation:none;}'+
		'#gardenDrag{pointer-events:none;position:absolute;left:0px;top:0px;right:0px;bottom:0px;overflow:hidden;z-index:1000000001;}'+
		'#gardenCursor{transition:transform 0.1s;display:none;pointer-events:none;width:48px;height:48px;position:absolute;background:url('+Game.resPath+'../mods/workshop/Garden_extension/gardenPlants.png?v='+Game.version+');}'+
		'.gardenSeed{cursor:pointer;display:inline-block;width:40px;height:40px;position:relative;}'+
		'.gardenSeed.locked{display:none;}'+
		'.gardenSeedIcon{pointer-events:none;transform:translate(0,0);display:inline-block;position:absolute;left:-4px;top:-4px;width:48px;height:48px;background:url('+Game.resPath+'../mods/workshop/Garden_extension/gardenPlants.png?v='+Game.version+');}'+
			'.gardenSeed:hover .gardenSeedIcon{animation:bounce 0.8s;z-index:1000000001;}'+
			'.gardenSeed:active .gardenSeedIcon{animation:pucker 0.2s;}'+
			'.noFancy .gardenSeed:hover .gardenSeedIcon,.noFancy .gardenSeed:active .gardenSeedIcon{animation:none;}'+
		'.gardenPanelLabel{font-size:12px;width:100%;padding:2px;margin-top:4px;margin-bottom:-4px;}'+'.gardenSeedTiny{transform:scale(0.5,0.5);margin:-20px -16px;display:inline-block;width:48px;height:48px;background:url('+Game.resPath+'../mods/workshop/Garden_extension/gardenPlants.png?v='+Game.version+');}'+
		'.gardenSeed.on:before{pointer-events:none;content:\'\';display:block;position:absolute;left:-10px;top:-10px;width:60px;height:60px;background:url('+Game.resPath+'img/selectTarget.png);animation:wobble 0.2s ease-out;z-index:10;}'+
		
		'.gardenGrowthIndicator{background:#000;box-shadow:0px 0px 0px 1px #fff,0px 0px 0px 2px #000,2px 2px 2px 2px rgba(0,0,0,0.5);position:absolute;top:0px;width:1px;height:6px;z-index:100;}'+
		'.noFancy .gardenGrowthIndicator{background:#fff;border:1px solid #000;margin-top:-1px;margin-left:-1px;}'+
		
		'#gardenSoils{}'+
		'.gardenSoil.disabled{filter:brightness(10%);}'+
		'.noFilters .gardenSoil.disabled{opacity:0.2;}'+
		
		'#gardenInfo{position:relative;display:inline-block;margin:8px auto 0px auto;padding:8px 16px;padding-left:32px;text-align:left;font-size:11px;color:rgba(255,255,255,0.75);text-shadow:-1px 1px 0px #000;background:rgba(0,0,0,0.75);border-radius:16px;}'+
		
		'</style>';
		str+='<div id="gardenBG"></div>';
		str+='<div id="gardenContent">';
		str+='<div id="gardenDrag"><div id="gardenCursor" class="shadowFilter"></div></div>';
			
			str+='<div id="gardenPanel" class="framed">';
				str+='<div class="title gardenPanelLabel">'+loc("Tools")+'</div><div class="line"></div>';
				str+='<div id="gardenTools"></div>';
				str+='<div id="gardenSeedsUnlocked" class="title gardenPanelLabel">'+loc("Seeds")+'</div><div class="line"></div>';
				str+='<div id="gardenSeeds"></div>';
			str+='</div>';
			str+='<div id="gardenField">';
				str+='<div style="pointer-events:none;opacity:0.75;position:absolute;left:0px;right:0px;top:8px;" id="gardenPlotSize"></div>';
				str+='<div id="gardenPlot" class="shadowFilter" style="width:'+(6*M.tileSize)+'px;height:'+(6*M.tileSize)+'px;"></div>';
				str+='<div style="margin-top:0px;" id="gardenSoils"></div>';
				str+='<div id="gardenInfo">';
					str+='<div '+Game.getDynamicTooltip('Game.ObjectsById['+2+'].minigame.refillTooltip','this')+' id="gardenLumpRefill" class="usesIcon shadowFilter lumpRefill" style="display:none;left:-8px;top:-6px;background-position:'+(-29*48)+'px '+(-14*48)+'px;"></div>';
					str+='<div id="gardenNextTick">'+loc("Initializing...")+'</div>';
					str+='<div id="gardenStats"></div>';
				str+='</div>';
			str+='</div>';
			
		str+='</div>';
	l('rowSpecial3').innerHTML=str;
		
	}
		/*fm=Game.Objects['Farm'].minigame;
		eval('fm='+replaceAll('M.','fm.',fm.toString()));
		eval('fm=' + fm.toString().replace(/x<6/g,'x<7').replace(/y<6/g,'y<7'));*/
		order=24999;
		CCSE.NewUpgrade('???',loc("Random drops are 10% more common")+'<q>???</q>',1234567890,[0,7]);
		CCSE.NewUpgrade('Sugar Frenzy',loc("Sugar lumps from golden and wrtath cookies is twice as common")+'<q>Remember kids, too much sugar harm your health!</q>',Math.pow(10,60),[27,14]);
		Game.Upgrades['???'].lasting=true;
		Game.Upgrades['Sugar Frenzy'].lasting=true;
		CCSE.NewBuff('sugar addiction',function(time,pow)
		{
			return {
				name:'Sugar addiction',
				desc:loc("Only thing you want is more sugar. Cookie production 90% slower for "+Game.sayTime(time*Game.fps,-1)+"!"),
				icon:[1,0,'../mods/workshop/Garden_extension/icons.png'],
				time:time*Game.fps,
				add:true,
				multCpS:pow,
			};
		});
		CCSE.NewBuff('raw frenzy',function(time,pow)
		{
			return {
				name:'Raw Frenzy',
				desc:loc("Cookie production x%1 for %2!",[pow,Game.sayTime(time*Game.fps,-1)]),
				icon:[0,0,'../mods/workshop/Garden_extension/icons.png'],
				time:time*Game.fps,
				add:true,
				multCpS:pow,
			};
		});
				new Game.buffType('raw click frenzy',function(time,pow)
		{
			return {
				name:'Raw Click Frenzy',
				desc:loc("Clicking power x%1 for %2!",[pow,Game.sayTime(time*Game.fps,-1)]),
				icon:[0,16],
				time:time*Game.fps,
				add:true,
				multClick:pow,
				aura:1
			};
		});
		
		CCSE.NewPlant('annoyeed',{
			name:'Annoyeed',
			plantable:true,
			weed:true,
			icon:36,
			cost:0,
			costM:0,
			ageTick:3,
			ageTickR:2,
			mature:15,
			noContam:true,
			contam:0.15,
			children:['annoyeed','meddleweed'],
			effsStr:'<div class="red">&bull; '+loc("CpS")+' -1%</div><div class="red">&bull; '+loc("surrounding plants (%1x%1) are %2% less efficient",[3,5])+'</div><div class="red">&bull; '+loc("may overtake nearby plants")+'</div><div class="red">&bull; '+loc("difficult to eradicate")+'</div>',
			q:'You really, Really don\'t wanna this one',
			onKill:function(x,y)
				{
					if (Math.random()<0.9) Game.Objects['Farm'].minigame.plot[y][x]=[Game.Objects['Farm'].minigame.plants['annoyeed'].id+1,0];
					else Game.Objects['Farm'].minigame.plot[y][x]=[Game.Objects['Farm'].minigame.plants['meddleweed'].id+1,0];
				},



		})
		CCSE.NewPlant('sugarpalm',{
			name:'Sugar palm',
			plantable:true,
			icon:37,
			cost:777,
			costM:7777777*1000000000000,
			ageTick:1.5,
			ageTickR:0.5,
			mature:75,
			children:[],
			effsStr:'<div class="green">&bull; '+'Harvest mature to age your Sugar Lump additional 5 minutes. '+' -1%</div>',
			q:'In the past was used to produce majority of sugar. It\'s less popular nowadays, but sometimes still you can find palm sugar on the shop shelves.',
			onHarvest:function(x,y)
				{
				Game.lumpT-=300000;	
				},
				})
		CCSE.NewPlant('licomint',{
			name:'Licomint',
			plantable:true,
			icon:38,
			cost:77,
			costM:7777777,
			ageTick:0,
			ageTickR:0.5,
			mature:90,
			children:[],
			effsStr:'<div class="green">&bull; '+'Harvest mature to get raw Golden Cookie. Raw Golden cookies have weaker effects than processed Golden cookies.'+' -1%</div>',
			q:'Main ingredient of Golden cookies.They\'re the cause of mint-licorice taste of Golden cookies.',
			onHarvest:function(x,y,age)
				{
					if (age>=this.mature){
					var newShimmer=new Game.shimmer('golden',{noWrath:true});
					var choices=[];
					choices.push('raw frenzy','raw luck','blab');
					if (Math.random()<0.1) choices.push('raw click frenzy');
					newShimmer.force=choose(choices);
					}
				},

		})

		CCSE.NewPlant('quest',{
			name:'???',
			plantable:true,
			icon:39,
			cost:60,
			costM:1000,
			ageTick:5,
			ageTickR:-10,
			mature:50,
			children:[],
			effsStr:'<div class="green">&bull; ???</div>'+'<div class="grey">&bull; ???</div>'+'<div class="red">&bull; ???</div>',
			q:'???',
			onHarvest(x,y,age){
					Game.Objects['Farm'].minigame.dropUpgrade('???',Math.pow(age/100,10));
			}
		})

		CCSE.NewPlant('JS',{
			name:'Javos Scryptoris',
			plantable:false,
			icon:40,
			cost:60,
			costM:1000,
			ageTick:1,
			ageTickR:0,
			mature:15,
			children:['variega'],
			effsStr:'<div class="green">&bull; predictable growth</div>'+'<div class="green">&bull; Javascript Console CpS +5%</div>',
			q:'This pure digital plant feeds on source code of this game. Fortunately, this plant doesn\'t damage code in any way and even improves it a little.',
			onHarvest(x,y,age){
				if (age>=this.mature){
					if(Math.random<0.000001*Game.lumpsTotal) Game.Win('Cheated cookies taste awful');
					}
			}
		})

		CCSE.NewPlant('GoldQueen',{
			name:'Golden Queenbeet',
			plantable:false,
			icon:41,
			cost:60,
			costM:1000,
			ageTick:0,
			ageTickR:0.03,
			mature:95,
			children:[],
			effsStr:'<div class="green">&bull; Harvest mature for 7 sugar lumps.</div>'+'<div class="green">&bull; Golden cookie frequency,gains,duration and effect duration +10%</div>'+'<div class="red">&bull; CpS -70%</div>',
			q:'Legends says about 100 year ancient war for one of this plants. Later turn out, that was just golden statue in queenbeet shape. ',
			onHarvest(x,y,age){
				if (age>=this.mature){
						Game.gainLumps(7);
						Game.Popup('(Golden queenbeet)<br>Sweet Cookie Lord in heaven!<div style="font-size:65%;">Found 7 sugar lumps!</div>',Game.mouseX,Game.mouseY);
					}
			}
		})

		CCSE.NewPlant('manolia',{
			name:'manolia',
			plantable:true,
			icon:42,
			cost:330,
			costM:330000000,
			ageTick:4,
			ageTickR:8,
			mature:77,
			children:['wandoria'],
			effsStr:'<div class="green">&bull; Harvest mature to restore 1 magic in Grimoire.</div>',
			q:'Wizards often use this plant because of magic that acumulate in flowers.',
			onHarvest(x,y,age){
				if (age>=this.mature){
						Game.Objects['Wizard tower'].minigame.magic+=1;
					}
			}
		})
		CCSE.NewPlant('dragoon',{
			name:'timi-timy',
			plantable:true,
			icon:43,
			cost:60*60*24,
			costM:Math.pow(2,31),
			ageTick:1,
			ageTickR:0,
			mature:80,
			children:[],
			effsStr:'<div class="grey">&bull; May skip few seconds to the next tick</div>',
			q:'This strikingly reminiscent of a human face plants seems to speed time around them. Although when you close it doesn\'t look like anything happen, all world around age less than you.',

		})

		CCSE.NewPlant('resaria',{
			name:'Resaria',
			plantable:true,
			icon:44,
			cost:60,
			costM:1000000,
			ageTick:2,
			ageTickR:5,
			mature:90,
			children:['variega'],
			effsStr:'<div class="green">&bull; Research speed +10%</div>',
			q:'Improves concentration and memory',

		})

		CCSE.NewPlant('wandoria',{
			name:'Wandoria',
			plantable:true,
			icon:45,
			cost:13,
			costM:131313,
			ageTick:5,
			ageTickR:2,
			mature:66,
			children:[],
			effsStr:'<div class="green">&bull; Magic regeneration speed +4%</div>',
			q:'Wizard often use this plant as a wand because of high magic conductivity.',

		})
		CCSE.NewPlant('sugarshroom',{
			name:'Sugar shroom',
			plantable:true,
			icon:46,
			cost:1,
			costM:1,
			ageTick:10,
			ageTickR:5,
			mature:45,
			children:[],
			effsStr:'<div class="red">&bull; Harvest mature to induce Sugar Storm.</div>'+'<div class="red">&bull; May cause sugar addiction.</div>',
			q:'The hat of this mushroom is 1 bilion times sweater than pure sugar. Even one small lick can cause you strong sugar addiction. Because of that grandmatriarchy in the 12th year of they reign banned cultivation and possesion of this plant.',
			onHarvest(x,y,age){
				if (age>=this.mature){
						Game.Objects['Farm'].minigame.dropUpgrade('Sugar Frenzy',0.001);
						for(i=0;i<1000;i++) new Game.shimmer('golden',{noWrath:true}).force='sugar storm';
					}
			}
		})

		CCSE.NewPlant('merigold',{
			name:'Merigold',
			plantable:true,
			icon:47,
			cost:365*24*60,
			costM:Math.pow(10,33),
			ageTick:0,
			ageTickR:200,
			mature:95,
			children:[],
			effsStr:'<div class="green">&bull; All stocks in market prosper a little better.</div>'+'<div class="red">&bull; Unpredictable grow</div>',
			q:'They say if you see this plant you will have luck in stocks.',
			onHarvest(x,y,age){
				if (age>=this.mature){
					var M=Game.Objects['Bank'].minigame;
					for (var i=0;i<M.goodsById.length;i++){
						var me=M.goodsById[i];
						me.val+=0.1;
						me.d+=0.01;
					};
				};
			}
		})
		CCSE.NewPlant('variega',{
			name:'Variega',
			plantable:true,
			icon:48,
			cost:33,
			costM:333333333,
			ageTick:3,
			ageTickR:3,
			mature:33,
			children:['variega'],
			effsStr:'<div class="green">&bull; Mutation on nearby tile are 2 times more common</div>',
			q:'This plant made by scientists in laboratory seems to change DNA of nearby plants',
		})

		CCSE.MinigameReplacer(function(){
			var objKey = 'Farm';
			var M = Game.Objects[objKey].minigame;
            M.plants['bakerWheat'].children=['bakerWheat','thumbcorn','cronerice','bakeberry','clover','goldenClover','chocoroot','tidygrass'];
			M.plants['meddleweed'].children=['meddleweed','annoyeed','brownMold','crumbspore'];
			M.plants['clover'].children=['goldenClover','greenRot','shimmerlily','sugarpalm','licomint'];
			M.plants['goldenClover'].children=['sugarpalm','licomint','GoldQueen'];
			M.plants['gildmillet'].children=['clover','goldenClover','shimmerlily','licomint'];
			M.plants['shimmerlily'].children=['elderwort','whiskerbloom','chimerose','cheapcap','licomint'];
			M.plants['whiteChocoroot'].children=['whiskerbloom','tidygrass','licomint'];
			M.plants['greenRot'].children=['keenmoss','foolBolete','licomint'];
			M.plants['foolBolete'].children=['licomint','dragoon'];
			M.plants['queenbeetLump'].children=['GoldQueen'];
			M.plants['drowsyfern'].children=['manolia'];
			M.plants['nursetulip'].children=['manolia','wandoria'];
			M.plants['glovemorel'].children=['dragoon'];
			M.plants['everdaisy'].children=['resaria'];
			M.plants['chimerose'].children=['chimerose','resaria'];
			M.plants['cheapcap'].children=['merigold'];
			
		/*M.plotLimits=[
			[2,2,4,4],
			[2,2,5,4],
			[2,2,5,5],
			[1,2,5,5],
			[1,1,5,5],
			[1,1,6,5],
			[1,1,6,6],
			[0,1,6,6],
			[0,0,6,6],
			[0,0,7,6],
			[0,0,7,7],
		];*/
		/*M.getTile=function(x,y)
		{
			if (x<0 || x>6 || y<0 || y>6 || !M.isTileUnlocked(x,y)) return [0,0];
			return M.plot[y][x];
		}*/
		M.plantsById=[];var n=0;
			for (var i in M.plants)
			{	

				var it=M.plants[i];
				it.unlocked=0;
				it.id=n;
				it.key=i;
				it.matureBase=it.mature;
				M.plantsById[n]=it;
				if (typeof it.plantable==='undefined') {it.plantable=true;}
				//it.q=loc(FindLocStringByPart(it.name+' quote'));

				it.name=loc(it.name);
				n++;
			}
		M.plantContam={};
		for (var i in M.plants)
		{
			if (M.plants[i].contam) M.plantContam[M.plants[i].key]=M.plants[i].contam;
		}
		M.computeMatures=function()
		{
			var mult=1;
			if (Game.HasAchiev('Seedless to nay')) mult=0.95;
			for (var i in M.plants)
			{
				M.plants[i].mature=M.plants[i].matureBase*mult;
			}
		}
		M.plantsN=M.plantsById.length;

		M.getUnlockedN=function()
		{
			M.plantsUnlockedN=0;
			for (var i in M.plants){if (M.plants[i].unlocked) M.plantsUnlockedN++;}
			if (M.plantsUnlockedN>=M.plantsN)
			{
				Game.Win('Keeper of the conservatory');
				l('gardenTool-3').classList.remove('locked');
			}
			else l('gardenTool-3').classList.add('locked');
			
			return M.plantsUnlockedN;
		}
			M.getMuts=function(neighs,neighsM)
		{
			//get possible mutations given a list of neighbors
			//note: neighs stands for neighbors, not horsey noises
			var muts=[];
			var i=0;
			if(neighsM['variega']>=1) i-=neighsM['variega'];
			for(i<1;i++;){
			if (neighsM['bakerWheat']>=2) muts.push(['bakerWheat',0.2],['thumbcorn',0.05],['bakeberry',0.001]);
			if (neighsM['bakerWheat']>=1 && neighsM['thumbcorn']>=1) muts.push(['cronerice',0.01]);
				if (neighsM['thumbcorn']>=2) muts.push(['thumbcorn',0.1],['bakerWheat',0.05]);
			if (neighsM['cronerice']>=1 && neighsM['thumbcorn']>=1) muts.push(['gildmillet',0.03]);
				if (neighsM['cronerice']>=2) muts.push(['thumbcorn',0.02]);
			if (neighsM['bakerWheat']>=1 && neighsM['gildmillet']>=1) muts.push(['clover',0.03],['goldenClover',0.0007]);
			if (neighsM['clover']>=1 && neighsM['gildmillet']>=1) muts.push(['shimmerlily',0.02]);
				if (neighsM['clover']>=2 && neighs['clover']<5) muts.push(['clover',0.007],['goldenClover',0.0001]);
				if (neighsM['clover']>=4) muts.push(['goldenClover',0.0007]);
				if(neighsM['clover']+2*neighsM['goldenClover']>=8) muts.push(['sugarpalm',0.0007]);
			if (neighsM['shimmerlily']>=1 && neighsM['cronerice']>=1) muts.push(['elderwort',0.01]);
				if (neighsM['wrinklegill']>=1 && neighsM['cronerice']>=1) muts.push(['elderwort',0.002]);
			if (neighsM['bakerWheat']>=1 && neighs['brownMold']>=1) muts.push(['chocoroot',0.1]);
			if (neighsM['chocoroot']>=1 && neighs['whiteMildew']>=1) muts.push(['whiteChocoroot',0.1]);
			if (neighsM['whiteMildew']>=1 && neighs['brownMold']<=1) muts.push(['brownMold',0.5]);
			if (neighsM['brownMold']>=1 && neighs['whiteMildew']<=1) muts.push(['whiteMildew',0.5]);
			if (neighsM['meddleweed']>=1 && neighs['meddleweed']<=3) muts.push(['meddleweed',0.15],['annoyeed',0.05]);
			if (neighsM['meddleweed']>=2 ) muts.push(['annoyeed',0.05]);
			if (neighsM['meddleweed']>=3 ) muts.push(['annoyeed',0.10]);
			if (neighsM['meddleweed']>=4 ) muts.push(['annoyeed',0.15]);
			if (neighsM['annoyeed']>=1 ) muts.push(['annoyeed',0.30]);
			if (neighsM['annoyeed']>=2 ) muts.push(['annoyeed',0.30]);
			if (neighsM['annoyeed']>=3 ) muts.push(['annoyeed',0.45]);
			if (neighsM['annoyeed']>=4 ) muts.push(['annoyeed',0.60]);
			if (neighsM['shimmerlily']>=1 && neighsM['whiteChocoroot']>=1) muts.push(['whiskerbloom',0.01]);
			if (neighsM['shimmerlily']>=1 && neighsM['whiskerbloom']>=1) muts.push(['chimerose',0.05]);
				if (neighsM['chimerose']>=2) muts.push(['chimerose',0.005]);
			if (neighsM['whiskerbloom']>=2) muts.push(['nursetulip',0.05]);
			if (neighsM['chocoroot']>=1 && neighsM['keenmoss']>=1) muts.push(['drowsyfern',0.005]);
			if ((neighsM['cronerice']>=1 && neighsM['keenmoss']>=1) || (neighsM['cronerice']>=1 && neighsM['whiteMildew']>=1)) muts.push(['wardlichen',0.005]);
				if (neighsM['wardlichen']>=1 && neighs['wardlichen']<2) muts.push(['wardlichen',0.05]);
			if (neighsM['greenRot']>=1 && neighsM['brownMold']>=1) muts.push(['keenmoss',0.1]);
				if (neighsM['keenmoss']>=1 && neighs['keenmoss']<2) muts.push(['keenmoss',0.05]);
			if (neighsM['chocoroot']>=1 && neighsM['bakeberry']>=1) muts.push(['queenbeet',0.01]);
				if (neighsM['queenbeet']>=8) muts.push(['queenbeetLump',0.001]);
			if (neighsM['queenbeet']>=2) muts.push(['duketater',0.001]);
			
				if (neighsM['crumbspore']>=1 && neighs['crumbspore']<=1) muts.push(['crumbspore',0.07]);
			if (neighsM['crumbspore']>=1 && neighsM['thumbcorn']>=1) muts.push(['glovemorel',0.02]);
			if (neighsM['crumbspore']>=1 && neighsM['shimmerlily']>=1) muts.push(['cheapcap',0.04]);
			if (neighsM['doughshroom']>=1 && neighsM['greenRot']>=1) muts.push(['foolBolete',0.04]);
			if (neighsM['crumbspore']>=2) muts.push(['doughshroom',0.005]);
				if (neighsM['doughshroom']>=1 && neighs['doughshroom']<=1) muts.push(['doughshroom',0.07]);
				if (neighsM['doughshroom']>=2) muts.push(['crumbspore',0.005]);
			if (neighsM['crumbspore']>=1 && neighsM['brownMold']>=1) muts.push(['wrinklegill',0.06]);
			if (neighsM['whiteMildew']>=1 && neighsM['clover']>=1) muts.push(['greenRot',0.05]);
			
			if (neighsM['wrinklegill']>=1 && neighsM['elderwort']>=1) muts.push(['shriekbulb',0.001]);
			if (neighsM['elderwort']>=5) muts.push(['shriekbulb',0.001]);
			if (neighs['duketater']>=3) muts.push(['shriekbulb',0.005]);
			if (neighs['doughshroom']>=4) muts.push(['shriekbulb',0.002]);
			if (neighsM['queenbeet']>=5) muts.push(['shriekbulb',0.001]);
				if (neighs['shriekbulb']>=1 && neighs['shriekbulb']<2) muts.push(['shriekbulb',0.005]);
			
			if (neighsM['bakerWheat']>=1 && neighsM['whiteChocoroot']>=1) muts.push(['tidygrass',0.002]);
			if (neighsM['tidygrass']>=3 && neighsM['elderwort']>=3) muts.push(['everdaisy',0.002]);
			if (neighsM['elderwort']>=1 && neighsM['crumbspore']>=1) muts.push(['ichorpuff',0.002]);
			if (neighsM['shimmerlily']>=1 && neighsM['clover']>=1 && neighsM['goldenClover']>=1 && neighsM['gildmillet']>=1 && neighsM['whiteChocoroot']>=1 && neighsM['greenRot']>=1&& neighsM['foolBolete']>=1) muts.push(['licomint',0.0777]);
			if (neighsM['goldenClover']>=4 && neighsM['queenbeetLump']>=1) muts.push(['GoldQueen',0.0007]);
			if (neighsM['drowsyfern']>=1 && neighsM['nursetulip']>=1) muts.push(['manolia',0.01]);
			if (neighsM['foolBolete']>=1 && neighsM['glovemorel']>=1) muts.push(['dragoon',0.0001]);
			if (neighsM['nursetulip']>=1 && neighsM['manolia']>=1) muts.push(['wandoria',0.005]);
			if (neighsM['annoyeed']>=1 && neighsM['ichorpuff']>=1) muts.push(['sugarshroom',1]);
			if (neighsM['cheapcap']>=3 ) muts.push(['merigold',0.009]);
			if (neighsM['everdaisy']>=1 && neighsM['chimerose']>=1 ) muts.push(['resaria',0.0005]);
			if (neighsM['JS']>=1 && neighsM['resaria']>=1 ) muts.push(['variega',0.1]);
			if (neighsM['variega']>=1 ) muts.push(['variega',1]);
			if(Math.random()<0.000001*Game.Objects['Javascript console'].amount){ muts.push(['JS',0.001*Game.Objects['Javascript console'].amount])};
			if(Math.random()<Math.pow(10,muts.length)*0.000001){ muts.push(['quest',0.001*muts.length])};
			}
			return muts;
		}
		M.computeBoostPlot=function()
		{
			//some plants apply effects to surrounding tiles
			//this function computes those effects by creating a grid in which those effects stack
			for (var y=0;y<6;y++)
			{
				for (var x=0;x<6;x++)
				{
					//age mult, power mult, weed mult
					M.plotBoost[y][x]=[1,1,1];
				}
			}
			
			var effectOn=function(X,Y,s,mult)
			{
				for (var y=Math.max(0,Y-s);y<Math.min(6,Y+s+1);y++)
				{
					for (var x=Math.max(0,X-s);x<Math.min(6,X+s+1);x++)
					{
						if (X==x && Y==y) {}
						else
						{
							for (var i=0;i<mult.length;i++)
							{
								M.plotBoost[y][x][i]*=mult[i];
							}
						}
					}
				}
			}
			for (var y=0;y<6;y++)
			{
				for (var x=0;x<6;x++)
				{
					var tile=M.plot[y][x];
					if (tile[0]>0)
					{
						var me=M.plantsById[tile[0]-1];
						var name=me.key;
						var stage=0;
						if (tile[1]>=me.mature) stage=4;
						else if (tile[1]>=me.mature*0.666) stage=3;
						else if (tile[1]>=me.mature*0.333) stage=2;
						else stage=1;
						
						var soilMult=M.soilsById[M.soil].effMult;
						var mult=soilMult;
						
						if (stage==1) mult*=0.1;
						else if (stage==2) mult*=0.25;
						else if (stage==3) mult*=0.5;
						else mult*=1;
						
						//age mult, power mult, weed mult
						/*if (name=='elderwort') effectOn(x,y,1,[1+0.03*mult,1,1]);
						else if (name=='queenbeetLump') effectOn(x,y,1,[1,1-0.2*mult,1]);
						else if (name=='nursetulip') effectOn(x,y,1,[1,1+0.2*mult,1]);
						else if (name=='shriekbulb') effectOn(x,y,1,[1,1-0.05*mult,1]);
						else if (name=='tidygrass') effectOn(x,y,2,[1,1,0]);
						else if (name=='everdaisy') effectOn(x,y,1,[1,1,0]);
						else if (name=='ichorpuff') effectOn(x,y,1,[1-0.5*mult,1-0.5*mult,1]);*/
						
						var ageMult=1;
						var powerMult=1;
						var weedMult=1;
						var range=0;
						
						if (name=='elderwort') {ageMult=1.03;range=1;}
						else if (name=='queenbeetLump') {powerMult=0.8;range=1;}
						else if (name=='nursetulip') {powerMult=1.2;range=1;}
						else if (name=='shriekbulb') {powerMult=0.95;range=1;}
						else if (name=='tidygrass') {weedMult=0;range=2;}
						else if (name=='everdaisy') {weedMult=0;range=1;}
						else if (name=='ichorpuff') {ageMult=0.5;powerMult=0.5;range=1;}
						else if (name=='annoyeed') {powerMult=0.95;range=1;}
						
						//by god i hope these are right
						if (ageMult>=1) ageMult=(ageMult-1)*mult+1; else if (mult>=1) ageMult=1/((1/ageMult)*mult); else ageMult=1-(1-ageMult)*mult;
						if (powerMult>=1) powerMult=(powerMult-1)*mult+1; else if (mult>=1) powerMult=1/((1/powerMult)*mult); else powerMult=1-(1-powerMult)*mult;
						
						if (range>0) effectOn(x,y,range,[ageMult,powerMult,weedMult]);
					}
				}
			}
		}
		
		M.computeEffs=function()
		{
			M.toCompute=false;
			var effs={
				cps:1,
				click:1,
				cursorCps:1,
				grandmaCps:1,
				JSCps:1,
				goldenCookieGain:1,
				goldenCookieFreq:1,
				goldenCookieDur:1,
				goldenCookieEffDur:1,
				wrathCookieGain:1,
				wrathCookieFreq:1,
				wrathCookieDur:1,
				wrathCookieEffDur:1,
				reindeerGain:1,
				reindeerFreq:1,
				reindeerDur:1,
				itemDrops:1,
				milk:1,
				wrinklerSpawn:1,
				wrinklerEat:1,
				upgradeCost:1,
				buildingCost:1,
				researchspeed:1,
				skipsec:0,
				magicreg:1,
			};
			
			if (!M.freeze)
			{
				var soilMult=M.soilsById[M.soil].effMult;
				
				for (var y=0;y<6;y++)
				{
					for (var x=0;x<6;x++)
					{
						var tile=M.plot[y][x];
						if (tile[0]>0)
						{
							var me=M.plantsById[tile[0]-1];
							var name=me.key;
							var stage=0;
							if (tile[1]>=me.mature) stage=4;
							else if (tile[1]>=me.mature*0.666) stage=3;
							else if (tile[1]>=me.mature*0.333) stage=2;
							else stage=1;
							
							var mult=soilMult;
							
							if (stage==1) mult*=0.1;
							else if (stage==2) mult*=0.25;
							else if (stage==3) mult*=0.5;
							else mult*=1;
							
							mult*=M.plotBoost[y][x][1];
							
							if (name=='bakerWheat') effs.cps+=0.01*mult;
							else if (name=='thumbcorn') effs.click+=0.02*mult;
							else if (name=='cronerice') effs.grandmaCps+=0.03*mult;
							else if (name=='gildmillet') {effs.goldenCookieGain+=0.01*mult;effs.goldenCookieEffDur+=0.001*mult;}
							else if (name=='clover') effs.goldenCookieFreq+=0.01*mult;
							else if (name=='goldenClover') effs.goldenCookieFreq+=0.03*mult;
							else if (name=='shimmerlily') {effs.goldenCookieGain+=0.01*mult;effs.goldenCookieFreq+=0.01*mult;effs.itemDrops+=0.01*mult;}
							else if (name=='elderwort') {effs.wrathCookieGain+=0.01*mult;effs.wrathCookieFreq+=0.01*mult;effs.grandmaCps+=0.01*mult;}
							else if (name=='bakeberry') effs.cps+=0.01*mult;
							else if (name=='chocoroot') effs.cps+=0.01*mult;
							else if (name=='whiteChocoroot') effs.goldenCookieGain+=0.01*mult;
							
							else if (name=='whiteMildew') effs.cps+=0.01*mult;
							else if (name=='brownMold') effs.cps*=1-0.01*mult;
							
							else if (name=='meddleweed') {}
							
							else if (name=='whiskerbloom') effs.milk+=0.002*mult;
							else if (name=='chimerose') {effs.reindeerGain+=0.01*mult;effs.reindeerFreq+=0.01*mult;}
							
							else if (name=='nursetulip') {effs.cps*=1-0.02*mult;}
							else if (name=='drowsyfern') {effs.cps+=0.03*mult;effs.click*=1-0.05*mult;effs.goldenCookieFreq*=1-0.1*mult;}
							else if (name=='wardlichen') {effs.wrinklerSpawn*=1-0.15*mult;effs.wrathCookieFreq*=1-0.02*mult;}
							else if (name=='keenmoss') {effs.itemDrops+=0.03*mult;}
							else if (name=='queenbeet') {effs.goldenCookieEffDur+=0.003*mult;effs.cps*=1-0.02*mult;}
							else if (name=='queenbeetLump') {effs.cps*=1-0.1*mult;}
							else if (name=='GoldQueen') {effs.cps*=1-0.7*mult;effs.goldenCookieEffDur+=0.1*mult;effs.goldenCookieDur+=0.1*mult;effs.goldenCookieFreq+=0.1*mult;effs.goldenCookieGain+=0.1*mult;}
							else if (name=='glovemorel') {effs.click+=0.04*mult;effs.cursorCps+=0.01*mult;effs.cps*=1-0.01*mult;}
							else if (name=='cheapcap') {effs.upgradeCost*=1-0.002*mult;effs.buildingCost*=1-0.002*mult;}
							else if (name=='foolBolete') {effs.goldenCookieFreq+=0.02*mult;effs.goldenCookieGain*=1-0.05*mult;effs.goldenCookieDur*=1-0.02*mult;effs.goldenCookieEffDur*=1-0.02*mult;}
							else if (name=='wrinklegill') {effs.wrinklerSpawn+=0.02*mult;effs.wrinklerEat+=0.01*mult;}
							else if (name=='greenRot') {effs.goldenCookieDur+=0.005*mult;effs.goldenCookieFreq+=0.01*mult;effs.itemDrops+=0.01*mult;}
							else if (name=='shriekbulb') {effs.cps*=1-0.02*mult;}
							else if (name=='annoyeed') {effs.cps*=1-0.01*mult;}
							else if (name=='JS') {effs.JSCps+=0.05*mult;}
							else if (name=='dragoon') {effs.skipsec+=0.001*mult;}
							else if (name=='resaria') {effs.researchspeed+=0.1*mult;}
							else if (name=='wandoria') {effs.magicreg+=0.04*mult;}
						}
					}
				}
			}
			M.effs=effs;
			Game.recalculateGains=1;
		}
		M.save=function(){
			var str='';
			return str
		}
		M.seedTooltip=function(id)
		{
			return function(){
				var me=M.plantsById[id];
				if (me.q=='???')
				{
				var str='<div style="padding:8px 4px;min-width:400px;" id="tooltipGardenSeed">'+
					'<div class="icon" style="background:url(../mods/workshop/Garden_extension/gardenPlants.png?v='+Game.version+');float:left;margin-left:-24px;margin-top:-4px;background-position:'+(-0*48)+'px '+(-me.icon*48)+'px;"></div>'+
					'<div class="icon" style="background:url(../mods/workshop/Garden_extension/gardenPlants.png?v='+Game.version+');float:left;margin-left:-24px;margin-top:-28px;background-position:'+(-4*48)+'px '+(-me.icon*48)+'px;"></div>'+
					'<div style="background:url('+Game.resPath+'img/turnInto.png);width:20px;height:22px;position:absolute;left:28px;top:24px;z-index:1000;"></div>'+
					(me.plantable?('<div style="float:right;text-align:right;width:100px;"><small>'+loc("???:")+'</small><br><span class="price'+(M.canPlant(me)?'':' disabled')+'">'+'???'+'</span><br><small>'+loc("??? ???,<br>??? ???",[Game.sayTime(me.cost*60*30,-1),loc("%1 cookie",LBeautify(me.costM))])+'</small></div>'):'')+
					'<div style="width:300px;"><div class="name">'+cap(loc("??? ???",me.name))+'</div><div><small>'+(me.plantable?loc("???"):'<span class="red">'+loc("This seed cannot be planted.")+'</span>')+'<br>'+loc("??? ???",loc("???")+'+'+loc("???")+'+'+loc("???"))+'</small></div></div>'+
					'<div class="line"></div>'+
					M.getPlantDesc(me)+
				'</div>';
				}else{
				var str='<div style="padding:8px 4px;min-width:400px;" id="tooltipGardenSeed">'+
					'<div class="icon" style="background:url(../mods/workshop/Garden_extension/gardenPlants.png?v='+Game.version+');float:left;margin-left:-24px;margin-top:-4px;background-position:'+(-0*48)+'px '+(-me.icon*48)+'px;"></div>'+
					'<div class="icon" style="background:url(../mods/workshop/Garden_extension/gardenPlants.png?v='+Game.version+');float:left;margin-left:-24px;margin-top:-28px;background-position:'+(-4*48)+'px '+(-me.icon*48)+'px;"></div>'+
					'<div style="background:url('+Game.resPath+'img/turnInto.png);width:20px;height:22px;position:absolute;left:28px;top:24px;z-index:1000;"></div>'+
					(me.plantable?('<div style="float:right;text-align:right;width:100px;"><small>'+loc("Planting cost:")+'</small><br><span class="price'+(M.canPlant(me)?'':' disabled')+'">'+Beautify(Math.round(shortenNumber(M.getCost(me))))+'</span><br><small>'+loc("%1 of CpS,<br>minimum %2",[Game.sayTime(me.cost*60*30,-1),loc("%1 cookie",LBeautify(me.costM))])+'</small></div>'):'')+
					'<div style="width:300px;"><div class="name">'+cap(loc("%1 seed",me.name))+'</div><div><small>'+(me.plantable?loc("Click to select this seed for planting."):'<span class="red">'+loc("This seed cannot be planted.")+'</span>')+'<br>'+loc("%1 to harvest all mature plants of this type.",loc("Shift")+'+'+loc("Ctrl")+'+'+loc("Click"))+'</small></div></div>'+
					'<div class="line"></div>'+
					M.getPlantDesc(me)+
				'</div>';
				}
				return str;
			};
		}
		M.tileTooltip=function(x,y)
		{
			return function(){
				if (Game.keys[16]) return '';
				var tile=M.plot[y][x];
				if (tile[0]==0)
				{
					var me=(M.seedSelected>=0)?M.plantsById[M.seedSelected]:0;
					var str='<div style="padding:8px 4px;min-width:350px;text-align:center;" id="tooltipGardenTile">'+
						'<div class="name">'+loc("Empty tile")+'</div>'+'<div class="line"></div><div class="description">'+
							loc("This tile of soil is empty.<br>Pick a seed and plant something!")+
							(me?'<div class="line"></div>'+loc("Click to plant %1 for %2.",['<b>'+me.name+'</b>','<span class="price'+(M.canPlant(me)?'':' disabled')+'">'+Beautify(Math.round(M.getCost(me)))+'</span>'])+'<br><small>('+loc("%1 to plant multiple.",loc("Shift-click"))+')</small>'+(EN?'<br><small>(Holding the shift key pressed will also hide tooltips.)</small>':''):'')+
								(M.plotBoost[y][x][0]!=1?'<br><small>'+loc("Aging multiplier:")+' '+Beautify(M.plotBoost[y][x][0]*100)+'%</small>':'')+
								(M.plotBoost[y][x][1]!=1?'<br><small>'+loc("Effect multiplier:")+' '+Beautify(M.plotBoost[y][x][1]*100)+'%</small>':'')+
								(M.plotBoost[y][x][2]!=1?'<br><small>'+loc("Weeds/fungus repellent:")+' '+Beautify(100-M.plotBoost[y][x][2]*100)+'%</small>':'')+
						'</div>'+
					'</div>';
					return str;
				}
				else
				{
					var me=M.plantsById[tile[0]-1];
					var stage=0;
					if (tile[1]>=me.mature) stage=4;
					else if (tile[1]>=me.mature*0.666) stage=3;
					else if (tile[1]>=me.mature*0.333) stage=2;
					else stage=1;
					var dragonBoost=1/(1+0.05*Game.auraMult('Supreme Intellect'));
					var icon=[stage,me.icon];
					if (me.q=='???'){
										var str='<div style="padding:8px 4px;min-width:350px;">'+
						'<div class="icon" style="background:url(../mods/workshop/Garden_extension/gardenPlants.png?v='+Game.version+');float:left;margin-left:-8px;margin-top:-8px;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div>'+
						'<div class="name">'+me.name+'</div><div><small>'+loc("???")+'</small></div>'+
						'<div class="line"></div>'+
						'<div style="text-align:center;">'+
							'<div style="display:inline-block;position:relative;box-shadow:0px 0px 0px 1px #000,0px 0px 0px 1px rgba(255,255,255,0.5) inset,0px -2px 2px 0px rgba(255,255,255,0.5) inset;width:256px;height:6px;background:linear-gradient(to right,#fff 0%,#0f9 '+me.mature+'%,#3c0 '+(me.mature+0.1)+'%,#960 100%)">'+
								'<div class="gardenGrowthIndicator" style="left:'+Math.floor((tile[1]/100)*256)+'px;"></div>'+
								'<div style="background:url(../mods/workshop/Garden_extension/gardenPlants.png?v='+Game.version+');background-position:'+(-1*48)+'px '+(-icon[1]*48)+'px;position:absolute;left:'+(0-24)+'px;top:-32px;transform:scale(0.5,0.5);width:48px;height:48px;"></div>'+
								'<div style="background:url(../mods/workshop/Garden_extension/gardenPlants.png?v='+Game.version+');background-position:'+(-2*48)+'px '+(-icon[1]*48)+'px;position:absolute;left:'+((((me.mature*0.333)/100)*256)-24)+'px;top:-32px;transform:scale(0.5,0.5);width:48px;height:48px;"></div>'+
								'<div style="background:url(../mods/workshop/Garden_extension/gardenPlants.png?v='+Game.version+');background-position:'+(-3*48)+'px '+(-icon[1]*48)+'px;position:absolute;left:'+((((me.mature*0.666)/100)*256)-24)+'px;top:-32px;transform:scale(0.5,0.5);width:48px;height:48px;"></div>'+
								'<div style="background:url(../mods/workshop/Garden_extension/gardenPlants.png?v='+Game.version+');background-position:'+(-4*48)+'px '+(-icon[1]*48)+'px;position:absolute;left:'+((((me.mature)/100)*256)-24)+'px;top:-32px;transform:scale(0.5,0.5);width:48px;height:48px;"></div>'+
							'</div><br>'+
							'<b>'+loc("???:")+'</b> '+loc(["?","??","???","????"][stage-1])+'<br>'+
							'<small>'+(stage==1?loc("???:")+' ???%':stage==2?loc("???:")+' ???%':stage==3?loc("???:")+' ???%':loc("???:")+' ???%; '+loc("???, ???"))+'</small>'+
							'<br><small>'+(
								stage<4?(
									loc("??? ???",Game.sayTime(((100/(M.plotBoost[y][x][0]*(me.ageTick+me.ageTickR/2)))*((me.mature-tile[1])/100)*dragonBoost*M.stepT)*30,-1))+' ('+loc("??? ???",LBeautify(Math.ceil((100/(M.plotBoost[y][x][0]*(me.ageTick+me.ageTickR/2)/dragonBoost))*((me.mature-tile[1])/100))))+')'
								):(
									!me.immortal?(
										loc("??? ???",Game.sayTime(((100/(M.plotBoost[y][x][0]*(me.ageTick+me.ageTickR/2)))*((100-tile[1])/100)*dragonBoost*M.stepT)*30,-1))+' ('+loc("??? ???",LBeautify(Math.ceil((100/(M.plotBoost[y][x][0]*(me.ageTick+me.ageTickR/2)/dragonBoost))*((100-tile[1])/100))))+')'
									):
										loc("??? ???")
								)
							)+'</small>'+
								(M.plotBoost[y][x][0]!=1?'<br><small>'+loc("??? ???:")+' '+'???'+'%</small>':'')+
								(M.plotBoost[y][x][1]!=1?'<br><small>'+loc("??? ???:")+' '+'???'+'%</small>':'')+
								(M.plotBoost[y][x][2]!=1?'<br><small>'+loc("???/??? ???:")+' '+'???'+'%</small>':'')+
						'</div>'+
						'<div class="line"></div>'+
						//'<div style="text-align:center;">Click to harvest'+(M.seedSelected>=0?', planting <b>'+M.plantsById[M.seedSelected].name+'</b><br>for <span class="price'+(M.canPlant(me)?'':' disabled')+'">'+Beautify(Math.round(M.getCost(M.plantsById[M.seedSelected])))+'</span> in its place':'')+'.</div>'+
						'<div style="text-align:center;">'+(stage==4?loc("??? ???."):loc("??? ???."))+'</div>'+
						'<div class="line"></div>'+
						M.getPlantDesc(me)+
					'</div>';
					}else{
					var str='<div style="padding:8px 4px;min-width:350px;">'+
						'<div class="icon" style="background:url(../mods/workshop/Garden_extension/gardenPlants.png?v='+Game.version+');float:left;margin-left:-8px;margin-top:-8px;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div>'+
						'<div class="name">'+me.name+'</div><div><small>'+loc("This plant is growing here.")+'</small></div>'+
						'<div class="line"></div>'+
						'<div style="text-align:center;">'+
							'<div style="display:inline-block;position:relative;box-shadow:0px 0px 0px 1px #000,0px 0px 0px 1px rgba(255,255,255,0.5) inset,0px -2px 2px 0px rgba(255,255,255,0.5) inset;width:256px;height:6px;background:linear-gradient(to right,#fff 0%,#0f9 '+me.mature+'%,#3c0 '+(me.mature+0.1)+'%,#960 100%)">'+
								'<div class="gardenGrowthIndicator" style="left:'+Math.floor((tile[1]/100)*256)+'px;"></div>'+
								'<div style="background:url(../mods/workshop/Garden_extension/gardenPlants.png?v='+Game.version+');background-position:'+(-1*48)+'px '+(-icon[1]*48)+'px;position:absolute;left:'+(0-24)+'px;top:-32px;transform:scale(0.5,0.5);width:48px;height:48px;"></div>'+
								'<div style="background:url(../mods/workshop/Garden_extension/gardenPlants.png?v='+Game.version+');background-position:'+(-2*48)+'px '+(-icon[1]*48)+'px;position:absolute;left:'+((((me.mature*0.333)/100)*256)-24)+'px;top:-32px;transform:scale(0.5,0.5);width:48px;height:48px;"></div>'+
								'<div style="background:url(../mods/workshop/Garden_extension/gardenPlants.png?v='+Game.version+');background-position:'+(-3*48)+'px '+(-icon[1]*48)+'px;position:absolute;left:'+((((me.mature*0.666)/100)*256)-24)+'px;top:-32px;transform:scale(0.5,0.5);width:48px;height:48px;"></div>'+
								'<div style="background:url(../mods/workshop/Garden_extension/gardenPlants.png?v='+Game.version+');background-position:'+(-4*48)+'px '+(-icon[1]*48)+'px;position:absolute;left:'+((((me.mature)/100)*256)-24)+'px;top:-32px;transform:scale(0.5,0.5);width:48px;height:48px;"></div>'+
							'</div><br>'+
							'<b>'+loc("Stage:")+'</b> '+loc(["bud","sprout","bloom","mature"][stage-1])+'<br>'+
							'<small>'+(stage==1?loc("Plant effects:")+' 10%':stage==2?loc("Plant effects:")+' 25%':stage==3?loc("Plant effects:")+' 50%':loc("Plant effects:")+' 100%; '+loc("may reproduce, will drop seed when harvested"))+'</small>'+
							'<br><small>'+(
								stage<4?(
									loc("Mature in about %1",Game.sayTime(((100/(M.plotBoost[y][x][0]*(me.ageTick+me.ageTickR/2)))*((me.mature-tile[1])/100)*dragonBoost*M.stepT)*30,-1))+' ('+loc("%1 tick",LBeautify(Math.ceil((100/(M.plotBoost[y][x][0]*(me.ageTick+me.ageTickR/2)/dragonBoost))*((me.mature-tile[1])/100))))+')'
								):(
									!me.immortal?(
										loc("Decays in about %1",Game.sayTime(((100/(M.plotBoost[y][x][0]*(me.ageTick+me.ageTickR/2)))*((100-tile[1])/100)*dragonBoost*M.stepT)*30,-1))+' ('+loc("%1 tick",LBeautify(Math.ceil((100/(M.plotBoost[y][x][0]*(me.ageTick+me.ageTickR/2)/dragonBoost))*((100-tile[1])/100))))+')'
									):
										loc("Does not decay")
								)
							)+'</small>'+
								(M.plotBoost[y][x][0]!=1?'<br><small>'+loc("Aging multiplier:")+' '+Beautify(M.plotBoost[y][x][0]*100)+'%</small>':'')+
								(M.plotBoost[y][x][1]!=1?'<br><small>'+loc("Effect multiplier:")+' '+Beautify(M.plotBoost[y][x][1]*100)+'%</small>':'')+
								(M.plotBoost[y][x][2]!=1?'<br><small>'+loc("Weeds/fungus repellent:")+' '+Beautify(100-M.plotBoost[y][x][2]*100)+'%</small>':'')+
						'</div>'+
						'<div class="line"></div>'+
						//'<div style="text-align:center;">Click to harvest'+(M.seedSelected>=0?', planting <b>'+M.plantsById[M.seedSelected].name+'</b><br>for <span class="price'+(M.canPlant(me)?'':' disabled')+'">'+Beautify(Math.round(M.getCost(M.plantsById[M.seedSelected])))+'</span> in its place':'')+'.</div>'+
						'<div style="text-align:center;">'+(stage==4?loc("Click to harvest."):loc("Click to unearth."))+'</div>'+
						'<div class="line"></div>'+
						M.getPlantDesc(me)+
					'</div>';
					}
					return str;
				}
			};
		}

			M.draw=function()
	{
		//run each draw frame
		
		if (M.cursorL)
		{
			if (!M.cursor || M.seedSelected<0)
			{
				M.cursorL.style.display='none';
			}
			else
			{
				var box=l('gardenDrag').getBounds();
				var x=Game.mouseX-box.left-24;
				var y=Game.mouseY-box.top-32+TopBarOffset;
				var seed=M.plantsById[M.seedSelected];
				var icon=[0,seed.icon];
				M.cursorL.style.transform='translate('+(x)+'px,'+(y)+'px)';
				M.cursorL.style.backgroundPosition=(-icon[0]*48)+'px '+(-icon[1]*48)+'px';
				M.cursorL.style.display='block';
			}
		}
		if (Game.drawT%10==0)
		{
			M.lumpRefill.style.display='block';
			if (M.freeze) l('gardenNextTick').innerHTML=loc("Garden is frozen. Unfreeze to resume.");
			else l('gardenNextTick').innerHTML=loc("Next tick in %1.",Game.sayTime((M.nextStep-Date.now())/1000*30+30,-1));
			l('gardenStats').innerHTML=loc("Mature plants harvested: %1 (total: %2)",[Beautify(M.harvests),Beautify(M.harvestsTotal)]);
			if (M.parent.level<M.plotLimits.length) l('gardenPlotSize').innerHTML='<small>'+loc("Plot size: %1<br>(Upgrades with farm level)",Math.max(1,Math.min(M.plotLimits.length,M.parent.level))+'/'+M.plotLimits.length)+'</small>';
			else l('gardenPlotSize').innerHTML='';
			l('gardenSeedsUnlocked').innerHTML=loc("Seeds")+'<small> ('+M.plantsUnlockedN+'/'+M.plantsN+')</small>';
			for (var i in M.soils)
			{
				var me=M.soils[i];
				if (M.parent.amount<me.req) l('gardenSoil-'+me.id).classList.add('disabled');
				else l('gardenSoil-'+me.id).classList.remove('disabled');
			}
		}
	}
		M.getPlantDesc=function(me)
		{
			var children='';
			if (me.children.length>0)
			{
				children+='<div class="shadowFilter" style="display:inline-block;">';
				for (var i in me.children)
				{
					if (!M.plants[me.children[i]]) console.log('No plant named '+me.children[i]);
					else
					{
						var it=M.plants[me.children[i]];
						if (it.unlocked) children+='<div class="gardenSeedTiny" style="background-position:'+(-0*48)+'px '+(-it.icon*48)+'px;"></div>';
						else children+='<div class="gardenSeedTiny" style="background-image:url('+Game.resPath+'img/icons.png?v='+Game.version+');background-position:'+(-0*48)+'px '+(-7*48)+'px;opacity:0.35;"></div>';
					}
				}
				children+='</div>';
			}
			var dragonBoost=1/(1+0.05*Game.auraMult('Supreme Intellect'));
			return '<div class="description">'+
						(!me.immortal?('<div style="margin:6px 0px;font-size:11px;"><b>'+loc("Average lifespan:")+'</b> '+Game.sayTime(((100/(me.ageTick+me.ageTickR/2))*dragonBoost*M.stepT)*30,-1)+' <small>('+loc("%1 tick",LBeautify(Math.ceil((100/((me.ageTick+me.ageTickR/2)/dragonBoost))*(1))))+')</small></div>'):'')+
						'<div style="margin:6px 0px;font-size:11px;"><b>'+loc("Average maturation:")+'</b> '+Game.sayTime(((100/((me.ageTick+me.ageTickR/2)))*(me.mature/100)*dragonBoost*M.stepT)*30,-1)+' <small>('+loc("%1 tick",LBeautify(Math.ceil((100/((me.ageTick+me.ageTickR/2)/dragonBoost))*(me.mature/100))))+')</small></div>'+
						(me.weed?'<div style="margin:6px 0px;font-size:11px;"><b>'+(EN?"Is a weed":loc("Weed"))+'</b></div>':'')+
						(me.fungus?'<div style="margin:6px 0px;font-size:11px;"><b>'+(EN?"Is a fungus":loc("Fungus"))+'</b></div>':'')+
						(me.detailsStr?('<div style="margin:6px 0px;font-size:11px;"><b>'+loc("Details:")+'</b> '+me.detailsStr+'</div>'):'')+
						(children!=''?('<div style="margin:6px 0px;font-size:11px;"><b>'+loc("Possible mutations:")+'</b> '+children+'</div>'):'')+
						'<div class="line"></div>'+
						'<div style="margin:6px 0px;"><b>'+loc("Effects:")+'</b> <span style="font-size:11px;">('+loc("while plant is alive; scales with plant growth")+')</span></div>'+
						'<div style="font-size:11px;font-weight:bold;">'+me.effsStr+'</div>'+
						(me.q?('<q>'+me.q+'</q>'):'')+
					'</div>';
		}
		M.tools['convert'].desc=loc("A swarm of sugar hornets comes down on your garden, <span class=\"red\">destroying every plant as well as every seed you've unlocked</span> - leaving only a %1 seed.<br>In exchange, they will grant you <span class=\"green\">%2</span>.<br>This action is only available with a complete seed log.",[loc("Baker's wheat"),loc("%1 sugar lump",LBeautify(30))]);
		M.convert=function()
		{
			if (M.plantsUnlockedN<M.plantsN) return false;
			M.harvestAll();
			for (var i in M.plants){M.lockSeed(M.plants[i]);}
			M.unlockSeed(M.plants['bakerWheat']);
			
			Game.gainLumps(30);
			Game.Notify(loc("Sacrifice!"),loc("You've sacrificed your garden to the sugar hornets, destroying your crops and your knowledge of seeds.<br>In the remains, you find <b>%1 sugar lumps</b>.",30),[29,14],12);
			
			M.seedSelected=-1;
			Game.Win('Seedless to nay');
			M.convertTimes++;
			M.computeMatures();
			PlaySound('snd/spellFail.mp3',0.75);
		}
			

		}, 'Farm');
	Game.rebuildGarden();
	CCSE.MinigameReplacer(function(){
		var objKey = 'Wizard tower';
		var M = Game.Objects[objKey].minigame;

		M.spells['hand of fate'].win=function(){
				
					var newShimmer=new Game.shimmer('golden',{noWrath:true});
					var choices=[];
					choices.push('frenzy','multiply cookies');
					if (!Game.hasBuff('Dragonflight')) choices.push('click frenzy');
					if (Math.random()<0.1) choices.push('cookie storm','cookie storm','blab');
					if (Game.BuildingsOwned>=10 && Math.random()<0.25) choices.push('building special');
					//if (Math.random()<0.2) choices.push('clot','cursed finger','ruin cookies');
					if (Math.random()<0.15) choices=['cookie storm drop'];
					var freesugarlump=0.0001;
					if(Game.Has('Sugar Storm')) freesugarlump*=2;
					if (Math.random()<freesugarlump) choices.push('free sugar lump');
					newShimmer.force=choose(choices);
					if (newShimmer.force=='cookie storm drop')
					{
						newShimmer.sizeMult=Math.random()*0.75+0.25;
					}
					Game.Popup('<div style="font-size:80%;">'+loc("Promising fate!")+'</div>',Game.mouseX,Game.mouseY);
				};
		M.spells['hand of fate'].fail=function()
				{
					var newShimmer=new Game.shimmer('golden',{wrath:true});
					var choices=[];
					choices.push('clot','ruin cookies');
					if (Math.random()<0.1) choices.push('cursed finger','blood frenzy');
					var freesugarlump=0.003;
					if(Game.Has('Sugar Storm')) freesugarlump*=2;
					console.log(freesugarlump);
					if (Math.random()<freesugarlump) choices.push('free sugar lump');
					if (Math.random()<0.1) choices=['blab'];
					newShimmer.force=choose(choices);
					Game.Popup('<div style="font-size:80%;">'+loc("Backfire!")+'<br>'+loc("Sinister fate!")+'</div>',Game.mouseX,Game.mouseY);
				};

	M.draw=function()
	{
		//run each draw frame
		if (Game.drawT%5==0)
		{
			M.magicBarTextL.innerHTML=Math.min(Math.floor(M.magicM),Beautify(M.magic))+'/'+Beautify(Math.floor(M.magicM))+(M.magic<M.magicM?(' ('+loc("+%1/s",Beautify((M.magicPS*Game.effs.magicreg||0)*Game.fps,2))+')'):'');
			M.magicBarFullL.style.width=((M.magic/M.magicM)*100)+'%';
			M.magicBarL.style.width=(M.magicM*3)+'px';
			M.infoL.innerHTML=loc("Spells cast: %1 (total: %2)",[Beautify(M.spellsCast),Beautify(M.spellsCastTotal)]);
		}
		M.magicBarFullL.style.backgroundPosition=(-Game.T*0.5)+'px';
	}
	M.computeMagicM=function()
		{
			M.magic+=5*(Game.effs.magicreg-1)*M.magicPS;
			var towers=Math.max(M.parent.amount,1);
			var lvl=Math.max(M.parent.level,1);
			M.magicM=Math.floor(4+Math.pow(towers,0.6)+Math.log((towers+(lvl-1)*10)/15+1)*15);
			M.magic=Math.min(M.magicM,M.magic);
		}

	},'Wizard tower')
	Game.Objects['Javascript console'].cps = function(me) {
    var mult = 1;
    mult *= Game.GetTieredCpsMult(me);
    mult *= Game.magicCpS(me.name);
	mult *= Game.eff('JSCps');
    for (var i in Game.customBuildings[this.name].cpsMult)
        mult *= Game.customBuildings[this.name].cpsMult[i](me);

    return me.baseCps * mult;
}

	Game.shimmerTypes['golden'].popFunc=function(me)
				{
					//get achievs and stats
					if (me.spawnLead)
					{
						Game.goldenClicks++;
						Game.goldenClicksLocal++;
						
						if (Game.goldenClicks>=1) Game.Win('Golden cookie');
						if (Game.goldenClicks>=7) Game.Win('Lucky cookie');
						if (Game.goldenClicks>=27) Game.Win('A stroke of luck');
						if (Game.goldenClicks>=77) Game.Win('Fortune');
						if (Game.goldenClicks>=777) Game.Win('Leprechaun');
						if (Game.goldenClicks>=7777) Game.Win('Black cat\'s paw');
						if (Game.goldenClicks>=27777) Game.Win('Seven horseshoes');
						
						if (Game.goldenClicks>=7) Game.Unlock('Lucky day');
						if (Game.goldenClicks>=27) Game.Unlock('Serendipity');
						if (Game.goldenClicks>=77) Game.Unlock('Get lucky');
						
						if ((me.life/Game.fps)>(me.dur-1)) Game.Win('Early bird');
						if (me.life<Game.fps) Game.Win('Fading luck');
						
						if (me.wrath) Game.Win('Wrath cookie');
					}
					
					if (Game.forceUnslotGod)
					{
						if (Game.forceUnslotGod('asceticism')) Game.useSwap(1000000);
					}
					
					//select an effect
					var list=[];
					if (me.wrath>0) list.push('clot','multiply cookies','ruin cookies');
					else list.push('frenzy','multiply cookies');
					if (me.wrath>0 && Game.hasGod && Game.hasGod('scorn')) list.push('clot','ruin cookies','clot','ruin cookies');
					if (me.wrath>0 && Math.random()<0.3) list.push('blood frenzy','chain cookie','cookie storm');
					else if (Math.random()<0.03 && Game.cookiesEarned>=100000) list.push('chain cookie','cookie storm');
					if (Math.random()<0.05 && Game.season=='fools') list.push('everything must go');
					if (Math.random()<0.1 && (Math.random()<0.05 || !Game.hasBuff('Dragonflight'))) list.push('click frenzy');
					if (me.wrath && Math.random()<0.1) list.push('cursed finger');
					
					if (Game.BuildingsOwned>=10 && Math.random()<0.25) list.push('building special');
					var freesugarlump=0.0005;
					if(Game.Has('Sugar Frenzy')) freesugarlump*=2;
					if (Game.canLumps() && Math.random()<freesugarlump) list.push('free sugar lump');
					
					if ((me.wrath==0 && Math.random()<0.15) || Math.random()<0.05)
					{
						//if (Game.hasAura('Reaper of Fields')) list.push('dragon harvest');
						if (Math.random()<Game.auraMult('Reaper of Fields')) list.push('dragon harvest');
						//if (Game.hasAura('Dragonflight')) list.push('dragonflight');
						if (Math.random()<Game.auraMult('Dragonflight')) list.push('dragonflight');
					}
					
					if (this.last!='' && Math.random()<0.8 && list.indexOf(this.last)!=-1) list.splice(list.indexOf(this.last),1);//80% chance to force a different one
					if (Math.random()<0.0001) list.push('blab');
					var choice=choose(list);
					
					if (this.chain>0) choice='chain cookie';
					if (me.force!='') {this.chain=0;choice=me.force;me.force='';}
					if (choice!='chain cookie') this.chain=0;
					
					this.last=choice;
					
					//create buff for effect
					//buff duration multiplier
					var effectDurMod=1;
					if (Game.Has('Get lucky')) effectDurMod*=2;
					if (Game.Has('Lasting fortune')) effectDurMod*=1.1;
					if (Game.Has('Lucky digit')) effectDurMod*=1.01;
					if (Game.Has('Lucky number')) effectDurMod*=1.01;
					if (Game.Has('Green yeast digestives')) effectDurMod*=1.01;
					if (Game.Has('Lucky payout')) effectDurMod*=1.01;
					//if (Game.hasAura('Epoch Manipulator')) effectDurMod*=1.05;
					effectDurMod*=1+Game.auraMult('Epoch Manipulator')*0.05;
					if (!me.wrath) effectDurMod*=Game.eff('goldenCookieEffDur');
					else effectDurMod*=Game.eff('wrathCookieEffDur');
					
					if (Game.hasGod)
					{
						var godLvl=Game.hasGod('decadence');
						if (godLvl==1) effectDurMod*=1.07;
						else if (godLvl==2) effectDurMod*=1.05;
						else if (godLvl==3) effectDurMod*=1.02;
					}
					
					//effect multiplier (from lucky etc)
					var mult=1;
					//if (me.wrath>0 && Game.hasAura('Unholy Dominion')) mult*=1.1;
					//else if (me.wrath==0 && Game.hasAura('Ancestral Metamorphosis')) mult*=1.1;
					if (me.wrath>0) mult*=1+Game.auraMult('Unholy Dominion')*0.1;
					else if (me.wrath==0) mult*=1+Game.auraMult('Ancestral Metamorphosis')*0.1;
					if (Game.Has('Green yeast digestives')) mult*=1.01;
					if (Game.Has('Dragon fang')) mult*=1.03;
					if (!me.wrath) mult*=Game.eff('goldenCookieGain');
					else mult*=Game.eff('wrathCookieGain');
					
					var popup='';
					var buff=0;
					
					if (choice=='building special')
					{
						var time=Math.ceil(30*effectDurMod);
						var list=[];
						for (var i in Game.Objects)
						{
							if (Game.Objects[i].amount>=10) list.push(Game.Objects[i].id);
						}
						if (list.length==0) {choice='frenzy';}//default to frenzy if no proper building
						else
						{
							var obj=choose(list);
							var pow=Game.ObjectsById[obj].amount/10+1;
							if (me.wrath && Math.random()<0.3)
							{
								buff=Game.gainBuff('building debuff',time,pow,obj);
							}
							else
							{
								buff=Game.gainBuff('building buff',time,pow,obj);
							}
						}
					}
					
					if (choice=='free sugar lump')
					{
						Game.gainLumps(1);
						popup=loc("Sweet!<br><small>Found 1 sugar lump!</small>");
					}
					else if (choice=='frenzy')
					{
						buff=Game.gainBuff('frenzy',Math.ceil(77*effectDurMod),7);
					}
					else if (choice=='raw frenzy')
					{
						buff=Game.gainBuff('raw frenzy',Math.ceil(27*effectDurMod),1.77);
					}
					else if (choice=='dragon harvest')
					{
						buff=Game.gainBuff('dragon harvest',Math.ceil(60*effectDurMod),15);
					}
					else if (choice=='everything must go')
					{
						buff=Game.gainBuff('everything must go',Math.ceil(8*effectDurMod),5);
					}
					else if (choice=='multiply cookies')
					{
						var moni=mult*Math.min(Game.cookies*0.15,Game.cookiesPs*60*15)+13;//add 15% to cookies owned (+13), or 15 minutes of cookie production - whichever is lowest
						Game.Earn(moni);
						popup=loc("Lucky!")+'<br><small>'+loc("+%1!",loc("%1 cookie",LBeautify(moni)))+'</small>';
					}
					else if (choice=='raw luck')
					{
						var moni=mult*Math.min(Game.cookies*0.05,Game.cookiesPs*60*5)+13;//add 15% to cookies owned (+13), or 15 minutes of cookie production - whichever is lowest
						Game.Earn(moni);
						popup=loc("Raw Luck")+'<br><small>'+loc("+%1!",loc("%1 cookie",LBeautify(moni)))+'</small>';
					}
					else if (choice=='ruin cookies')
					{
						var moni=Math.min(Game.cookies*0.05,Game.cookiesPs*60*10)+13;//lose 5% of cookies owned (-13), or 10 minutes of cookie production - whichever is lowest
						moni=Math.min(Game.cookies,moni);
						Game.Spend(moni);
						popup=loc("Ruin!")+'<br><small>'+loc("Lost %1!",loc("%1 cookie",LBeautify(moni)))+'</small>';
					}
					else if (choice=='blood frenzy')
					{
						buff=Game.gainBuff('blood frenzy',Math.ceil(6*effectDurMod),666);
					}
					else if (choice=='clot')
					{
						buff=Game.gainBuff('clot',Math.ceil(66*effectDurMod),0.5);
					}
					else if (choice=='cursed finger')
					{
						buff=Game.gainBuff('cursed finger',Math.ceil(10*effectDurMod),Game.cookiesPs*Math.ceil(10*effectDurMod));
					}
					else if (choice=='click frenzy')
					{
						buff=Game.gainBuff('click frenzy',Math.ceil(13*effectDurMod),777);
					}
					else if (choice=='raw click frenzy')
					{
						buff=Game.gainBuff('raw click frenzy',Math.ceil(7*effectDurMod),7.77);
					}
					else if (choice=='dragonflight')
					{
						buff=Game.gainBuff('dragonflight',Math.ceil(10*effectDurMod),1111);
						if (Math.random()<0.8) Game.killBuff('Click frenzy');
					}
					else if (choice=='chain cookie')
					{
						//fix by Icehawk78
						if (this.chain==0) this.totalFromChain=0;
						this.chain++;
						var digit=me.wrath?6:7;
						if (this.chain==1) this.chain+=Math.max(0,Math.ceil(Math.log(Game.cookies)/Math.LN10)-10);
						
						var maxPayout=Math.min(Game.cookiesPs*60*60*6,Game.cookies*0.5)*mult;
						var moni=Math.max(digit,Math.min(Math.floor(1/9*Math.pow(10,this.chain)*digit*mult),maxPayout));
						var nextMoni=Math.max(digit,Math.min(Math.floor(1/9*Math.pow(10,this.chain+1)*digit*mult),maxPayout));
						this.totalFromChain+=moni;

						//break the chain if we're above 5 digits AND it's more than 50% of our bank, it grants more than 6 hours of our CpS, or just a 1% chance each digit (update : removed digit limit)
						if (Math.random()<0.01 || nextMoni>=maxPayout)
						{
							this.chain=0;
							popup=loc("Cookie chain")+'<br><small>'+loc("+%1!",loc("%1 cookie",LBeautify(moni)))+'<br>'+loc("Cookie chain over. You made %1.",loc("%1 cookie",LBeautify(this.totalFromChain)))+'</small>';
						}
						else
						{
							popup=loc("Cookie chain")+'<br><small>'+loc("+%1!",loc("%1 cookie",LBeautify(moni)))+'</small>';
						}
						Game.Earn(moni);
					}
					else if (choice=='cookie storm')
					{
						buff=Game.gainBuff('cookie storm',Math.ceil(7*effectDurMod),7);
					}
					else if (choice=='cookie storm drop')
					{
						var moni=Math.max(mult*(Game.cookiesPs*60*Math.floor(Math.random()*7+1)),Math.floor(Math.random()*7+1));//either 1-7 cookies or 1-7 minutes of cookie production, whichever is highest
						Game.Earn(moni);
						popup='<div style="font-size:75%;">'+loc("+%1!",loc('%1 cookie',LBeautify(moni)))+'</div>';
					}
					else if (choice=='blab')//sorry (it's really rare)
					{
						var str=EN?(choose([
						'Cookie crumbliness x3 for 60 seconds!',
						'Chocolatiness x7 for 77 seconds!',
						'Dough elasticity halved for 66 seconds!',
						'Golden cookie shininess doubled for 3 seconds!',
						'World economy halved for 30 seconds!',
						'Grandma kisses 23% stingier for 45 seconds!',
						'Thanks for clicking!',
						'Fooled you! This one was just a test.',
						'Golden cookies clicked +1!',
						'Your click has been registered. Thank you for your cooperation.',
						'Thanks! That hit the spot!',
						'Thank you. A team has been dispatched.',
						'They know.',
						'Oops. This was just a chocolate cookie with shiny aluminium foil.',
						'Eschaton immanentized!',
						'Oh, that tickled!',
						'Again.',
						'You\'ve made a grave mistake.',
						'Chocolate chips reshuffled!',
						'Randomized chance card outcome!',
						'Mouse acceleration +0.03%!',
						'Ascension bonuses x5,000 for 0.1 seconds!',
						'Gained 1 extra!',
						'Sorry, better luck next time!',
						'I felt that.',
						'Nice try, but no.',
						'Wait, sorry, I wasn\'t ready yet.',
						'Yippee!',
						'Bones removed.',
						'Organs added.',
						'Did you just click that?',
						'Huh? Oh, there was nothing there.',
						'You saw nothing.',
						'It seems you hallucinated that golden cookie.',
						'This golden cookie was a complete fabrication.',
						'In theory there\'s no wrong way to click a golden cookie, but you just did that, somehow.',
						'All cookies multiplied by 999!<br>All cookies divided by 999!',
						'Why?',
						'Hatsune Miku?!',
						'A platypus? Perry the platypus!',
						'Are you tonight Free my Sugar Lump ? ;)',
						'Foolish samurai warrior.',
						'Nah, just kidding',
						'Prima Aprilis!',
						'Prima Aprilis! Wait, it\'s not today? Sorry',
						'Another one bite the dust.',
						'When we needed him most he vanished.',
						'Oh no! Anyway...',
						'You gain 0 cookies!',
						'Cookie clickness tripled for minus half second!',
						'YA LIKE JAZZ?',
						'Sorry I ate last one...',
						'That Golden Cookie will be delivered to you in 2 business days',
						'sodium benzoate',
						'Acetabularia',
						'Kinda sus',
						'Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>Maybe i have dementia but,<br>',
						'Maybe i have dementia but, what I was talking about?',
						'I May not have a brain but I have an idea',
						'Sugar-free Sugar lump! Wait...',
						'This Golden cookie was confiscated by grandmatriarchy. Do not underestimate Us.',
						'We are watching you.',
						'Staring contest!',
						'This time Golden Cookie clicked you.',
						'Nonsensiness of this sentence doubled half a time!',
						'Ferenzi!',
						'Locki!',
						'Svveet!',
						'Clack Ferenzi!',
						'blab',
						'blib blub',
						'According to all known laws of aviation, there is no way a bee should be able to fly.<br>Its wings are too small to get its fat little body off the ground.<br>The bee, of course, flies anyway because bees don\'t care what humans think is impossible.',
						'Dragoon fight!',
						'Dragoon haravest!',
						'Hey Vsauce, Michel here.',
						'Look under there!',
						'Vera is coming to your house to defeat you.',
						'Albion online is Sandbox MMORPG in which you get to write your own story instead of just following a liad-out path.',
						'Add skipped!',
						'Everybody do the flop!',
					])):choose(loc("Cookie blab"));
						popup=str;
					}else if (choice=='sugar storm'){
						choices=[];
						choices.push(1);
						if(Math.random()<0.3) choices.push(7);
						if(Math.random()<0.09) choices.push(13);
						if(Math.random()<0.03) choices.push(77);
						if(Math.random()<0.009) choices.push(133);
						if(Math.random()<0.003) choices.push(777);
						free=choose(choices);
						fakelumps+=free;
						floor=Math.floor(Math.pow(free,1.093));
						console.log(floor);
						Game.lumpT+=1000*60*floor;
						Game.gainBuff('sugar addiction',60*floor,1);
						if (free==1)popup=loc("Sweet!<br><small>Found 1 sugar lump!</small>");
						else popup=loc("Sweet!<br><small>Found " +free+ " sugar lumps!</small>");
						if (Game.lumpT>Date.now()){
							if (Game.lumps==0){
								Game.lumpT=Date.now();
							}else{
							Game.lumps=Math.max(Game.lumps-1,0);
							Game.lumpT=Date.now()-Game.lumpRipeAge;
							}


						}
					}
					
					if (popup=='' && buff && buff.name && buff.desc) popup=buff.dname+'<div style="font-size:65%;">'+buff.desc+'</div>';
					if (popup!='') Game.Popup(popup,me.x+me.l.offsetWidth/2,me.y);
					
					Game.DropEgg(0.9);
					
					//sparkle and kill the shimmer
					Game.SparkleAt(me.x+48,me.y+48);
					if (choice=='cookie storm drop')
					{
						if (Game.prefs.cookiesound) PlaySound('snd/clickb'+Math.floor(Math.random()*7+1)+'.mp3',0.75);
						else PlaySound('snd/click'+Math.floor(Math.random()*7+1)+'.mp3',0.75);
					}
					else PlaySound('snd/shimmerClick.mp3');
					me.die();
				};

		

},
	save:function(){
		//output cannot use ",", ";" or "|"
		var objKey = 'Farm';
		var M = Game.Objects[objKey].minigame;
		var str=''+
		parseFloat(M.nextStep)+':'+
		parseInt(M.soil)+':'+
		parseFloat(M.nextSoil)+':'+
		parseInt(M.freeze)+':'+
		parseInt(M.harvests)+':'+
		parseInt(M.harvestsTotal)+':'+
		parseInt(M.parent.onMinigame?'1':'0')+':'+
		parseFloat(M.convertTimes)+':'+
		parseFloat(M.nextFreeze)+':'+
		' ';
		for (var i in M.plants)
		{
			str+=''+(M.plants[i].unlocked?'1':'0');
		}
		str+=' ';
		for (var y=0;y<6;y++)
		{
			for (var x=0;x<6;x++)
			{
				str+=parseInt(M.plot[y][x][0])+':'+parseInt(M.plot[y][x][1])+':';
			}
		}
		return str;
	},
	load:function(str){

		CCSE.MinigameReplacer(function(){
			var objKey = 'Farm';
			var M = Game.Objects[objKey].minigame;
			//interpret str; called after .init
		//note: not actually called in the Game's load; see "minigameSave" in main.js
		if (!str) return false;
		var i=0;
		var spl=str.split(' ');
		var spl2=spl[i++].split(':');
		var i2=0;
		M.nextStep=parseFloat(spl2[i2++]||M.nextStep);
		M.soil=parseInt(spl2[i2++]||M.soil);
		M.nextSoil=parseFloat(spl2[i2++]||M.nextSoil);
		M.freeze=parseInt(spl2[i2++]||M.freeze)?1:0;
		M.harvests=parseInt(spl2[i2++]||0);
		M.harvestsTotal=parseInt(spl2[i2++]||0);
		var on=parseInt(spl2[i2++]||0);if (on && Game.ascensionMode!=1) M.parent.switchMinigame(1);
		M.convertTimes=parseFloat(spl2[i2++]||M.convertTimes);
		M.nextFreeze=parseFloat(spl2[i2++]||M.nextFreeze);
		var seeds=spl[i++]||'';
		if (seeds)
		{
			var n=0;
			for (var ii in M.plants)
			{
				if (seeds.charAt(n)=='1') M.plants[ii].unlocked=1; else M.plants[ii].unlocked=0;
				n++;
			}
		}
		M.plants['bakerWheat'].unlocked=1;
		
		var plot=spl[i++]||0;
		if (plot)
		{
			plot=plot.split(':');
			var n=0;
			for (var y=0;y<6;y++)
			{
				for (var x=0;x<6;x++)
				{
					M.plot[y][x]=[parseInt(plot[n]),parseInt(plot[n+1])];
					n+=2;
				}
			}
		}
		
		M.getUnlockedN();
		M.computeStepT();
		
		M.buildPlot();
		M.buildPanel();
		
		M.computeBoostPlot();
		M.toCompute=true;
		M.getPlantDesc=function(me)
		{
			var children='';
			if (me.children.length>0)
			{
				children+='<div class="shadowFilter" style="display:inline-block;">';
				for (var i in me.children)
				{
					if (!M.plants[me.children[i]]) console.log('No plant named '+me.children[i]);
					else
					{
						var it=M.plants[me.children[i]];
						if (it.unlocked) children+='<div class="gardenSeedTiny" style="background-position:'+(-0*48)+'px '+(-it.icon*48)+'px;"></div>';
						else children+='<div class="gardenSeedTiny" style="background-image:url('+Game.resPath+'img/icons.png?v='+Game.version+');background-position:'+(-0*48)+'px '+(-7*48)+'px;opacity:0.35;"></div>';
					}
				}
				children+='</div>';
			}
			var dragonBoost=1/(1+0.05*Game.auraMult('Supreme Intellect'));
			if (me.name=='???'){
			return '<div class="description">'+
				(!me.immortal?('<div style="margin:6px 0px;font-size:11px;"><b>'+loc("???:")+'</b> '+'???'+' <small>('+loc("??? ???",LBeautify(Math.ceil((100/((me.ageTick+me.ageTickR/2)/dragonBoost))*(1))))+')</small></div>'):'')+
				'<div style="margin:6px 0px;font-size:11px;"><b>'+loc("???:")+'</b> '+"???"+' <small>('+loc("??? ???",LBeautify(Math.ceil((100/((me.ageTick+me.ageTickR/2)/dragonBoost))*(me.mature/100))))+')</small></div>'+
				(me.weed?'<div style="margin:6px 0px;font-size:11px;"><b>'+(EN?"Is a weed":loc("Weed"))+'</b></div>':'')+
				(me.fungus?'<div style="margin:6px 0px;font-size:11px;"><b>'+(EN?"Is a fungus":loc("Fungus"))+'</b></div>':'')+
				(me.detailsStr?('<div style="margin:6px 0px;font-size:11px;"><b>'+loc("???:")+'</b> '+me.detailsStr+'</div>'):'')+
				(children!=''?('<div style="margin:6px 0px;font-size:11px;"><b>'+loc("???:")+'</b> '+children+'</div>'):'')+
				'<div class="line"></div>'+
				'<div style="margin:6px 0px;"><b>'+loc("???:")+'</b> <span style="font-size:11px;">('+loc("???")+')</span></div>'+
				'<div style="font-size:11px;font-weight:bold;">'+me.effsStr+'</div>'+
				(me.q?('<q>'+me.q+'</q>'):'')+
				'</div>';}else{
			return '<div class="description">'+
						(!me.immortal?('<div style="margin:6px 0px;font-size:11px;"><b>'+loc("Average lifespan:")+'</b> '+Game.sayTime(((100/(me.ageTick+me.ageTickR/2))*dragonBoost*M.stepT)*30,-1)+' <small>('+loc("%1 tick",LBeautify(Math.ceil((100/((me.ageTick+me.ageTickR/2)/dragonBoost))*(1))))+')</small></div>'):'')+
						'<div style="margin:6px 0px;font-size:11px;"><b>'+loc("Average maturation:")+'</b> '+Game.sayTime(((100/((me.ageTick+me.ageTickR/2)))*(me.mature/100)*dragonBoost*M.stepT)*30,-1)+' <small>('+loc("%1 tick",LBeautify(Math.ceil((100/((me.ageTick+me.ageTickR/2)/dragonBoost))*(me.mature/100))))+')</small></div>'+
						(me.weed?'<div style="margin:6px 0px;font-size:11px;"><b>'+(EN?"Is a weed":loc("Weed"))+'</b></div>':'')+
						(me.fungus?'<div style="margin:6px 0px;font-size:11px;"><b>'+(EN?"Is a fungus":loc("Fungus"))+'</b></div>':'')+
						(me.detailsStr?('<div style="margin:6px 0px;font-size:11px;"><b>'+loc("Details:")+'</b> '+me.detailsStr+'</div>'):'')+
						(children!=''?('<div style="margin:6px 0px;font-size:11px;"><b>'+loc("Possible mutations:")+'</b> '+children+'</div>'):'')+
						'<div class="line"></div>'+
						'<div style="margin:6px 0px;"><b>'+loc("Effects:")+'</b> <span style="font-size:11px;">('+loc("while plant is alive; scales with plant growth")+')</span></div>'+
						'<div style="font-size:11px;font-weight:bold;">'+me.effsStr+'</div>'+
						(me.q?('<q>'+me.q+'</q>'):'')+
					'</div>';
				}
		}
		M.logic=function()
	{
		//run each frame
		var now=Date.now();
		
		if (!M.freeze)
		{
			M.nextStep=Math.min(M.nextStep,now+(M.stepT)*1000);
			if (Math.random()<M.effs.skipsec) M.nextStep-=1000;
			if (now>=M.nextStep)
			{
				M.computeStepT();
				M.nextStep=now+M.stepT*1000;
				
				M.computeBoostPlot();
				M.computeMatures();
				
				var weedMult=M.soilsById[M.soil].weedMult;
				
				var dragonBoost=1+0.05*Game.auraMult('Supreme Intellect');
				
				var loops=1;
				if (M.soilsById[M.soil].key=='woodchips') loops=3;
				loops=randomFloor(loops*dragonBoost);
				loops*=M.loopsMult;
				M.loopsMult=1;
			
				for (var y=0;y<6;y++)
				{
					for (var x=0;x<6;x++)
					{
						if (M.isTileUnlocked(x,y))
						{
							var tile=M.plot[y][x];
							var me=M.plantsById[tile[0]-1];
							if (tile[0]>0)
							{
								//age
								tile[1]+=randomFloor((me.ageTick+me.ageTickR*Math.random())*M.plotBoost[y][x][0]*dragonBoost);
								tile[1]=Math.max(tile[1],0);
								if (me.immortal) tile[1]=Math.min(me.mature+1,tile[1]);
								else if (tile[1]>=100)
								{
									//die of old age
									M.plot[y][x]=[0,0];
									if (me.onDie) me.onDie(x,y);
									if (M.soilsById[M.soil].key=='pebbles' && Math.random()<0.35)
									{
										if (M.unlockSeed(me)) Game.Popup(loc("Unlocked %1 seed.",me.name),Game.mouseX,Game.mouseY);
									}
								}
								else if (!me.noContam)
								{
									//other plant contamination
									//only occurs in cardinal directions
									//immortal plants and plants with noContam are immune
									
									var list=[];
									for (var i in M.plantContam)
									{
										if (Math.random()<M.plantContam[i] && (!M.plants[i].weed || Math.random()<weedMult)) list.push(i);
									}
									var contam=choose(list);

									if (contam && me.key!=contam)
									{
										if ((!M.plants[contam].weed && !M.plants[contam].fungus) || Math.random()<M.plotBoost[y][x][2])
										{
											var any=0;
											var neighs={};//all surrounding plants
											var neighsM={};//all surrounding mature plants
											for (var i in M.plants){neighs[i]=0;}
											for (var i in M.plants){neighsM[i]=0;}
											var neigh=M.getTile(x,y-1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
											var neigh=M.getTile(x,y+1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
											var neigh=M.getTile(x-1,y);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
											var neigh=M.getTile(x+1,y);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
											
											if (neighsM[contam]>=1) M.plot[y][x]=[M.plants[contam].id+1,0];
										}
									}
								}
							}
							else
							{
								//plant spreading and mutation
								//happens on all 8 tiles around this one
								for (var loop=0;loop<loops;loop++)
								{
									var any=0;
									var neighs={};//all surrounding plants
									var neighsM={};//all surrounding mature plants
									for (var i in M.plants){neighs[i]=0;}
									for (var i in M.plants){neighsM[i]=0;}
									var neigh=M.getTile(x,y-1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
									var neigh=M.getTile(x,y+1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
									var neigh=M.getTile(x-1,y);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
									var neigh=M.getTile(x+1,y);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
									var neigh=M.getTile(x-1,y-1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
									var neigh=M.getTile(x-1,y+1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
									var neigh=M.getTile(x+1,y-1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
									var neigh=M.getTile(x+1,y+1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
									if (any>0)
									{
										var muts=M.getMuts(neighs,neighsM);
										
										var list=[];
										for (var ii=0;ii<muts.length;ii++)
										{
											if (Math.random()<muts[ii][1] && (!M.plants[muts[ii][0]].weed || Math.random()<weedMult) && ((!M.plants[muts[ii][0]].weed && !M.plants[muts[ii][0]].fungus) || Math.random()<M.plotBoost[y][x][2])) list.push(muts[ii][0]);
										}
										if (list.length>0) M.plot[y][x]=[M.plants[choose(list)].id+1,0];
									}
									else if (loop==0)
									{
										//weeds in empty tiles (no other plants must be nearby)
										var chance=0.002*weedMult*M.plotBoost[y][x][2];
										if (Math.random()<chance) M.plot[y][x]=[M.plants['meddleweed'].id+1,0];
									}
								}
							}
						}
					}
				}
				M.toRebuild=true;
				M.toCompute=true;
			}
		}
		if (M.toRebuild) M.buildPlot();
		if (M.toCompute) M.computeEffs();
		
		if (Game.keys[27])//esc
		{
			if (M.seedSelected>-1) M.plantsById[M.seedSelected].l.classList.remove('on');
			M.seedSelected=-1;
		}
	}
		},'Farm')
	},	
}
if(!MyMod.isLoaded){
	if(CCSE && CCSE.isLoaded){
		MyMod.launch();
	}
	else{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(MyMod.launch);
	}
}
