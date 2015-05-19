/*import dependencies, import classes */
var Engine = famous.core.Engine;
var Modifier = famous.core.Modifier;
var Transform = famous.core.Transform;
var Surface = famous.core.Surface;
var GridLayout = famous.views.GridLayout;
var Easing = famous.transitions.Easing;
var StateModifier = famous.modifiers.StateModifier;
var View = famous.core.View;
var Transitionable = famous.transitions.Transitionable;
var SpringTransition = famous.transitions.SpringTransition;
var MouseSync = famous.inputs.MouseSync;
var TouchSync = famous.inputs.TouchSync;
var ScrollSync = famous.inputs.ScrollSync;
var GenericSync = famous.inputs.GenericSync;
var SnapTransition = famous.transitions.SnapTransition;

/* register methods */
Transitionable.registerMethod('spring', SpringTransition); // register spring transition to SpringTransition object with method 'spring'
Transitionable.registerMethod("spring", SnapTransition); // register spring transition to SnapTransition object with method 'spring'
//register mouse, touch scroll Sync
GenericSync.register({
	"mouse"  : MouseSync, //for computer
	"touch"  : TouchSync, //for touch screen devices
	"scroll" : ScrollSync //for scroll
});

/*========================= define necessary variables and objects =========================*/
//effectAry contains 20+ effects which will be randomly applied to transform in modifier for each surface, by a random index
var effectAry =["inQuad","outQuad","inOutQuad","inCubic","outCubic","inOutCubic","inQuart",
	"outQuart","inOutQuart","inQuint","outQuint","inOutQuint","inSine",
	"outSine","inOutSine","inExpo","outCirc","inOutCirc","inElastic","inBack","outBack","inOutBack","inBounce","outBounce","inOutBounce"];

//inputWords is an ary that contains "Hello World!"
var inputWords = "Hello World!".split('');

//mainContext that will be added in surfaces, grid, and views
var mainContext = Engine.createContext();

// position for Sync objects
var position = new Transitionable([0, 0]);

//create a modifier for position
var positionModifier = new Modifier({
	transform : function(){
		var currentPosition = position.get();
		return Transform.translate(currentPosition[0], currentPosition[1], 0);
	}
});

//instantiate a GenericSync object
var sync = new GenericSync({
	"mouse"  : {}, //default
	"touch"  : {}, //defulat
	"scroll" : {scale : .3} // 0.3 makes scrolling more realistic
});

//instantiate grid object
var grid = new GridLayout();

//surfaceAry array contains the surfaces
var surfaceAry = [];

//view array contains surface modifiers and the surfaces
var view = [];

//spring is for chaining animation for surface
var spring = {
	method: 'spring', //spring method which was registered to SpringTransition object
	period: 1200,
	dampingRatio: 0.1
};


/*========================= main content created here =========================*/

//this for loop creates the surfaceAry based on the length of the word (the hello world!)
for(var index = 0; index < inputWords.length; index++){

	surfaceAry.push(new Surface({ //pushing surface to the array
		content: inputWords[index],
		size: [undefined, 100], //100 makes the letters go down more
		properties:{
			color: colorChange(),
			textAlign:'center',
			fontSize: '64px',
			fontWeight: 'bold',
			marginTop: '0px',
			fontFamily: 'serif'
		}
	}));//end of surfaceAry.push()

	//pipe each element in surfaceAry to the GenericSync object
	surfaceAry[index].pipe(sync);

	//create a new stateModifier for each surface
	var stateModifier = new StateModifier({
		align:[0.7, 0], //parent element (starting position)
		origin:[0.6, 0.5]//child element (starting position from parent)
	});


	// temp is a string, "Easing.returnedEffect"
	var temp = "Easing." + effectAry[rangeGenerator(effectAry.length)];
	stateModifier.setTransform(
		Transform.translate((rangeGenerator(81) - 40), 200, 0), //rangeGenerator generates number from -40 to 80
		{duration: 1200, curve:eval(temp)} //eval takes out the " " around the string
	);

	//chaining modifier, effect after the one above
	stateModifier.setTransform(
		Transform.translate(0, 180, 0), spring
	);

	//using view to contains stateModifier and surfaces and will be added to grid after this loop
	view.push(new View());
	view[index].add(stateModifier).add(surfaceAry[index]);

}//end of for loop


/*========================= event handled =========================*/
//this update event allows users to move the words
sync.on('update', function(data){
	var currentPosition = position.get();
	position.set([
		currentPosition[0] + data.delta[0], //keeping track of horizontal move
		currentPosition[1] + data.delta[1] //keeping track of vertical move
	]);
});

//this end event makes words go back to origin
sync.on('end', function(data){
	var velocity = data.velocity; //velocity relative to scroll speed
	position.set([0, 0], {
		method : 'spring', //spring method that
		period : 800,
		velocity : velocity
	});
});

//resize event checks changing on window size
Engine.on('resize',function(){
	gridResponse();
});



/*========================= helper functions =========================*/

//check window size, if < 780, grid will be made to 2 rows
function gridResponse(){
	if(window.innerWidth < 780){
		grid.setOptions({dimensions: [Math.ceil((inputWords.length)/2), 4]});
	}else{
		grid.setOptions({dimensions: [inputWords.length, 2]});

	}
}

//keep the color of each letter changing
var colorChangeInterval = setInterval(function(){
	keepColorChange();
}, 300);

function keepColorChange(){
	for (var i = 0; i < surfaceAry.length; i++){
		surfaceAry[i].setProperties({color: colorChange()});
	}
}

//colorChange function returns random rgb
function colorChange(){
	var r = Math.floor((Math.random() * 300) + 1);
	var g = Math.floor((Math.random() * 200) + 1);
	var b = Math.floor((Math.random() * 200) + 1);
	return "rgb(" + r + "," + g + "," + b + ")";
}

//used by modifier and random index for effectAry
function rangeGenerator(range){
	return Math.floor((Math.random() * range));
}

//stop the color changing, prevent overhead
setTimeout(function(){
	clearInterval(colorChangeInterval);
}, 15000);

/*========================= adding content to mainContext =========================*/
//check window size when page is loaded
gridResponse();

//set grid listing the view array
grid.sequenceFrom(view);

//add positionModifier for scroll
mainContext.add(positionModifier).add(grid);


