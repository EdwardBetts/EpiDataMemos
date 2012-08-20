$(document).ready(function(){
	$("#notes-edit").delegate(".notes-nav a","click",function(event){
		event.preventDefault();
		var button = $(this);
		$("li.active",button.parents(".notes-nav:first")).removeClass("active");
		button.parents("li:first").addClass("active");
	}).delegate(".notes-nav .create-note","click",function(event){
		event.preventDefault();
		var button = $(this);
		if($("form.note.create").length>0){
			return;
		}
		$.ajax({
			url:note_create_uri,
			type:"GET",
			success:function(data){
				if(data['form']){
					$("#notes-edit .notes-container").html(data['form']);
					var close_bttn = '<a href="#" class="close"><i></i>Close</a>';
					$("#notes-edit .notes-container").prepend(close_bttn).append(close_bttn);
				}
			}
		});
	}).delegate(".notes-container .close","click",function(event){
		event.preventDefault();
		$("#notes-edit .notes-container").html("");
		$("#notes-edit .notes-nav .active ").removeClass("active");
	}).delegate("form.note.create","submit",function(event){
		event.preventDefault();
		var form = $(this);
		form.addClass("loading");
		form.trigger("presubmit");
		$.ajax({
			url:note_create_uri,
			type:"POST",
			data:form.serialize(),
			success:function(data){
				if(data['form']){
					form.after(data['form']);
					form.remove();
					return;
				}
				if(data['message']){
					form.before('<span class="alert '+data['message']['type']+'">'+data['message']['text']+'</span>');
				}
				if(data['note']){
					if(data['note']['markup']){
						form.after(data['note']['markup']);	
					}
					if(data['note']['type']){
						$("#notes-list .notes-nav a[note-type='"+data['note']['type']+"']").click();
					}
				}
				form.remove();
				$("#notes-edit .notes-nav .active").removeClass("active");
			}
		});
	})
	$("#note-container").delegate(".note .edit","click",function(event){
		event.preventDefault();
		var note = $(this).parents(".note:first");
		$("#notes-edit .notes-container").html("");
		$.ajax({
			url:'/notes/'+note.attr("note-id")+"/edit/",
			type:"POST",
			success:function(data){
				if(data['form']){
					$("#notes-edit .notes-container").html(data['form']);
				}
				if(data['message']){
					$("#notes-edit .notes-container").prepend('<span class="alert '+data['message']['type']+'">'+data['message']['text']+'</span>');
				}
				var close_bttn = '<a href="#" class="close"><i></i>Close</a>';
				$("#notes-edit .notes-container").prepend(close_bttn).append(close_bttn);
			}
		})
	});	
});