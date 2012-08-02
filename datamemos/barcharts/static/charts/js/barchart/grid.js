$(document).ready(function(){
	$("#chart").bind("ext-draw",function(){
		$(".chart",$(this)).prepend('<div class="grid"></div>');
		$(".chart .grid",$(this)).css("top",$(".chart",$(this)).css("padding-top"));
	}).delegate(".grid","grid_redraw",function(event){
		event = fill_in_values(event);
		var grid = $(this);
		var graph = grid.parents(".chart:first");
		var chart = grid.parents("#chart:first");
		if(!event.chart_max){
			return true;
		}
		var ticks = make_ticks(0,event.chart_max,5);
		for(var i=0;i<ticks.length;i++){
			tick = ticks[i];
			if($(".grid .tick[data-value='"+tick+"']",graph).length<1){
				$(".grid").append('<div class="tick" data-value="'+tick+'">'+format_number(tick,event.percent)+'</div>');
				$(".grid .tick:last").css("top",graph.height()+'px').css("opacity",0);
			}
		}
		
		$(".grid .tick",graph).each(function(){
			var tick = $(this);
			var opacity = 1;
			if(!in_array(ticks,tick.data("value"))){
				var opacity = 0;
			}
			if(!event.chart_max){
				return true;
			}
			tick.animate({
				top:(graph.height()-(graph.height()*(tick.data("value")/event.chart_max)))+'px',
				opacity:opacity
			},{
				duration:700,
				queue:false
			});
		});	
	});
});