function make_ticks(min,max,amount){
	ticks = [];
	range = max - min;
	step = range/(amount-1);
	num = min;
	while(step && num<=max && amount>=0){
		ticks.push(num);
		num += step;
		amount--;
	}
	return ticks;
}

function array_max(arr,value_function){
	max = 0;
	for(index in arr){
		value = value_function(arr[index]);
		if(value > max){
			max = value;
		}
	}
	return Number(max);
}
function array_sum(arr,value_function){
	total = 0;
	for(index in arr){
		value = value_function(arr[index]);
		if(value){
			total += value;
		}
	}
	return total;
}

function format_number(num){
	return Math.round(num);
}

function in_array(arr,value){
	for(var i=0;i<arr.length;i++){
		if(arr[i]==value){
			return true;
		}
	}
	return false;
}

function find_values(obj,action,parent){
	for(index in obj){
		value = obj[index];
		if(value && typeof value == "object" && 
			!(value instanceof Date || value instanceof RegExp)){
				find_values(obj[index],action,index);
		}
		else if(action){
			action(value,index,parent);
		}
	}
}

function fill_in_values(obj){
	if(!obj){
		obj = {};
	}
	if(!obj.filter){
		obj.filter = unescape($.address.parameter("filter"));
	}
	if(!obj.highlight){
		obj.highlight = unescape($.address.parameter("highlight"));
	}
	if(!obj.percent){
		obj.percent = $.address.parameter("percent");
	}
	return obj;
}