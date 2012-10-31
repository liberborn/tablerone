var tablerone = {

	pageParams : {
		"sort" : "",
		"page" : "1",
		"filter" : "",
		"type" : ""
	},

	params : {
		firstPage  : 1,
		lastPage   : 18,
		pagePeriod : 4,
		currPage : 1
	},

	util : {
		isInt : function(input){
   			return ((input - 0) == input && input % 1==0);
		}
	},

	getURLParameter : function(name){
		return decodeURIComponent(
			(location.search.match(RegExp("[?|&]"+name+"=(.+?)(&|$)"))||[,""])[1]
			);        
	},

	setURLParameter : function(url, param, paramVal) {
		var newAdditionalURL = "";
		var tempArray = url.split("?");
		var baseURL = tempArray[0];
		var additionalURL = tempArray[1];
		var temp = "";
		if (additionalURL) {
			tempArray = additionalURL.split("&");
			for (i=0; i<tempArray.length; i++){
				if(tempArray[i].split('=')[0] != param){
					newAdditionalURL += temp + tempArray[i];
					temp = "&";
				}
			}
		}

		var rows_txt = temp + "" + param + "=" + paramVal;
		return baseURL + "?" + newAdditionalURL + rows_txt;
	},

	getPageParams : function() {
		for (var key in this.pageParams){
			this.pageParams[key] = this.getURLParameter(key);
		}
	},

	setPageParam : function(key, value){
		this.pageParams[key] = value;
	},

	renderThead : function(rowsArr){
		var rows = '<tr>';

		for (var i = 0, m = rowsArr.length; i < m; i++) {
			rows += '<td><span>' + rowsArr[i] + '</span></td>';
		}
		rows += '</tr>';

		return rows;
	},

	renderTbody : function(rowsArr){
		var rows = '';

		for (var i = 0, m = rowsArr.length; i < m; i++) {
			rows += '<tr>';
			for (var j = 0, n = rowsArr[i].length; j < n; j ++) {
				rows += '<td>' + rowsArr[i][j] + '</td>';
			}
			rows += '</tr>';
		}

		return rows;
	},


	renderPagination : function() {

		var tpl = 
			'<div class="pagination">' +
				'<ul>' +
					'{pages}'
				'</ul>' +
			'</div>';

		var pages = "";

		var cls = (this.params.firstPage == this.params.currPage) ? 'disabled' : '';
		pages += '<li class="' + cls + '"><a href="#">&#8592; Ctrl</a></li>';

		for (var i = this.params.firstPage, m = this.params.pagePeriod; i <= m; i++) {
			cls = (i == this.params.currPage) ? 'active' : '';
			pages += '<li class="' + cls + '"><a href="#">' + i + '</a></li>';
		}

		pages += '<li class="disabled"><a href="#">...</a></li>';
		
		cls = (this.params.lastPage == this.params.currPage) ? 'active' : '';
		pages += '<li class="' + cls + '"><a href="#">' + this.params.lastPage + '</a></li>';

		cls = (this.params.lastPage == this.params.currPage) ? 'disabled' : '';
		pages += '<li class="' + cls + '"><a href="#">Ctrl &#8594;</a></li>';

		tpl = tpl.replace('{pages}', pages);

		return tpl;
	},

	pageGo : function(p, me) {
		p = parseInt(p);
		me.params.currPage = p;
		me.setPageParam("page", p);

		var pages = me.renderPagination();
		$('#' + me.params.id +  ' .pagination').replaceWith(pages);

		var newURL = me.setURLParameter(window.location.href, 'page', p);
		window.location.href = newURL;

		return;
	},

	onPageClick : function() {
		var me = this;

		$('#' + me.params.id +  ' .pagination li:not(.disabled) a').live("click", onClick);
		$('#' + me.params.id +  ' .pagination li.disabled a').live("click", function(){ return false; });

		function onClick(e) {
			var p = this.innerHTML;
			if (me.util.isInt(p)) {
				me.pageGo(p, me);
			} else if ( p.indexOf('Ctrl') > 0) { // prev
				me.pageGo(me.params.currPage - 1, me);
			} else if ( p.indexOf('Ctrl') == 0 ) { // next
				me.pageGo(me.params.currPage + 1, me);
			}
			return false;
		}
	},

	events : function() {
		this.onPageClick();
	},

	render : function(id, data){

		var tplTable =	
				'<table class="table table-hovered table-fixed-header table-tablerone">' +
					'<thead class="header">' +
						'{theadRows}' +
					'</thead>' +
					'<tbody>' +
						'{tbodyRows}' +
					'</tbody>' +
				'</table>';

		var theadData = this.renderThead(data.thead);
		var tbodyData = this.renderTbody(data.tdata);

		tplTable = tplTable.replace('{theadRows}', theadData);
		tplTable = tplTable.replace('{tbodyRows}', tbodyData);

		tplTable += this.renderPagination();

		$("#" + id).html(tplTable);

		$('.table-fixed-header').fixedHeader();

		this.getPageParams();
		console.log(this.pageParams);

		this.events();
	},

	init : function(param){
		this.params.id = param.id;
		this.params.data = param.data;
		this.render(param.id, param.data);
	}
};