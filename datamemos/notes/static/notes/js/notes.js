Note = Backbone.Model.extend({
	urlRoot:"/notes/",
	url:function(){
		if(this.get("id")) return this.urlRoot + this.get("id");
		return this.urlRoot;
	},
	defaults:{
		editable: false,
		id:false,
		text:"",
		author:"",
		pub_date:"",
		bookmarks:new BookmarkList(),
		url:"",
		activeness:0
	},
	initialize: function(){
		
	},
	parse: function(data){
		
		var bookmarks = new BookmarkList();
		if( this.attributes ){
			bookmarks = this.get("bookmarks");
		}
		
		if(data['bookmarks']){
			bookmarks.reset();
			_(data['bookmarks']).forEach(function(bm){
				bookmarks.add(bm,{
					parse:true
				});
			});
			data['bookmarks'] = bookmarks;
		}else{
			data['bookmarks'] = bookmarks;
		}
		
		return data;
	},
	get_activeness: function(){
		var activeness =  _(this.get("bookmarks").map(function(bookmark){
			return bookmark.count_selected();
		})).max(function(count){
			return count;
		});
		this.set("activeness",activeness);
		return activeness;
	},
	share: function(){
		this.trigger("share",this);
	}
});

NoteItem = Backbone.View.extend({
	events:{
		'click a.share':'share'
	},
	initialize: function(options){
		this.template = _.template($("#note-template").html());
		this.container = options.container;
		this.$container = $(this.container);
		this.render();
		
		var view = this;
		this.model.bind("change:activeness",function(note){
			if(note.get("activeness") > 1) view.$el.addClass("active-more");
			if(note.get("activeness") > 0) view.$el.addClass("active");
			else view.$el.removeClass("active").removeClass("active-more");
		});
	},
	render: function(){
		var note_id = this.model.get("id");
		if($("#note-"+note_id,this.$container).length > 0){
			this.setElement($("note-"+note_id,this.$container)[0]);
		}else{
			var new_el = this.template(this.model.toJSON());
			this.setElement(new_el);
			this.$el.appendTo(this.$container);
		}
	},
	share:function(event){
		event.preventDefault();
		this.model.share();
	}
});

NoteType = Backbone.Model.extend({
	defaults:{
		active:false,
		name:"",
		short:"",
		public:false
	},
	toggle: function(){
		if(this.get("active")){
			this.set("active",false);
			return false;
		}
		this.set("active",true);
		return true;
	}
});

NoteTypeList = Backbone.Collection.extend({
	model:NoteType,
	initialize: function(options){
		this.bind("change:active",function(note_type){
			if(note_type.get("active")){
				_(this.without(note_type)).forEach(function(note_type){
					note_type.set("active",false);
				});
				this.trigger("note-type-changed",note_type);
			}
		});
	}
});

NoteEdit = Backbone.View.extend({
	events:{
		'click .modal-footer .btn-primary':'submit',
		'submit form':'submit',
		'hidden': 'remove'
	},
	initialize: function(options){
		var edit_view = this;
		this.template = _.template($("#note-edit-template").html());
		
		this.loading_div = '<div class="loading"></div>';
		
		this.setElement(this.loading_div);
		
		this.bind('remove',function(){
			this.$el.remove();
		});
		
		var url = '/notes/create/';
		if(this.model.get("id")){
			url = '/notes/'+this.model.get("id")+'/edit/';
		}
		$.ajax({
			url:url,
			type:"GET",
			data_type:"JSON",
			data:{
				json:true
			},
			success: function(data){
				if(data['form']){
					edit_view.show_form(data['form']);
				}
			}
		});
	},
	remove: function(){
		this.$el.remove();
		this.trigger("remove");
	},
	submit: function(event){
		event.preventDefault();
		var edit_view = this;
		var form = this.$('form');
		
		if(this.$('form input[name="bookmarks"]').length < 1){
			this.$('form').append('<input name="bookmarks" type="hidden" value="" />');
		}
		this.$('form input[name="bookmarks"]').val(this.model.get("bookmarks").map(function(bookmark){
			return bookmark.get("id");
		}).join(","));
		
		this.$el.remove();
		this.setElement(this.loading_div);
		$.ajax({
			url:form.attr("action"),
			type:form.attr("method"),
			data:form.serialize(),
			success: function(data){
				if(data['form']){
					edit_view.show_form(data['form']);
				}
				if(data['id']){
					if(!edit_view.model.get("id")){
						edit_view.model.set("id",data['id']);
					}
					edit_view.trigger("remove");
					edit_view.trigger("saved",edit_view.model);
				}
			},
			error: function(data){
				if(data['form']){
					edit_view.show_form(data['form']);
				}
			}
		});
	},
	show_form: function(markup){
		this.$el.remove();
		this.setElement(this.template({
			form: markup
		}));
		if(this.container){
			this.$el.appendTo(this.container);
		}
	}
});

NoteShare = Backbone.View.extend({
	events:{
		'hidden': 'remove_modal'
	},
	initialize: function(options){
		this.template = _.template($("#note-share-template").html());
	},
	render: function(){
		this.setElement(this.template(this.model.toJSON()));
		this.$el.modal();
	},
	remove_modal: function(){
		this.$el.remove();
	}
});