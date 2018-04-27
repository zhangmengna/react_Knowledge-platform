let throttle = function(fn,context,delay){
	clearTimeout(fn.timer);
	fn._cur = Date.now();
	if(!fn._start){ fn._start = fn._cur }
	if(fn._cur - fn._start > delay){
		fn.call(context);
		fn._start = fn._cur
	}else{
		fn.timer = setTimeout(function(){
			fn.call(context);
		},delay)
	}
}

export default throttle;