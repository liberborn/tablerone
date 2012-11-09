/* *************************************************
 *
 *  Tablerone - table interface
 *  
 *
 * *************************************************
 */



var tablerone = {

  pageParams : {
    sort : '',
    page : '1',
    filter : '',
    type : ''
  },

  params : {
    sortOrder : '',
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

  setURLParameter : function(param, paramVal) {
    var url = window.location.href,
      newAddURL = "",
      tempArr = url.split("?"),
      baseURL = tempArr[0],
      addURL = tempArr[1];

    if (addURL) {
      tempArr = addURL.split('&');

      for (var i=0; i < tempArr.length; i++) {
        if (tempArr[i].split('=')[0] != param) {
          newAddURL += '&' + tempArr[i];
        } else {
          newAddURL += '&' + param + '=' + paramVal;
        }
      }
    }

    var newURL = (baseURL + "?" + newAddURL).replace('?&', '?');
    window.history.pushState({}, "", newURL);
  },

  getPageParams : function() {
    for (var key in this.pageParams){
      this.pageParams[key] = this.getURLParameter(key);
    }
  },

  setPageParam : function(key, value){
    this.pageParams[key] = value;
  },

  render : function() {

    var tplTable =  
        '<table class="table table-hovered table-fixed-header table-tablerone">' +
          '<thead class="header">' +
            '{theadRows}' +
          '</thead>' +
          '<tbody>' +
            '{tbodyRows}' +
          '</tbody>' +
        '</table>';

    var theadData = this.renderThead(this.params.data.thead);
    var tbodyData = this.renderTbody(this.params.data.tdata);

    tplTable = tplTable.replace('{theadRows}', theadData);
    tplTable = tplTable.replace('{tbodyRows}', tbodyData);

    tplTable += this.renderPagination();

    $("#" + this.params.id).html(tplTable);

    $('.table-fixed-header').fixedHeader();

    this.getPageParams();
  },  

  renderThead : function(rowsArr){
    var rows = '<tr>';

    for (var i = 0, m = rowsArr.length; i < m; i++) {
      rows += '<td><span data-title="' + rowsArr[i].title + '">' + rowsArr[i].label + '</span></td>';
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

    var pages = "",
      firstPage = this.params.firstPage,
      currPage = this.params.currPage,
      lastPage = this.params.lastPage,
      pagePeriod = this.params.pagePeriod;

    var cls = (firstPage == currPage) ? 'disabled' : '';
    pages += '<li class="' + cls + '"><a href="#">&#8592; Ctrl</a></li>';

    for (var i = firstPage, m = pagePeriod; i <= m; i++) {
      cls = (i == currPage) ? 'active' : '';
      pages += '<li class="' + cls + '"><a href="#">' + i + '</a></li>';
    }

    pages += '<li class="disabled"><a href="#">...</a></li>';
    
    cls = (lastPage == currPage) ? 'active' : '';
    pages += '<li class="' + cls + '"><a href="#">' + lastPage + '</a></li>';

    cls = (lastPage == currPage) ? 'disabled' : '';
    pages += '<li class="' + cls + '"><a href="#">Ctrl &#8594;</a></li>';

    tpl = tpl.replace('{pages}', pages);

    return tpl;
  },

  toggleSortOrder : function(p) {
    var order = this.params.sortOrder;

    if (order === 'asc') {
      order = 'desc';
    } else {
      order = 'asc';
    }

    this.params.sortOrder = order;
    this.setURLParameter('sort', p + '=' + order);
  },

  theadOrder : function(e, me) {

    $("#" + me.params.id + ' thead span').removeClass("order-asc").removeClass("order-desc");
    var cls = (me.params.sortOrder == 'asc') ? 'order-asc' : 'order-desc';
    $(e).addClass(cls);
  },

  pageGo : function(p, me) {
    p = parseInt(p);
    me.params.currPage = p;
    me.setPageParam("page", p);

    var pages = me.renderPagination();
    $('#' + me.params.id +  ' .pagination').replaceWith(pages);
    me.onPageClick();

    me.setURLParameter('page', p);
  },

  onTheadClick : function() {
    var me = this;

    $("#" + me.params.id + ' thead span').on('click', onClick);

    function onClick(e) {
      var title = $(e).attr('data-title');
      me.toggleSortOrder(title);
      me.theadOrder(this, me);
    }
  },

  onPageClick : function() {
    var me = this;

    $('#' + me.params.id +  ' .pagination li:not(.disabled) a').on('click', onClick);
    $('#' + me.params.id +  ' .pagination li.disabled a').on('click', function(){ return false; });

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
    this.onTheadClick();
    this.onPageClick();
  },

  init : function(params){
    this.params.id = params.id;
    this.params.data = params.data;
    this.render();
    this.events();
  }
};


