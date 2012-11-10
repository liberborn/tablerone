/* *************************************************
 *
 *    Tablerone - table interface
 *    
 *
 * *************************************************
 */


var tl = {};

tl.model = function(){ 
    return {    

    id : "",
    data : {},
    thead : "",
    tdata : "",
    
    filter : false,

    sort : {
        enabled : false,
        title : '',
        order : ''
    },

    pages : {
        enabled :    false,
        sortOrder :  '',
        firstPage :  1,
        lastPage :   18,
        pagePeriod : 4,
        currPage :   1
    },

    url : {
        sort : '',
        order : '',
        page : '1',
        filter : '',
        type : '',

        get : function() {
            for (var key in this){
                this[key] = this.getParam(key);
            }
        },

        set : function(key, value){
            this[key] = value;
        },

        getParam : function(name){
            return decodeURIComponent(
                (location.search.match(RegExp("[?|&]" + name + "=(.+?)(&|$)"))||[,""])[1]);
        },

        setParam : function(param, paramVal) {
            var url = window.location.href,
                newAddURL = "",
                tempArr = url.split("?"),
                baseURL = tempArr[0],
                addURL = tempArr[1];

            if (addURL) {
                tempArr = addURL.split('&');

                for (var i = 0; i < tempArr.length; i++) {
                    if (tempArr[i].split('=')[0] != param) {
                        newAddURL += '&' + tempArr[i];
                    } else {
                        newAddURL += '&' + param + '=' + paramVal;
                    }
                }
            } else {
                newAddURL += param + '=' + paramVal;
            }

            if (newAddURL.indexOf(param) === -1) {
                newAddURL += '&' + param + '=' + paramVal;
            }

            var newURL = (baseURL + "?" + newAddURL).replace('?&', '?');
            newURL.replace('#', '');

            window.history.pushState({}, "", newURL);
        }
    },

    init : function(obj){
        this.id = obj.id;

        this.filter.enabled = (obj.filter) ? obj.filter.enabled : false;
        this.sort.enabled = (obj.sort) ? obj.sort.enabled : false;
        this.pages.enabled = (obj.pages) ? obj.pages.enabled : false;

        this.thead = obj.data.thead;
        this.tdata = obj.data.tdata;
    }

    }
};

tl.util = {
    isInt : function(input){
        return ((input - 0) == input && input % 1==0);
    }
}

tl.router = {

    me : {},

    filter : function(){
        if (this.me.model.filter.enabled) { 
            this.me.view.renderFilter(); 
        }
    },

    pages : function(){
        if (this.me.model.pages.enabled) { 
            this.me.view.renderPages( this.me.model.pages ); 
        }
    },

    setSortOrder : function(title, el) {
        var m = this.me.model,
            v  = this.me.view,
            order = m.sort.order;

        if (order === 'asc') {
            order = 'desc';
        } else {
            order = 'asc';
        }

        this.me.model.sort.title = title;
        this.me.model.sort.order = order;

        m.url.set('sort', title);
        m.url.set('order', order);
        m.url.setParam('sort', title + '=' + order);

        v.setSortOrder(order, el, m.id);
    },

    setPage : function(p) {
        var m = this.me.model,
            v = this.me.view
        
        p = parseInt(p);

        m.pages.currPage = p;
        m.url.setParam("page", p);

        v.renderPages( m.pages, true, m.id );
        this.onPageClick();
    },

    onSortClick : function() {
        var me = this;

        function onSortClickEvent() {
            var title = $(this).attr('data-title');
            me.setSortOrder(title, this);
        }

        $('.table-tablerone thead span').on('click', onSortClickEvent);
    },

    onPageClick : function() {
        var me = this;

        function onPageClickEvent() {
            var p = this.innerHTML,
                util = me.me.util,
                currPage = me.me.model.pages.currPage;

            if (util.isInt(p)) {
                me.setPage(p);

            } else if ( p.indexOf('Ctrl') > 0) { // prev
                me.setPage(currPage - 1);

            } else if ( p.indexOf('Ctrl') == 0 ) { // next
                me.setPage(currPage + 1);

            }
            return false;
        }

        $('.pagination li:not(.disabled) a').on('click', onPageClickEvent);
        $('.pagination li.disabled a').on('click', function(){ return false; });
    },

    events : function() {
        if (this.me.model.sort) {
            this.onSortClick(); 
        }

        if (this.me.model.pages) {
            this.onPageClick();
        }
    },

    init : function(me) {
        this.me = me;
        this.me.view.me = me;

        var view = me.view;

        view.renderThead( this.me.model.thead );
        view.renderTbody( this.me.model.thead, this.me.model.tdata );
        view.renderTable();

        this.filter();
        this.pages();

        view.render( this.me.model.id );
        this.events();
    }    
};


tl.view = {

    thead : "",
    tdata : "",
    table : "",
    filter : "",
    pages : "",

    renderThead : function(thead){
        var html = '<tr>';

        for (var i = 0, m = thead.length; i < m; i++) {
            var cls = (thead[i].cls != undefined) ? thead[i].cls : '';
            html += '<th class="' + cls + '"><span data-title="' + thead[i].title + '">' + thead[i].label + '</span></th>';
        }
        html += '</tr>';

        this.thead = html;
    },

    renderItem : function(item, type){

        if (type === 'link') {
            item = '<a href="#">' + item + '</a>';
        } 
        else if (type === 'btn-circle') {
            var circle = '';
            for (var i = 0, m = item.length; i < m; i++) {
                circle += '<span class="btn-circle btn-circle-color-' + i + '">' + item[i] + "</span>";
            }
            item = circle;
        }

        return item;
    },

    renderTbody : function(thead, tdata){

        var html = '';

        for (var i = 0, m = tdata.length; i < m; i++) {
            html += '<tr>';

            for (var j = 0, n = tdata[i].length; j < n; j ++) {
                var item = tdata[i][j], 
                    type = thead[j].type;
                html += '<td>' + this.renderItem(item, type) + '</td>';
            }
            html += '</tr>';
        }

        this.tdata = html;
    },

    renderFilter : function(obj) {

    },

    renderPages : function(obj, replace, id) {
        var tpl = '<div class="pagination">' +
                      '<ul>' +
                          '{pages}'
                      '</ul>' +
                  '</div>';

        var pages = "",
            firstPage  = obj.firstPage,
            currPage   = obj.currPage,
            lastPage   = obj.lastPage,
            pagePeriod = obj.pagePeriod;

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

        this.pages = tpl;

        if (replace) {
            $('#' + id + ' .pagination').replaceWith(this.pages);
        }
    },

    renderTable : function() {
        var tpl = '<table class="table table-hovered table-fixed-header table-tablerone">' +
                    '<thead class="header">' +
                        '{theadRows}' +
                    '</thead>' +
                    '<tbody>' +
                        '{tbodyRows}' +
                    '</tbody>' +
                  '</table>';

        tpl = tpl.replace('{theadRows}', this.thead);
        tpl = tpl.replace('{tbodyRows}', this.tdata);

        this.table = tpl;
    },

    render : function(id)
    {
        $("#" + id).html(this.filter + this.table + this.pages);
        $('.table-fixed-header').fixedHeader();
    },

    setSortOrder : function(order, el, id) {
        $("#" + id + ' thead span').removeClass("order-asc").removeClass("order-desc");
        var cls = (order == 'asc') ? 'order-asc' : 'order-desc';
        $(el).addClass(cls);
    }
};

function tablerone(obj) {
    this.model = new tl.model();
    this.model.init(obj);

    this.util = tl.util;
    this.router = tl.router;
    this.view = tl.view;

    this.router.init(this);
}
