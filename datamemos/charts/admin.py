from models import Chart, Tag, Point, Footnote
from django.contrib import admin

from adminsortable.admin import SortableAdmin,SortableTabularInline

from django.core.exceptions import ObjectDoesNotExist
from parse_data import parse_data_file

class FootnoteInline(SortableTabularInline):
	model = Footnote
	extra = 1
	fields = ("title","description")

class ChartAdmin(admin.ModelAdmin):
	list_display = ['title', 'pub_date' ,'published']
	ordering = ['pub_date']
	actions = ['parse_charts_xls']
	inlines = [FootnoteInline]

	def parse_charts_xls(self, request, queryset):
		count = 0
		for chart in queryset:
			if parse_xls_to_points(chart):
				count += 1
		if count == 1:
			message_bit = "1 chart was"
		else:
			message_bit = "%s charts were" % count
		self.message_user(request, "%s successfully marked as published." % message_bit)
	parse_charts_xls.short_description = "Regenerate points from Xls"

admin.site.register(Chart,ChartAdmin)

class TagInline(SortableTabularInline):
	model = Tag
	extra = 1
	fields = ("short","name")

class TagAdmin(SortableAdmin):
	inlines = [TagInline]
	actions = ['combine_tags']
	
	def combine_tags(self,request,queryset):
		if queryset.count() < 2:
			self.message_user(request,"Not enough arguments to combine")
		else:
			count = 0
			old_tag = False
			for tag in queryset:
				if old_tag:
					tag.transfer_to(old_tag)
				else:
					old_tag = tag
				count += 1
			self.message_user(request, "%s tags were successfully merged." % count)
	combine_tags.short_description = "Merge Tags"

admin.site.register(Tag,TagAdmin)



def parse_xls_to_points(chart):
	if not chart or not bool(chart.xls):
		return False
	chart.point_set.all().delete()
	data = parse_data_file(chart.xls.read())
	add_tags_and_points(chart,data)
	return True

def add_tags_and_points(chart,data,tags = []):
	for key in data:
		try:
			tag = Tag.objects.get(short=key)
		except ObjectDoesNotExist:
			tag = Tag(short=key)
			tag.save()
		value = data[key]
		if isinstance(value, int):
			point = Point(value=value)
			point.chart = chart
			point.save()
			point.tags.add(tag)
			for t in tags:
				point.tags.add(t)
		else:
			add_tags_and_points(chart,value,[tag]+tags)